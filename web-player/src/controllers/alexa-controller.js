import * as Logger from 'js-logger'
import { AlexaEvent } from '../enums/alexa-event'
import { PlaybackParams } from '../models/playback-params'
import { EventUtil } from '../util/event-util'
import { PlayerStateModel } from '../models/player-state-model'
import { WebPlayerEvent } from '../enums/web-player-event'
import { PlayerState } from '../enums/player-state'
import $ from 'jquery'
import { ContentType } from '../enums/content-type'
import throttle from 'lodash/throttle'
import { ErrorType } from '../enums/error-type'

/**
 * This class handles events from Alexa itself. It then republishes those events as
 * web player events that are listened to in other components of the web player such as
 * the UI Controller and the Video Controller.
 *
 * This class also handles the initialization process for when the web player is first loaded.
 */
export class AlexaController {
  constructor () {
    this.logger = Logger.get('alexa-controller')
    this._alexaInterface = null
    this.videoMetadata = null
  }

  /**
   * Performs the initialization of the Alexa controller
   */
  init () {
    this.logger.info('initialize the alexa controller')
    AlexaWebPlayerController.initialize(this.initializeReadyCallback.bind(this), this.initializeErrorCallback.bind(this))
    this.setPlayerStateThrottled = throttle(this.setPlayerState, 15000, { trailing: true, leading: false })
  }

  /**
   * `readyCallback` callback for initialize web player controller
   * Notably, this will:
   *  - Register alexa event handlers (required on start)
   *  - Register web player event handlers
   *  - Set the player state to IDLE (required on start)
   *  - Hide the loading overlay (required to show web player UI)
   *
   * @param {object} alexaInterface Alexa Interface
   */
  initializeReadyCallback (alexaInterface) {
    this._alexaInterface = alexaInterface

    this.logger.info('setting handlers for alexa generated events')
    this.setAlexaEventHandlers()

    this.logger.info('setting handlers for web player events')
    this.setupWebPlayerHandlers()

    this.logger.info('setting the player state to IDLE')
    const playerState = new PlayerStateModel(PlayerState.IDLE)
    this.setPlayerState(playerState)

    // The loading overlay will never go away unless this is called
    this.logger.info('hiding the loading overlay')
    this._alexaInterface.showLoadingOverlay(false)

    // This is for the device emulator
    window.alexaController = this
  }

  /**
   * `errorCallback` Callback for initialize web player controller
   * Logs the error message.
   *
   * @param {*} error Error
   */
  initializeErrorCallback (error) {
    this.logger.error('error', error)
  }

  /**
   *
   * Configure event handlers for events originating from Alexa.
   * Example: the utterance "Alexa Pause" could trigger a PAUSE event.
   */
  setAlexaEventHandlers () {
    this.alexaHandlers = {
      [AlexaEvent.LOAD_CONTENT]: (params) => {
        this.logger.info('handling an alexa load content event')
        return Promise.resolve(EventUtil.triggerLoadEvent(new PlaybackParams(params)))
      },
      [AlexaEvent.PAUSE]: () => {
        this.logger.info('handling an alexa pause event')
        return Promise.resolve(EventUtil.triggerPauseEvent())
      },
      [AlexaEvent.RESUME]: () => {
        this.logger.info('handling an alexa resume event')
        return Promise.resolve(EventUtil.triggerResumeEvent())
      },
      [AlexaEvent.PREPARE_FOR_CLOSE]: () => {
        this.logger.info('handling an alexa prepare for close event')
        return Promise.resolve(EventUtil.triggerPrepareForCloseEvent())
      },
      [AlexaEvent.SET_SEEK_POSITION]: (positionInMilliseconds) => {
        this.logger.info('handling an alexa set seek position event', positionInMilliseconds)
        return Promise.resolve(EventUtil.triggerSetSeekPositionEvent(positionInMilliseconds))
      },
      [AlexaEvent.ADJUST_SEEK_POSITION]: (offsetInMilliseconds) => {
        this.logger.info('handling an alexa adjust seek position event', offsetInMilliseconds)
        return Promise.resolve(EventUtil.triggerAdjustSeekPositionEvent(offsetInMilliseconds))
      },
      [AlexaEvent.NEXT]: () => {
        this.logger.info('handling an alexa next event')
        if (this.videoMetadata.nextEpisode) {
          return Promise.resolve(EventUtil.triggerNextEvent(this.videoMetadata.nextEpisode.id))
        } else {
          return Promise.resolve()
        }
      },
      [AlexaEvent.PREVIOUS]: () => {
        this.logger.info('handling an alexa previous event')
        if (this.videoMetadata.previousEpisode) {
          return Promise.resolve(EventUtil.triggerPreviousEvent(this.videoMetadata.previousEpisode.id))
        } else {
          return Promise.resolve()
        }
      },
      [AlexaEvent.CLOSED_CAPTIONS_STATE_CHANGE]: (closedCaptionState) => {
        this.logger.info('handling an alexa close captions state change event')
        return Promise.resolve(EventUtil.triggerClosedCaptionsStateChangeEvent(closedCaptionState))
      },
      [AlexaEvent.ACCESS_TOKEN_CHANGE]: (accessToken) => {
        this.logger.info('handling an alexa access token change event')
        return Promise.resolve(EventUtil.triggerAccessTokenChangeEvent(accessToken))
      }
    }
    this._alexaInterface.on(this.alexaHandlers)
  }

