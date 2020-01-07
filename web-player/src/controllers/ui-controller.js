import * as Logger from 'js-logger'
import $ from 'jquery'
import { EventUtil } from '../util/event-util'
import { WebPlayerEvent } from '../enums/web-player-event'
import { Util } from '../util/util'

/**
 * This class handles events from the user interface (UI) itself. It then republishes these events as
 * web player events that are listened to in other components of the web player, such as
 * the Alexa Controller and the Video Controller.
 *
 * Example: the user touches the play button on the screen - this will trigger a play event.
 */
export class UiController {
  constructor () {
    this.logger = Logger.get('ui-controller')
    this.overlayShowing = false
    this.disableOverlayTransitioning = false
    this.isSeeking = false
    this.duration = null
  }

  /**
   * Performs the initialization of the video controller
   */
  init () {
    this.logger.info('initialize the ui controller')
    this.controlsOverlayElement = document.getElementById('controlsOverlay')

    this.controlsContainerElement = document.getElementById('controlsContainer')
    this.playIconElement = document.getElementById('play')
    this.pauseIconElement = document.getElementById('pause')
    this.seekBackwardElement = document.getElementById('seekBackward')
    this.seekForwardElement = document.getElementById('seekForward')
    this.seekBarElement = document.getElementById('seekBar')
    this.videoTitleElement = document.getElementById('videoTitle')
    this.videoDurationElement = document.getElementById('videoDuration')
    this.currentTimePositionElement = document.getElementById('currentTimePosition')
    this.closedCaptioningElement = document.getElementById('closedCaptioning')
    this.closedCaptioningCloseElement = document.getElementById('ccClose')
    this.webPlayerCloseElement = document.getElementById('webPlayerClose')
    this.seekBarRowElement = document.getElementById('seekBarRow')
    this.videoSmallTitleElement = document.getElementById('videoSmallTitle')
    this.nextEpisodeRowElement = document.getElementById('nextEpisodeRow')
    this.nextEpisodeTextElement = document.getElementById('nextEpisodeText')
    this.hideControlsOverlayTimeout = null

    this.setUIEventHandlers()
    this.setWebPlayerEventHandlers()
    this.positionControls()
  }

  /**
   * Set the video event handlers
   */
  setUIEventHandlers () {
    $('body')
      .on('touch click', this.uiTouchScreenEventHandler.bind(this))
    $(this.playIconElement).on('touch click', this.uiResumeEventHandler.bind(this))
    $(this.pauseIconElement).on('touch click', this.uiPauseEventHandler.bind(this))
    $(this.seekBackwardElement).on('touch click', this.uiSeekBackwardEventHandler.bind(this))
    $(this.seekForwardElement).on('touch click', this.uiSeekForwardEventHandler.bind(this))
    $(this.seekBarElement).on('input', this.uiSeekBarChangeHandler.bind(this))
    $(this.seekBarElement).on('touchstart mousedown', this.uiSeekStartHandler.bind(this))
    $(this.seekBarElement).on('touchend mouseup', this.uiSeekEndHandler.bind(this))
    $(this.closedCaptioningElement).on('touch click', this.uiClosedCaptioningEventHandler.bind(this))
    $(this.closedCaptioningCloseElement).on('touch click', this.uiCloseClosedCaptioningEventHandler.bind(this))
    $(this.webPlayerCloseElement).on('touch click', this.uiWebPlayerCloseEventHandler.bind(this))
    $(this.nextEpisodeRowElement).on('touch click', this.uiWebPlayerNextEpisodeEventHandler.bind(this))
    $('input[type=radio][name=cc-radio]').change(this.uiCloseClosedCaptioningLanguageChangeEventHandler.bind(this))
  }

  /**
   * Set the web player event handlers
   */
  setWebPlayerEventHandlers () {
    $('body')
      .on(WebPlayerEvent.PLAYING, this.webPlayerPlayingEventHandler.bind(this))
      .on(WebPlayerEvent.PAUSED, this.webPlayerPausedEventHandler.bind(this))
      .on(WebPlayerEvent.TIME_UPDATE, this.webPlayerTimeUpdateEventHandler.bind(this))
      .on(WebPlayerEvent.LOAD, this.webPlayerLoadEventHandler.bind(this))
  }

  /**
   * Handle a UI touch screen event
   *
   * @param {object} evt JQuery Event
   */
  uiTouchScreenEventHandler (evt) {
    const touchTargetId = $(evt.target).attr('id')

    const ignoreIds = [
      'play',
      'pause',
      'seekBackward',
      'seekForward',
      'seekBar',
      'closedCaptioning',
      'ccClose',
      'disabled-cc',
      'en-cc',
      'webPlayerClose'
    ]

    if (!this.disableOverlayTransitioning) {
      if (!this.overlayShowing) {
        this.logger.info('handling ui touch screen event - show controls overlay')
        this.showControlsOverlay()
      }
      if (this.overlayShowing && ignoreIds.indexOf(touchTargetId) === -1) {
        this.logger.info('handling ui touch screen event - hide controls overlay')
        this.hideControlsOverlay()
      }
    }
  }

