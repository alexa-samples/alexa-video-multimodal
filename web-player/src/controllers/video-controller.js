import * as Logger from 'js-logger'
import { EventUtil } from '../util/event-util'
import $ from 'jquery'
import { WebPlayerEvent } from '../enums/web-player-event'
import { VideoEvent } from '../enums/video-event'
import { ContentType } from '../enums/content-type'
import { ErrorType } from '../enums/error-type'

/**
 * This class handles events from the video element itself.  It then republishes those events as
 * web player events that are listened to in other components of the web player such as
 * the Alexa Controller and the UI Controller.
 *
 * Example - a video ends - this will publish a web player end event
 */
export class VideoController {
  constructor () {
    this.logger = Logger.get('video-controller')
    this.autoPlay = false
  }

  /**
   * Performs the initialization of the video controller
   */
  init () {
    this.logger.info('initialize the video controller')
    this.videoElement = document.getElementById('player')
    this.setVideoEventHandlers()
    this.setWebPlayerEventHandlers()
  }

  /**
   * Set the video event handlers
   */
  setVideoEventHandlers () {
    this.videoHandlers = {
      [VideoEvent.CAN_PLAY]: () => {
        this.logger.info('handling a video can play event')
        EventUtil.triggerCanPlayEvent()
      },
      [VideoEvent.PLAYING]: () => {
        const positionInMilliseconds = parseInt(this.videoElement.currentTime, 10) * 1000
        this.logger.info('handling a video playing event')
        EventUtil.triggerPlayingEventEvent(positionInMilliseconds)
      },
      [VideoEvent.PAUSED]: () => {
        const positionInMilliseconds = parseInt(this.videoElement.currentTime, 10) * 1000
        this.logger.info('handling a video paused event')
        EventUtil.triggerPausedEvent(positionInMilliseconds)
      },
      [VideoEvent.TIME_UPDATE]: () => {
        this.logger.debug('handling a video time update event')
        const positionInMilliseconds = parseInt(this.videoElement.currentTime, 10) * 1000
        const duration = this.videoElement.duration * 1000
        EventUtil.triggerTimeUpdateEvent(positionInMilliseconds, duration, this.videoMetadata.id)
      },
      [VideoEvent.WAITING]: () => {
        const positionInMilliseconds = parseInt(this.videoElement.currentTime, 10) * 1000
        this.logger.info('handling a video waiting event')
        EventUtil.triggerBufferingEventEvent(positionInMilliseconds)
      },
      [VideoEvent.ENDED]: () => {
        this.logger.info('handling a video ended event')
        EventUtil.triggerEndEventEvent()
      },
      [VideoEvent.ERROR]: () => {
        this.logger.info('handling a video error event')
        EventUtil.triggerErrorEvent('An error occurred trying to play the video', ErrorType.PLAYER_ERROR)
      }
    }

    this.videoElement.addEventListener('loadedmetadata', () => {
      this.logger.info('handling a video loaded metadata event')
      const startPosition = this.getStartPosition()
      this.setPosition(startPosition)
    }, false)

    this.videoElement.oncanplay = this.videoHandlers[VideoEvent.CAN_PLAY]
    this.videoElement.onplaying = this.videoHandlers[VideoEvent.PLAYING]
    this.videoElement.onpause = this.videoHandlers[VideoEvent.PAUSED]
    this.videoElement.ontimeupdate = this.videoHandlers[VideoEvent.TIME_UPDATE]
    this.videoElement.onwaiting = this.videoHandlers[VideoEvent.WAITING]
    this.videoElement.onended = this.videoHandlers[VideoEvent.ENDED]
    this.videoElement.onerror = this.videoHandlers[VideoEvent.ERROR]
  }