  /**
   * Configure even handlers for events originating from within the web player itself
   * example: a video is in the buffering state
   */
  setupWebPlayerHandlers () {
    $('body')
      .on(WebPlayerEvent.LOAD, this.webPlayerLoadEventHandler.bind(this))
      .on(WebPlayerEvent.PAUSED, this.webPlayerPausedHandler.bind(this))
      .on(WebPlayerEvent.PREPARE_FOR_CLOSE, this.webPlayerPrepareForCloseEventHandler.bind(this))
      .on(WebPlayerEvent.BUFFERING, this.webPlayerBufferingEventHandler.bind(this))
      .on(WebPlayerEvent.PLAYING, this.webPlayerPlayingEventHandler.bind(this))
      .on(WebPlayerEvent.END, this.webPlayerEndEventHandler.bind(this))
      .on(WebPlayerEvent.IDLE, this.webPlayerIdleEventHandler.bind(this))
      .on(WebPlayerEvent.CLOSE, this.webPlayerCloseEventHandler.bind(this))
      .on(WebPlayerEvent.TIME_UPDATE, this.webPlayerTimeUpdateEventHandler.bind(this))
      .on(WebPlayerEvent.ERROR, this.webPlayerErrorEventHandler.bind(this))
      .on(WebPlayerEvent.ACCESS_TOKEN_CHANGE, this.webPlayerHandleAccessTokenChangeEvent.bind(this))
  }

  /**
   * Inform Alexa of the current web player state
   *
   * @param {object} playerState Player State
   */
  setPlayerState (playerState) {
    this.logger.info(`setting player state to "${playerState.state}", position in milliseconds: "${playerState.positionInMilliseconds}"`)
    this._alexaInterface.setPlayerState(playerState)
  }

  /**
   * When content is loaded, inform Alexa of the allowed operations and content metadata
   *
   * @param {object} evt JQuery Event
   * @param {object} playbackParams Playback Params
   */
  webPlayerLoadEventHandler (evt, playbackParams) {
    this.logger.info('handling a web player load event')
    try {
      // Track the access token provided by Alexa
      const accessToken = playbackParams.accessToken
      if (accessToken) {
        EventUtil.triggerAccessTokenChangeEvent(accessToken)
      }
      const videoInfo = playbackParams.contentUri
      this.videoMetadata = videoInfo.videoMetadata

      let metadata = null
      let allowedOperations = null
      if (this.videoMetadata.webPlayerContentType === ContentType.TV_SERIES_EPISODE) {
        metadata = {
          type: ContentType.TV_SERIES_EPISODE,
          value: {
            name: this.videoMetadata.name,
            closedCaptions: {
              available: !!this.videoMetadata.closedCaptionsFile
            },
            durationInMilliseconds: this.videoMetadata.runTimeInMilliseconds,
            series: {
              name: this.videoMetadata.name,
              seasonNumber: this.videoMetadata.seasonNumber
            },
            episode: {
              number: this.videoMetadata.episodeNumber,
              name: this.videoMetadata.episodeName
            }
          }
        }
        allowedOperations = {
          adjustRelativeSeekPositionForward: true,
          adjustRelativeSeekPositionBackwards: true,
          setAbsoluteSeekPositionForward: true,
          setAbsoluteSeekPositionBackwards: true,
          next: true,
          previous: true
        }
      } else if (this.videoMetadata.webPlayerContentType === ContentType.VIDEO) {
        const isChannel = !!this.videoMetadata.networkDetails

        metadata = {
          type: ContentType.VIDEO,
          value: {
            name: this.videoMetadata.name,
            closedCaptions: {
              available: !!this.videoMetadata.closedCaptionsFile
            },
            durationInMilliseconds: this.videoMetadata.runTimeInMilliseconds
          }
        }
        allowedOperations = {
          adjustRelativeSeekPositionForward: !isChannel,
          adjustRelativeSeekPositionBackwards: !isChannel,
          setAbsoluteSeekPositionForward: !isChannel,
          setAbsoluteSeekPositionBackwards: !isChannel,
          next: false,
          previous: false
        }
      }
      if (metadata) {
        this._alexaInterface.setMetadata(metadata)
      } else {
        this.logger.warn(`Unable to set metadata with content type ${this.videoMetadata.webPlayerContentType}`)
      }
      if (allowedOperations) {
        this._alexaInterface.setAllowedOperations(allowedOperations)
      } else {
        this.logger.warn(`Unable to set allowed operations with content type ${this.videoMetadata.webPlayerContentType}`)
      }

      if (videoInfo.aws) {
        this.logger.info('Setting aws metadata')
        EventUtil.triggerAwsMetadataUpdateEvent(videoInfo.aws)
      } else {
        this.logger.info('Not setting aws metadata because it is not available')
      }
    } catch (err) {
      this.logger.error('There was an error handling the alexa load content directive', err)
      EventUtil.triggerErrorEvent('There was an error playing the video', ErrorType.SERVER_ERROR)
    }
  }

