import * as Logger from 'js-logger'
import { AwsCredentials, AwsMetadata } from '../models/aws-metadata'
import { WebPlayerEvent } from '../enums/web-player-event'
import $ from 'jquery'
import { ApiGatewayAccess } from '../access/api-gateway-access'
import { EventUtil } from '../util/event-util'
import { PlaybackParams } from '../models/playback-params'
import throttle from 'lodash/throttle'
import { LogUtil } from '../util/log-util'

/**
 * This class handles sending requests directly from the web player to the API Gateway.
 * This includes requests such as:
 *  - Refresh IAM Credentials
 *  - Update video current position
 *  - Get next/previous episode (for episodic content)
 *
 * Example: a video ends - this will publish a web player end event.
 */
export class ApiGatewayController {
  constructor () {
    this.logger = Logger.get('api-gateway-controller')
    this.awsMetadata = new AwsMetadata()
    this.refreshInterval = 1000 * 60 * 25 // IAM credentials expire after 1 hour. Refresh the credentials every 25 minutes.
    this.credentialRefreshTimer = null
    this.videoMetadata = null
  }

  /**
   * Performs the initialization of the video controller
   */
  init () {
    this.logger.info('initialize the API Gateway controller')
    this.setWebPlayerEventHandlers()
    this.credentialRefreshTimer = setTimeout(this.refreshAwsCredentials.bind(this), this.refreshInterval)
    this.updateVideoProgressThrottled = throttle(ApiGatewayAccess.updateVideoProgress, 15000, {
      trailing: true,
      leading: false
    })
  }

  /**
   * Set the web player event handlers
   */
  setWebPlayerEventHandlers () {
    $('body')
      .on(WebPlayerEvent.AWS_METADATA_UPDATE, this.handleWebPlayerAwsMetadataUpdateEvent.bind(this))
      .on(WebPlayerEvent.NEXT, this.handleWebPlayerNextOrPreviousEvent.bind(this))
      .on(WebPlayerEvent.PREVIOUS, this.handleWebPlayerNextOrPreviousEvent.bind(this))
      .on(WebPlayerEvent.TIME_UPDATE, this.webPlayerVideoProgressUpdateEventHandler.bind(this))
      .on(WebPlayerEvent.SET_SEEK_POSITION, this.webPlayerSetSeekPositionEventHandler.bind(this))
      .on(WebPlayerEvent.ADJUST_SEEK_POSITION, this.webPlayerAdjustSeekPositionEventHandler.bind(this))
      .on(WebPlayerEvent.LOAD, this.webPlayerLoadEventHandler.bind(this))
      .on(WebPlayerEvent.CLOSE, this.webPlayerCleanUpAndCloseEventHandler.bind(this))
  }

  /**
   * Request a new set of aws credentials from the lambda via the API Gateway
   *
   * @param {object} evt jQuery event
   * @returns {Promise<object>} A promise that resolves with a new set of AWS credentials
   */
  refreshAwsCredentials (evt) {
    if (this.awsMetadata.apiGatewayId && this.awsMetadata.region && this.awsMetadata.credentials) {
      this.logger.info('refreshing aws credentials')
      return ApiGatewayAccess.retrieveNewAwsStsCredentials(this.awsMetadata.apiGatewayId, this.awsMetadata.region, this.awsMetadata.credentials)
        .then(credentials => {
          this.awsMetadata.credentials = AwsCredentials.fromObject(credentials)
          this.logger.info('refreshed aws credentials')
        })
        .catch(err => {
          this.logger.error('could not refresh aws credentials', err)
          this.awsMetadata.credentials = {}
        })
        .finally(() => {
          this.credentialRefreshTimer = setTimeout(this.refreshAwsCredentials.bind(this), this.refreshInterval)
        })
    } else {
      this.logger.warn('unable to refresh aws credentials due to missing credentials, region, or api gateway id parameter')
      this.credentialRefreshTimer = setTimeout(this.refreshAwsCredentials.bind(this), this.refreshInterval)
    }
  }

  webPlayerLoadEventHandler (evt, playbackParams) {
    this.logger.info('handling a web player load event')
    const videoInfo = playbackParams.contentUri
    this.videoMetadata = videoInfo.videoMetadata
  }