  /**
   * Set the web player event handlers
   */
  setWebPlayerEventHandlers () {
    $('body')
      .on(WebPlayerEvent.LOAD, this.webPlayerLoadEventHandler.bind(this))
      .on(WebPlayerEvent.CAN_PLAY, this.webPlayerCanPlayEventHandler.bind(this))
      .on(WebPlayerEvent.RESUME, this.webPlayerResumeEventHandler.bind(this))
      .on(WebPlayerEvent.PAUSE, this.webPlayerPauseHandler.bind(this))
      .on(WebPlayerEvent.SET_SEEK_POSITION, this.webPlayerSetSeekPositionEventHandler.bind(this))
      .on(WebPlayerEvent.ADJUST_SEEK_POSITION, this.webPlayerAdjustSeekPositionEventHandler.bind(this))
      .on(WebPlayerEvent.CLOSED_CAPTIONING_LANGUAGE_CHANGE, this.webPlayerSetClosedCaptioningLanguageChangeEventHandler.bind(this))
  }

  /**
   * Handle web player load events
   *
   * @param {object} evt JQuery event
   * @param {object} playbackParams Playback params
   */
  webPlayerLoadEventHandler (evt, playbackParams) {
    this.logger.info('handling a web player load event')
    const videoInfo = playbackParams.contentUri
    this.videoMetadata = videoInfo.videoMetadata
    this.autoPlay = videoInfo.autoPlay
    const videoUrl = this.videoMetadata.videoUrl
    this.logger.info('using this video url ', videoUrl)
    const source = document.createElement('source')
    // Set the video content based on contentUri being a stream URL
    source.setAttribute('src', videoUrl)
    // Set type based on extension loosely found in URL
    if (videoUrl.split('?')[0].endsWith('.mp4')) {
      source.setAttribute('type', 'video/mp4')
    } else if (videoUrl.split('?')[0].endsWith('.m3u8')) {
      source.setAttribute('type', 'application/x-mpeg')
    } else if (videoUrl.split('?')[0].endsWith('.webm')) {
      source.setAttribute('type', 'video/webm')
    } else {
      this.logger.error('Unhandled video type for url: ', videoUrl)
      EventUtil.triggerErrorEvent('Unsupported video type', ErrorType.PLAYER_ERROR)
    }

    this.videoElement.innerHTML = ''
    this.videoElement.appendChild(source)

    // load the video
    this.videoElement.load()
    const startPosition = this.getStartPosition()
    EventUtil.triggerBufferingEventEvent(startPosition)
  }

  /**
   * Handle web player set closed captioning language events
   *
   * @param {object} evt JQuery event
   * @param {string} lang Language code for closed captioning
   */
  webPlayerSetClosedCaptioningLanguageChangeEventHandler (evt, lang) {
    this.logger.info('handling a web player closed captioning language change event', lang)
    if (lang === 'disabled') {
      if (this.trackElement) {
        this.trackElement.remove()
      }
    } else {
      if (this.videoMetadata.closedCaptionsFile) {
        const ccFile = this.videoMetadata.closedCaptionsFile
        this.logger.info('using this closed captions file', ccFile)
        this.trackElement = document.createElement('track')
        this.trackElement.setAttribute('label', 'English')
        this.trackElement.setAttribute('kind', 'subtitles')
        this.trackElement.setAttribute('srclang', 'en')
        this.trackElement.setAttribute('default', '')
        this.trackElement.setAttribute('src', ccFile)
        this.videoElement.appendChild(this.trackElement)
      } else {
        this.logger.info('not configuring closed captions')
      }
    }
  }

  /**
   * Handle web player can play events
   *
   * @param {object} evt JQuery event
   */
  webPlayerCanPlayEventHandler (evt) {
    this.resizeVideo()
    this.logger.info('handling a web player can play event')
    if (this.autoPlay) {
      this.logger.info('auto play is set to true so playing')
      this.autoPlay = false
      this.videoElement.play().then(() => {
      })
    } else {
      this.logger.info('auto play is set to true so not playing')
    }
  }

  /**
   * Handle web player pause events
   *
   * @param {object} evt JQuery event
   */
  webPlayerPauseHandler (evt) {
    this.logger.info('handling a web player pause event')
    this.videoElement.pause()
  }