  /**
   * Handle a paused event from the web player
   *
   * @param {object} evt JQuery Event
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  webPlayerPausedHandler (evt, positionInMilliseconds) {
    this.logger.info('handling a web player paused event')
    const playerState = new PlayerStateModel(PlayerState.PAUSED, positionInMilliseconds)
    this.setPlayerState(playerState)

    // Reset the timer if it is running from previous pause event
    AlexaController.webPlayerCleanupTimerReset()

    // Setting the web player inactivity timer for 5 minutes
    AlexaController.webPlayerTimeOut = setTimeout(() => {
      this.logger.info('closing web player due to inactivity for 5 minutes')
      EventUtil.triggerWebPlayerCloseEvent()
    }, 300000)
  }

  static set webPlayerTimeOut (_webPlayerTimeOut) {
    this._webPlayerTimeOut = _webPlayerTimeOut
  }

  static get webPlayerTimeOut () {
    return this._webPlayerTimeOut
  }

  /**
   * Handle a prepare for close event from the web player
   *
   * @param {object} evt JQuery Event
   */
  webPlayerPrepareForCloseEventHandler (evt) {
    this.logger.info('handling a web player prepare for close event')
    // Add additional analytics or closure logic here
    // ...
  }

  /**
   * Handle a buffering event from the web player
   *
   * @param {object} evt JQuery Event
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  webPlayerBufferingEventHandler (evt, positionInMilliseconds) {
    this.logger.info('handling a web player buffering event')
    const playerState = new PlayerStateModel(PlayerState.BUFFERING, positionInMilliseconds)
    this.setPlayerState(playerState)
  }

  /**
   * Handle a playing event from the web player
   *
   * @param {object} evt JQuery Event
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  webPlayerPlayingEventHandler (evt, positionInMilliseconds) {
    this.logger.info('handling a web player playing event')
    const playerState = new PlayerStateModel(PlayerState.PLAYING, positionInMilliseconds)
    this.setPlayerState(playerState)
  }

  /**
   * Handle an end event from the web player
   *
   * @param {object} evt JQuery Event
   */
  webPlayerEndEventHandler (evt) {
    this.logger.info('handling a web player end event')
    const playerState = new PlayerStateModel(PlayerState.IDLE)
    this.setPlayerState(playerState)
    this._alexaInterface.close()
  }

  /**
   * Handle an idle event from the web player
   *
   * @param {object} evt JQuery Event
   */
  webPlayerIdleEventHandler (evt) {
    this.logger.info('handling a web player idle event')
    const playerState = new PlayerStateModel(PlayerState.IDLE)
    this.setPlayerState(playerState)
  }

  /**
   * Handle a close event from the web player
   *
   * @param {object} evt JQuery Event
   */
  webPlayerCloseEventHandler (evt) {
    this.logger.info('handling a web player close event')
    this._alexaInterface.close()
  }

  /**
   * Handle a time update event from the web player
   *
   * @param {object} evt JQuery Event
   * @param {object} params Parameters containing positionInMilliseconds and duration
   */
  webPlayerTimeUpdateEventHandler (evt, params) {
    const positionInMilliseconds = params.positionInMilliseconds
    this.logger.debug('handling a web player time update event', positionInMilliseconds)
    const playerState = new PlayerStateModel(PlayerState.PLAYING, parseInt('' + positionInMilliseconds, 10))
    if (params.noThrottle) {
      this.setPlayerState(playerState)
    } else {
      this.setPlayerStateThrottled(playerState)
    }
  }

  /**
   * Handle web player error events
   *
   * @param {object} evt jQuery event
   * @param {object} err An object with keys `message` and `type` for the error message and error type respectively
   */
  webPlayerErrorEventHandler (evt, err) {
    this.logger.error('handling a web player error event: ', err.message)
    this._alexaInterface.sendError(err)
  }

  webPlayerHandleAccessTokenChangeEvent (evt, accessToken) {
    this.logger.info('handling a web player access token change event')
    AlexaController.accessToken = accessToken
  }

  static set accessToken (_accessToken) {
    this._accessToken = _accessToken
  }

  static get accessToken () {
    return this._accessToken
  }

  /**
   * Get the Alexa controller (attached to the window)
   * This is mainly used so the device shim can access the alexa controller object
   *
   * @returns {object} Alexa Controller
   */
  static getAlexaController () {
    if (window.alexaController) {
      return window.alexaController
    } else {
      throw new Error('the alexa controller is not yet set')
    }
  }

  /**
   * Clears the timeout set due to web player inactivity
   */
  static webPlayerCleanupTimerReset () {
    const logger = Logger.get('alexa-controller')

    if (AlexaController.webPlayerTimeOut) {
      logger.info('Clearing the web player inactive timeout')
      clearTimeout(AlexaController.webPlayerTimeOut)
      AlexaController.webPlayerTimeOut = null
    }
  }
}
