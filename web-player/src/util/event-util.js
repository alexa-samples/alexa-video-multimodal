import { WebPlayerEvent } from '../enums/web-player-event'
import $ from 'jquery'
import * as Logger from 'js-logger'
import { AlexaController } from '../controllers/alexa-controller'

/**
 * A utility class for publishing web players events
 */
export class EventUtil {
  static get logger () {
    return Logger.get('event-util')
  }

  /**
   * Trigger a web player load event
   *
   * @param {object} playbackParams Playback params
   */
  static triggerLoadEvent (playbackParams) {
    this.logger.info('triggering a web player load event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.LOAD, playbackParams)
  }

  /**
   * Trigger a web player pause event
   */
  static triggerPauseEvent () {
    this.logger.info('triggering a web player pause event')
    $('body').trigger(WebPlayerEvent.PAUSE)
  }

  /**
   * Trigger a web player play event
   */
  static triggerResumeEvent () {
    this.logger.info('triggering a web player resume event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.RESUME)
  }

  /**
   * Trigger a web player prepare for close event
   */
  static triggerPrepareForCloseEvent () {
    this.logger.info('triggering a web player prepare for close event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.PREPARE_FOR_CLOSE)
  }

  /**
   * Trigger a web player set seek position event
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  static triggerSetSeekPositionEvent (positionInMilliseconds) {
    this.logger.info('triggering a web player set seek position event', positionInMilliseconds)
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.SET_SEEK_POSITION, positionInMilliseconds)
  }

  /**
   * Trigger a web player adjust seek position event
   *
   * @param {number} offsetInMilliseconds Offset in milliseconds
   */
  static triggerAdjustSeekPositionEvent (offsetInMilliseconds) {
    this.logger.info('triggering a web player adjust seek position event', offsetInMilliseconds)
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.ADJUST_SEEK_POSITION, offsetInMilliseconds)
  }

  /**
   * Trigger a web player next event
   *
   * @param {string} videoId Video Id of the next video to be played
   */
  static triggerNextEvent (videoId) {
    this.logger.info('triggering a web player next event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.NEXT, videoId)
  }

  /**
   * Trigger a web player previous event
   *
   * @param {string} videoId Video Id of the previous video to be played
   */
  static triggerPreviousEvent (videoId) {
    this.logger.info('triggering a web player previous event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.PREVIOUS, videoId)
  }

  /**
   * Trigger a web player closed captions state change event
   *
   * @param {object} closedCaptionState Closed caption state
   */
  static triggerClosedCaptionsStateChangeEvent (closedCaptionState) {
    this.logger.info('triggering a web player closed captions state change event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.CLOSED_CAPTIONS_STATE_CHANGE_EVENT, closedCaptionState)
  }

  /**
   * Trigger a web player access token change event
   *
   * @param {string} accessToken Access token
   */
  static triggerAccessTokenChangeEvent (accessToken) {
    this.logger.info('triggering a web player access token change event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.ACCESS_TOKEN_CHANGE, accessToken)
  }

  /**
   * Trigger a web player paused event
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  static triggerPausedEvent (positionInMilliseconds) {
    this.logger.info('triggering a web player paused event')
    $('body').trigger(WebPlayerEvent.PAUSED, positionInMilliseconds)
  }

  /**
   * Trigger a web player buffering event
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  static triggerBufferingEventEvent (positionInMilliseconds) {
    this.logger.info('triggering a web player buffering event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.BUFFERING, positionInMilliseconds)
  }

  /**
   * Trigger a web player playing event
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  static triggerPlayingEventEvent (positionInMilliseconds) {
    this.logger.info('triggering a web player playing event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.PLAYING, positionInMilliseconds)
  }

  /**
   * Trigger a web player end event
   */
  static triggerEndEventEvent () {
    this.logger.info('triggering a web player end event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.END)
  }

  /**
   * Trigger a web player idle event
   */
  static triggerIdleEventEvent () {
    this.logger.info('triggering a web player end event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.IDLE)
  }

  /**
   * Trigger a web player can play event
   */
  static triggerCanPlayEvent () {
    this.logger.info('triggering a web player can play event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.CAN_PLAY)
  }

  /**
   * Trigger a web player time update event
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   * @param {number} duration Duration of the video
   * @param {string} videoId The Id of the video
   * @param {boolean} noThrottle Skip throttling of api gateway calls
   */
  static triggerTimeUpdateEvent (positionInMilliseconds, duration, videoId, noThrottle = false) {
    this.logger.debug('triggering a web player time update event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.TIME_UPDATE, { positionInMilliseconds, duration, videoId, noThrottle })
  }

  /**
   * Trigger a web player error event
   *
   * @param {string} message Error Message
   * @param {string} errorType The type of the error
   */
  static triggerErrorEvent (message, errorType) {
    this.logger.info('triggering a web player error event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.ERROR, {
      message: message,
      type: errorType
    })
  }

  /**
   * Trigger a web player close event
   */
  static triggerWebPlayerCloseEvent () {
    this.logger.info('triggering a web player close event')
    $('body').trigger(WebPlayerEvent.CLOSE)
  }

  /**
   * Trigger a web player closed captioning language change event
   *
   * @param {string} lang Language
   */
  static triggerWebPlayerClosedCaptioningLanguageChangeEvent (lang) {
    this.logger.info('triggering a web player close event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.CLOSED_CAPTIONING_LANGUAGE_CHANGE, lang)
  }

  /**
   * Trigger a web player AWS metadata update event
   *
   * @param {object} awsMetadata AWS Metadata
   */
  static triggerAwsMetadataUpdateEvent (awsMetadata) {
    this.logger.info('triggering a web player aws metadata update event')
    AlexaController.webPlayerCleanupTimerReset()
    $('body').trigger(WebPlayerEvent.AWS_METADATA_UPDATE, awsMetadata)
  }
}