  /**
   * Handle web player resume event
   *
   * @param {object} evt JQuery event
   */
  webPlayerResumeEventHandler (evt) {
    this.logger.info('handling a web player resume event')
    this.videoElement.play().then(() => {

    })
  }

  /**
   * Handle web player adjust seek position events
   * Set seek position events set the time position of the video to a specific time relative to the start of the video
   *
   * @param {object} evt JQuery event
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  webPlayerSetSeekPositionEventHandler (evt, positionInMilliseconds) {
    this.logger.info('handling a web player set seek position event', positionInMilliseconds)
    this.setPosition(positionInMilliseconds)
    EventUtil.triggerResumeEvent()
  }

  /**
   * Handle web player adjust seek position events
   * Adjust seek position events modify the time position of the video relative to the current time position
   *
   * @param {object} evt JQuery event
   * @param {number|string} offsetInMilliseconds Offset in milliseconds
   */
  webPlayerAdjustSeekPositionEventHandler (evt, offsetInMilliseconds) {
    this.logger.info('handling a web player adjust seek position event', offsetInMilliseconds)
    const positionInMilliseconds = this.videoElement.currentTime * 1000 + parseInt(offsetInMilliseconds)
    this.setPosition(positionInMilliseconds)
    EventUtil.triggerResumeEvent()
  }

  /**
   * Resize the video on the page to best fit the device screen
   */
  resizeVideo () {
    const windowWidth = $(window).width() // returns width of browser viewport
    const windowHeight = $(window).height() // returns height of browser viewport
    const videoHeight = this.videoElement.videoHeight // returns the intrinsic height of the video
    const videoWidth = this.videoElement.videoWidth // returns the intrinsic width of the video
    const aspectRatio = videoWidth / videoHeight
    this.logger.debug(`windowWidth: ${windowWidth}, windowHeight: ${windowHeight}, videoHeight: ${videoHeight}, videoWidth: ${videoWidth}, aspectRatio: ${aspectRatio}`)
    const scaledVideoHeight = Math.floor(windowWidth / aspectRatio)

    if (scaledVideoHeight <= windowHeight) {
      // Set the video width to be the same as the device screen width and adjust video height to maintain aspect ratio
      this.logger.debug('Setting video width to screen width and scaling video height')
      $(this.videoElement).css('width', '100%')
      const videoPadding = Math.floor((windowHeight - scaledVideoHeight) / 2)
      $(this.videoElement).css('padding-top', `${videoPadding}px`)
    } else {
      const scaledVideoWidth = Math.floor(windowHeight * aspectRatio)
      // Set the video height to be the same as the device screen height and adjust video width to maintain aspect ratio
      this.logger.debug('Setting video height to screen height and scaling video width')
      $(this.videoElement).css('height', `${windowHeight}px`)
      const videoPadding = Math.floor((windowWidth - scaledVideoWidth) / 2)
      $(this.videoElement).css('padding-left', `${videoPadding}px`)
    }
  }

  /**
   * Set the time position of the video
   *
   * @param {number} positionInMilliseconds Position in milliseconds
   */
  setPosition (positionInMilliseconds) {
    const duration = this.videoElement.duration * 1000
    // Check for out of bounds
    if (positionInMilliseconds < 0) {
      positionInMilliseconds = 0
    } else if (positionInMilliseconds > duration) {
      positionInMilliseconds = duration - 3000 > 0 ? duration - 3000 : 0 // if skipped past the end, set to 3 seconds before the end
    }
    this.logger.info(`setting position with position in milliseconds ${positionInMilliseconds}`)
    this.videoElement.currentTime = positionInMilliseconds / 1000
  }

  getStartPosition () {
    const isVideo = this.videoMetadata.webPlayerContentType === ContentType.VIDEO
    let isLiveTv = false
    if (isVideo) {
      isLiveTv = !!this.videoMetadata.networkDetails
    }
    // If specified, set the offsetInMilliseconds
    if (!isLiveTv && this.videoMetadata.absoluteViewingPositionMilliseconds) {
      return parseInt(this.videoMetadata.absoluteViewingPositionMilliseconds)
    }
    return 0
  }
}