  /**
   * Get a playback context token given a videoId and trigger a load event to play that video. This is intended to be used
   * for playing previous or next episodes.
   *
   * @param {object} evt jQuery event
   * @param {string} videoId Video Id
   * @returns {Promise<object>} An empty promise for unit testing
   */
  handleWebPlayerNextOrPreviousEvent (evt, videoId) {
    this.logger.info('Handling a web player next/previous event', videoId)
    return ApiGatewayAccess.getPlaybackContextTokenForVideoId(this.awsMetadata.apiGatewayId, this.awsMetadata.region, this.awsMetadata.credentials, videoId)
      .then(playbackContextToken => {
        const playbackParams = new PlaybackParams({
          accessToken: null,
          tokenRefreshIntervalInMilliseconds: null,
          contentUri: playbackContextToken,
          offsetInMilliseconds: 0,
          autoPlay: true
        })
        EventUtil.triggerLoadEvent(playbackParams)
      })
  }

  /**
   * Handle web player AWS metadata update event
   *
   * @param {object} evt A jQuery event
   * @param {object} metadata Metadata containing temporary AWS credentials
   */
  handleWebPlayerAwsMetadataUpdateEvent (evt, metadata) {
    this.logger.info('Handling a web player aws metadata update event')
    if (metadata.credentials) {
      this.awsMetadata.credentials = AwsCredentials.fromObject(metadata.credentials)
      LogUtil.cloudWatchLogsUtil.cloudWatchCredentialsReceived = true
    }
    if (metadata.region) {
      this.awsMetadata.region = metadata.region
    }
    if (metadata.apiGatewayId) {
      this.awsMetadata.apiGatewayId = metadata.apiGatewayId
    }
    LogUtil.cloudWatchLogsUtil.configure(metadata)
  }

  webPlayerVideoProgressUpdateEventHandler (evt, params) {
    const positionInMilliseconds = params.positionInMilliseconds
    const videoId = params.videoId
    this.logger.debug('handling an api gateway time update event', positionInMilliseconds, videoId)
    return this.updateVideoProgressThrottled(this.awsMetadata.apiGatewayId, this.awsMetadata.region, this.awsMetadata.credentials, videoId, positionInMilliseconds)
  }

  /**
   * Handle web player adjust seek position events.
   * Set seek position events: set the time position of the video to a specific time relative to the start of the video.
   *
   * @param {object} evt JQuery event
   * @param {number} positionInMilliseconds Position in milliseconds
   * @returns {Promise<object>} A thenable promise
   */
  webPlayerSetSeekPositionEventHandler (evt, positionInMilliseconds) {
    this.logger.info('handling a web player set seek position event', positionInMilliseconds, this.videoMetadata.id)
    return ApiGatewayAccess.updateVideoProgress(this.awsMetadata.apiGatewayId, this.awsMetadata.region, this.awsMetadata.credentials, this.videoMetadata.id, positionInMilliseconds)
  }

  /**
   * Handle web player adjust seek position events
   * Adjust seek position events to modify the time position of the video relative to the current time position.
   *
   * @param {object} evt JQuery event
   * @param {number|string} offsetInMilliseconds Offset in milliseconds
   * @returns {Promise<object>} A thenable promise
   */
  webPlayerAdjustSeekPositionEventHandler (evt, offsetInMilliseconds) {
    const seekBarElement = document.getElementById('seekBar')
    const seekBarValue = $(seekBarElement).val()
    const positionInMilliseconds = seekBarValue * this.videoMetadata.runTimeInMilliseconds / 100
    this.logger.info('handling a web player adjust seek position event', positionInMilliseconds, this.videoMetadata.id)
    return ApiGatewayAccess.updateVideoProgress(this.awsMetadata.apiGatewayId, this.awsMetadata.region, this.awsMetadata.credentials, this.videoMetadata.id, positionInMilliseconds)
  }

  /**
   * Handles web player close event
   */
  webPlayerCleanUpAndCloseEventHandler () {
    this.logger.info('handling a web player cleanup and close event')
    if (this.credentialRefreshTimer) {
      this.logger.info('Stopping AWS credentials refresh and CloudWatch logging')
      // Clear the credentials refresh timer
      clearTimeout(this.credentialRefreshTimer)
      this.credentialRefreshTimer = null

      // Stop creating web player logs
      LogUtil.cloudWatchLogsUtil.flushLogRecordCache()
      LogUtil.cloudWatchLogsUtil.cloudWatchLogsEnabled = false
    }
  }
}