  /**
   * Handle a UI resume event
   */
  uiResumeEventHandler () {
    this.logger.info('handling ui resume event')
    if (!this.disableOverlayTransitioning && this.overlayShowing) {
      if ($(this.playIconElement).is(':visible')) {
        EventUtil.triggerResumeEvent()
        this.hideControlOverlayAfter3000ms()
      }
    }
  }

  /**
   * Handle a UI pause event
   */
  uiPauseEventHandler () {
    this.logger.info('handling ui pause event')

    if (!this.disableOverlayTransitioning && this.overlayShowing) {
      if ($(this.pauseIconElement).is(':visible')) {
        EventUtil.triggerPauseEvent()
        this.hideControlOverlayAfter3000ms()
      }
    }
  }

  /**
   * Handle a UI seek backward event
   */
  uiSeekBackwardEventHandler () {
    this.logger.info('handling ui seek backward event')

    if (!this.disableOverlayTransitioning && this.overlayShowing) {
      if ($(this.seekBackwardElement).is(':visible')) {
        EventUtil.triggerAdjustSeekPositionEvent(-10 * 1000)
        this.hideControlOverlayAfter3000ms()
      }
    }
  }

  /**
   * Handle a UI seek forward event
   */
  uiSeekForwardEventHandler () {
    this.logger.info('handling ui seek forward event')

    if (!this.disableOverlayTransitioning && this.overlayShowing) {
      if ($(this.seekForwardElement).is(':visible')) {
        EventUtil.triggerAdjustSeekPositionEvent(10 * 1000)
        this.hideControlOverlayAfter3000ms()
      }
    }
  }

  /**
   * Handle a UI seek bar change event
   */
  uiSeekBarChangeHandler () {
    if (this.isSeeking) {
      this.logger.info('handling ui seek bar change event')
      const seekBarValue = $(this.seekBarElement).val()
      const positionInMilliseconds = seekBarValue * this.duration / 100
      $(this.currentTimePositionElement).html(Util.formatMilliseconds(positionInMilliseconds))
      this.hideControlOverlayAfter3000ms()
    }
  }

  /**
   * Handle a UI seek start event
   */
  uiSeekStartHandler () {
    if (this.overlayShowing) {
      this.logger.info('handling ui seek start event')
      this.isSeeking = true
    }
  }

  /**
   * Handle a UI seek end event
   */
  uiSeekEndHandler () {
    this.logger.info('handling ui seek end event')
    this.isSeeking = false
    const seekBarValue = $(this.seekBarElement).val()
    const positionInMilliseconds = seekBarValue * this.duration / 100
    EventUtil.triggerSetSeekPositionEvent(positionInMilliseconds)
  }

  /**
   * Handle a UI closed captioning event
   */
  uiClosedCaptioningEventHandler () {
    this.logger.info('handling ui closed captioning event')
    this.disableOverlayTransitioning = true
    clearTimeout(this.hideControlsOverlayTimeout)
    EventUtil.triggerPauseEvent()
    $('#controlsContainer').hide()
    $('#ccOptionsContainer').show()
  }

  /**
   * Handle a UI close closed captioning event
   */
  uiCloseClosedCaptioningEventHandler () {
    this.logger.info('handling ui close closed captioning event')
    this.disableOverlayTransitioning = false
    clearTimeout(this.hideControlsOverlayTimeout)
    $('#controlsContainer').show()
    $('#ccOptionsContainer').hide()
    EventUtil.triggerResumeEvent()
    this.hideControlOverlayAfter3000ms()
  }

  /**
   * Handle a UI close closed captioning language change event
   *
   * @param {object} evt JQuery Event
   */
  uiCloseClosedCaptioningLanguageChangeEventHandler (evt) {
    this.logger.info('handling ui closed captioning language change event', evt)
    EventUtil.triggerWebPlayerClosedCaptioningLanguageChangeEvent(evt.target.value)
  }

  /**
   * Handle a web player close event
   */
  uiWebPlayerCloseEventHandler () {
    this.logger.info('handling ui web player close event')
    EventUtil.triggerWebPlayerCloseEvent()
  }

  /**
   * Handle a web player playing event
   */
  webPlayerPlayingEventHandler () {
    this.logger.info('handling web player playing event')
    $(this.playIconElement).hide()
    $(this.pauseIconElement).show()
  }

  /**
   * Handle a web player paused event
   */
  webPlayerPausedEventHandler () {
    this.logger.info('handling web player paused event')
    $(this.playIconElement).show()
    $(this.pauseIconElement).hide()
  }

  /**
   * Handle a web player time update event
   *
   * @param {object} evt JQuery Event
   * @param {object} params Params containing positionInMilliseconds and duration
   */
  webPlayerTimeUpdateEventHandler (evt, params) {
    if (!this.isSeeking) {
      // TODO: set up log levels
      // this.logger.debug('handling web player time update event');
      const positionInMilliseconds = params.positionInMilliseconds
      this.duration = params.duration
      $(this.currentTimePositionElement).html(Util.formatMilliseconds(positionInMilliseconds))
      $(this.videoDurationElement).html(Util.formatMilliseconds(this.duration))
      const seekBarValue = positionInMilliseconds * 100 / this.duration
      $(this.seekBarElement).val(seekBarValue)
    }
  }

  /**
   * Handle web player load events
   *
   * @param {object} evt JQuery Event
   * @param {object} playbackParams Playback Params
   */
  webPlayerLoadEventHandler (evt, playbackParams) {
    this.logger.info('handling a web player load event')
    const videoInfo = playbackParams.contentUri
    this.videoMetadata = videoInfo.videoMetadata
    if (!this.videoMetadata.episodeName) {
      $(this.videoTitleElement).html(this.videoMetadata.name)
    } else {
      $(this.videoTitleElement).html(this.videoMetadata.episodeName)
      const videoEpisodeTitle = this.videoMetadata.name.concat(', ', 'Season ', this.videoMetadata.seasonNumber,
        ', Ep. ', this.videoMetadata.episodeNumber)
      $(this.videoSmallTitleElement).html(videoEpisodeTitle)
    }

    if (!this.videoMetadata.closedCaptionsFile) {
      this.closedCaptioningEnabled = false
      $(this.closedCaptioningElement).hide()
    } else {
      this.closedCaptioningEnabled = true
      $(this.closedCaptioningElement).show()
    }

    this.configureNextEpisodeRow()

    const isChannel = !!this.videoMetadata.networkDetails
    if (isChannel) {
      this.logger.info('configuring ui to play a tv channel')
      $(this.seekBackwardElement).hide()
      $(this.seekForwardElement).hide()
      $(this.seekBarRowElement).hide()
    } else {
      this.logger.info('configuring ui to play a video')
      $(this.seekBackwardElement).show()
      $(this.seekForwardElement).show()
      $(this.seekBarRowElement).show()
    }
    this.positionControls()
  }

  /**
   * Position the controls on the screen based on the screen size
   */
  positionControls () {
    const windowHeight = $(window).height()
    const containerHeight = $(this.controlsContainerElement).height()
    $(this.controlsContainerElement).css({
      'margin-top': (windowHeight / 2 - containerHeight / 2)
    })
  }

  /**
   * Show the controls overlay. The controls overlay has the UI controls such as the play and seek icons.
   */
  showControlsOverlay () {
    this.logger.info('show controls overlay')
    this.disableOverlayTransitioning = true
    $(this.controlsOverlayElement).removeClass('fade-in fade-out hidden')
    $(this.controlsOverlayElement).addClass('fade-in')
    $(this.controlsContainerElement).removeClass('fade-in fade-out hidden')
    $(this.controlsContainerElement).addClass('fade-in')
    setTimeout(() => {
      this.overlayShowing = true
      this.disableOverlayTransitioning = false
    }, 250)

    this.hideControlOverlayAfter3000ms()
  }

  /**
   * Hide the controls overlay. The controls overlay has the UI controls such as the play and seek icons.
   */
  hideControlsOverlay () {
    this.logger.info('hide controls overlay')
    this.disableOverlayTransitioning = true
    $(this.controlsOverlayElement).removeClass('fade-in fade-out hidden')
    $(this.controlsOverlayElement).addClass('fade-out')
    $(this.controlsContainerElement).removeClass('fade-in fade-out hidden')
    $(this.controlsContainerElement).addClass('fade-out')
    setTimeout(() => {
      this.overlayShowing = false
      this.disableOverlayTransitioning = false
    }, 350)
  }

  /**
   * Hide the controls overlay after 3000ms
   */
  hideControlOverlayAfter3000ms () {
    // TODO: set log levels
    // this.logger.debug('will hide  controls overlay after 3 seconds');
    if (this.hideControlsOverlayTimeout) {
      clearTimeout(this.hideControlsOverlayTimeout)
    }
    this.hideControlsOverlayTimeout = setTimeout(() => {
      this.hideControlsOverlay()
    }, 3000)
  }

  /**
   * Configure the next episode UI element at the bottom of the screen if needed
   */
  configureNextEpisodeRow () {
    if (this.videoMetadata.nextEpisode) {
      $(this.nextEpisodeTextElement).html(`S${this.videoMetadata.nextEpisode.seasonNumber} E${this.videoMetadata.nextEpisode.episodeNumber}: ${this.videoMetadata.nextEpisode.episodeName}`)
      $(this.nextEpisodeRowElement).show()
    } else {
      $(this.nextEpisodeTextElement).html()
      $(this.nextEpisodeRowElement).hide()
    }
  }

  /**
   * Handle a click event for playing the next episode
   */
  uiWebPlayerNextEpisodeEventHandler () {
    this.logger.info('handling a ui web player next episode event')
    if (this.videoMetadata.nextEpisode) {
      EventUtil.triggerNextEvent(this.videoMetadata.nextEpisode.id)
    } else {
      this.logger.error('There is no next episode available')
    }
  }
}
