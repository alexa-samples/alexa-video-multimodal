import $ from 'jquery'
import { UiController } from '../../src/controllers/ui-controller'
import { WebPlayerEvent } from '../../src/enums/web-player-event'
import { EventUtil } from '../../src/util/event-util'
import { Util } from '../../src/util/util'
import { PlaybackParams } from '../../src/models/playback-params'

describe('UiController', () => {
  let uiController = null

  beforeEach(() => {
    uiController = new UiController()
    window.$ = $
  })

  it('init', () => {
    // Arrange
    const setVideoEventHandlersSpy = spyOn(uiController, 'setUIEventHandlers')
    const setWebPlayerEventHandlersSpy = spyOn(uiController, 'setWebPlayerEventHandlers')
    const positionControlsSpy = spyOn(uiController, 'positionControls')

    // Act
    const result = uiController.init()

    // Assert
    expect(result).toBeUndefined()
    expect(setVideoEventHandlersSpy).toHaveBeenCalledTimes(1)
    expect(setWebPlayerEventHandlersSpy).toHaveBeenCalledTimes(1)
    expect(positionControlsSpy).toHaveBeenCalledTimes(1)
  })

  it('setUIEventHandlers', () => {
    // Arrange
    uiController.playIconElement = $(`<div id="playIcon"></div>`)
    uiController.pauseIconElement = $(`<div id="pauseIcon"></div>`)
    uiController.seekBackwardElement = $(`<div id="seekBackward"></div>`)
    uiController.seekForwardElement = $(`<div id="seekForward"></div>`)
    uiController.seekBarElement = $(`<div id="seekBar"></div>`)
    uiController.closedCaptioningElement = $(`<div id="closedCaptioning"></div>`)
    uiController.closedCaptioningCloseElement = $(`<div id="closedCaptioningClose"></div>`)
    uiController.webPlayerCloseElement = $(`<div id="webPlayerClose"></div>`)
    uiController.nextEpisodeRowElement = $(`<div id="nextEpisodeRow"></div>`)

    // Act
    const result = uiController.setUIEventHandlers()

    // Assert
    expect(result).toBeUndefined()

    const playIconEvents = $._data(uiController.playIconElement.get(0), 'events')
    const pauseIconEvents = $._data(uiController.pauseIconElement.get(0), 'events')
    const seekBackwardEvents = $._data(uiController.pauseIconElement.get(0), 'events')
    const seekForwardEvents = $._data(uiController.seekBackwardElement.get(0), 'events')
    const seekBarEvents = $._data(uiController.seekBarElement.get(0), 'events')
    const closedCaptioningEvents = $._data(uiController.closedCaptioningElement.get(0), 'events')
    const closedCaptioningCloseEvents = $._data(uiController.closedCaptioningCloseElement.get(0), 'events')
    const webPlayerCloseEvents = $._data(uiController.webPlayerCloseElement.get(0), 'events')
    const nextEpisodeRowEvents = $._data(uiController.nextEpisodeRowElement.get(0), 'events')

    expect(playIconEvents['touch']).toBeDefined()
    expect(playIconEvents['click']).toBeDefined()
    expect(pauseIconEvents['touch']).toBeDefined()
    expect(pauseIconEvents['click']).toBeDefined()
    expect(seekBackwardEvents['touch']).toBeDefined()
    expect(seekBackwardEvents['click']).toBeDefined()
    expect(seekForwardEvents['touch']).toBeDefined()
    expect(seekForwardEvents['click']).toBeDefined()
    expect(seekBarEvents['input']).toBeDefined()
    expect(seekBarEvents['touchstart']).toBeDefined()
    expect(seekBarEvents['mousedown']).toBeDefined()
    expect(seekBarEvents['touchend']).toBeDefined()
    expect(seekBarEvents['mouseup']).toBeDefined()
    expect(closedCaptioningEvents['touch']).toBeDefined()
    expect(closedCaptioningEvents['click']).toBeDefined()
    expect(closedCaptioningCloseEvents['touch']).toBeDefined()
    expect(closedCaptioningCloseEvents['click']).toBeDefined()
    expect(webPlayerCloseEvents['touch']).toBeDefined()
    expect(webPlayerCloseEvents['click']).toBeDefined()
    expect(nextEpisodeRowEvents['touch']).toBeDefined()
    expect(nextEpisodeRowEvents['click']).toBeDefined()
  })

  it('setWebPlayerEventHandlers', () => {
    // Arrange
    const body = $('body')
    const jquerySpy = spyOn(window, '$')
    jquerySpy.and.returnValue(body)

    // Act
    const result = uiController.setWebPlayerEventHandlers()

    // Assert
    expect(result).toBeUndefined()
    const events = $._data(body.get(0), 'events')

    expect(events[WebPlayerEvent.PLAYING]).toBeDefined()
    expect(events[WebPlayerEvent.PAUSED]).toBeDefined()
    expect(events[WebPlayerEvent.TIME_UPDATE]).toBeDefined()
    expect(events[WebPlayerEvent.LOAD]).toBeDefined()
  })

  describe('uiTouchScreenEventHandler', () => {
    it('overlay hidden - show it', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = false
      const evt = {
        target: {
          attr: () => {
            return 'junk'
          }
        }
      }

      const showControlsOverlaySpy = spyOn(uiController, 'showControlsOverlay')
      showControlsOverlaySpy.and.returnValue(undefined)

      const hideControlsOverlaySpy = spyOn(uiController, 'hideControlsOverlay')
      hideControlsOverlaySpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiTouchScreenEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
      expect(showControlsOverlaySpy).toHaveBeenCalledTimes(1)
      expect(hideControlsOverlaySpy).not.toHaveBeenCalled()
    })

    it('overlay showing - hide it', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true
      const evt = {
        target: {
          attr: () => {
            return 'junk'
          }
        }
      }

      const showControlsOverlaySpy = spyOn(uiController, 'showControlsOverlay')
      showControlsOverlaySpy.and.returnValue(undefined)

      const hideControlsOverlaySpy = spyOn(uiController, 'hideControlsOverlay')
      hideControlsOverlaySpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiTouchScreenEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
      expect(hideControlsOverlaySpy).toHaveBeenCalledTimes(1)
      expect(showControlsOverlaySpy).not.toHaveBeenCalled()
    })

    it('disableOverlayTransitioning = true', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true
      uiController.overlayShowing = false
      const evt = {
        target: {
          attr: () => {
            return 'junk'
          }
        }
      }

      const showControlsOverlaySpy = spyOn(uiController, 'showControlsOverlay')
      showControlsOverlaySpy.and.returnValue(undefined)

      const hideControlsOverlaySpy = spyOn(uiController, 'hideControlsOverlay')
      hideControlsOverlaySpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiTouchScreenEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
      expect(hideControlsOverlaySpy).not.toHaveBeenCalled()
      expect(showControlsOverlaySpy).not.toHaveBeenCalled()
    })
  })

  describe('uiResumeEventHandler', () => {
    let playIcon
    beforeEach(() => {
      playIcon = $(`<div id="play"></div>`)
      $('body').append(playIcon)
      uiController.playIconElement = playIcon
    })

    afterEach(() => {
      playIcon.remove()
    })

    it('overlay showing - pause button showing - do resume', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true

      const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
      triggerResumeEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiResumeEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerResumeEventSpy).toHaveBeenCalledTimes(1)
      expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
    })

    it('disableOverlayTransitioning=true - do not resume', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true
      uiController.overlayShowing = true

      const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
      triggerResumeEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiResumeEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerResumeEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })

    it('play button not visible - do not resume', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true
      $(playIcon).hide()

      const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
      triggerResumeEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiResumeEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerResumeEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })
  })

  describe('uiPauseEventHandler', () => {
    let pauseIcon
    beforeEach(() => {
      pauseIcon = $(`<div id="pause"></div>`)
      $('body').append(pauseIcon)
      uiController.pauseIconElement = pauseIcon
    })

    afterEach(() => {
      pauseIcon.remove()
    })

    it('overlay showing - pause button showing - do pause', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true

      const triggerPauseEventSpy = spyOn(EventUtil, 'triggerPauseEvent')
      triggerPauseEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiPauseEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerPauseEventSpy).toHaveBeenCalledTimes(1)
      expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
    })

    it('disableOverlayTransitioning=true - do not pause', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true
      uiController.overlayShowing = true

      const triggerPauseEventSpy = spyOn(EventUtil, 'triggerPauseEvent')
      triggerPauseEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiPauseEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerPauseEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })

    it('pause button not visible - do not pause', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true
      $(pauseIcon).hide()

      const triggerPauseEventSpy = spyOn(EventUtil, 'triggerPauseEvent')
      triggerPauseEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiPauseEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerPauseEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })
  })

  describe('uiSeekBackwardEventHandler', () => {
    let seekBackwardIcon
    beforeEach(() => {
      seekBackwardIcon = $(`<div id="seekBackward"></div>`)
      $('body').append(seekBackwardIcon)
      uiController.seekBackwardElement = seekBackwardIcon
    })

    afterEach(() => {
      seekBackwardIcon.remove()
    })

    it('overlay showing - seekBackward button showing - do seek backward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekBackwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).toHaveBeenCalledWith(-10000)
      expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
    })

    it('disableOverlayTransitioning=true - do not seek backward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true
      uiController.overlayShowing = true

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekBackwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })

    it('seekBackward button not visible - do not seek backward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true
      $(seekBackwardIcon).hide()

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekBackwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })
  })

  describe('uiSeekForwardEventHandler', () => {
    let seekForwardIcon
    beforeEach(() => {
      seekForwardIcon = $(`<div id="seekForward"></div>`)
      $('body').append(seekForwardIcon)
      uiController.seekForwardElement = seekForwardIcon
    })

    afterEach(() => {
      seekForwardIcon.remove()
    })

    it('overlay showing - seekForward button showing - do seek forward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekForwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).toHaveBeenCalledWith(10000)
      expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
    })

    it('disableOverlayTransitioning=true - do not seek forward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true
      uiController.overlayShowing = true

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekForwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })

    it('seekForward button not visible - do not seek forward', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true
      $(seekForwardIcon).hide()

      const triggerAdjustSeekPositionEventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
      triggerAdjustSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekForwardEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerAdjustSeekPositionEventSpy).not.toHaveBeenCalled()
      expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
    })
  })

  describe('uiSeekBarChangeHandler', () => {
    let seekBarElement
    let currentTimePositionElement
    beforeEach(() => {
      const body = $('body')
      seekBarElement = $(`<div id="seekBar"></div>`)
      body.append(seekBarElement)
      uiController.seekBarElement = seekBarElement

      currentTimePositionElement = $(`<div id="currentTimePosition"></div>`)
      body.append(currentTimePositionElement)
      uiController.currentTimePositionElement = currentTimePositionElement
    })

    afterEach(() => {
      seekBarElement.remove()
      currentTimePositionElement.remove()
    })

    it('isSeeking = true', done => {
      // Arrange
      uiController.isSeeking = true
      $(uiController.seekBarElement).val(25)
      uiController.duration = 100

      const formatMillisecondsSpy = spyOn(Util, 'formatMilliseconds')
      formatMillisecondsSpy.and.returnValue('dummy-formatted-time')

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekBarChangeHandler()

      // Assert
      setTimeout(() => {
        expect(result).toBeUndefined()
        expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
        expect($(uiController.currentTimePositionElement).html()).toEqual('dummy-formatted-time')
        done()
      }, 100)
    })

    it('isSeeking = false', done => {
      // Arrange
      uiController.isSeeking = false
      $(uiController.seekBarElement).val(25)
      uiController.duration = 100

      const formatMillisecondsSpy = spyOn(Util, 'formatMilliseconds')
      formatMillisecondsSpy.and.returnValue('dummy-formatted-time')

      const triggerSetSeekPositionEventSpy = spyOn(EventUtil, 'triggerSetSeekPositionEvent')
      triggerSetSeekPositionEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiSeekBarChangeHandler()

      // Assert
      setTimeout(() => {
        expect(result).toBeUndefined()
        expect(triggerSetSeekPositionEventSpy).not.toHaveBeenCalled()
        expect(hideControlOverlayAfter3000msSpy).not.toHaveBeenCalled()
        expect($(uiController.currentTimePositionElement).html()).toEqual('')
        done()
      }, 100)
    })
  })

  describe('uiSeekStartHandler', () => {
    it('overlayShowing = true', () => {
      // Arrange
      uiController.isSeeking = false
      uiController.overlayShowing = true

      // Act
      const result = uiController.uiSeekStartHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.isSeeking).toBeTruthy()
    })

    it('overlayShowing = false', () => {
      // Arrange
      uiController.isSeeking = false
      uiController.overlayShowing = false

      // Act
      const result = uiController.uiSeekStartHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.isSeeking).toBeFalsy()
    })
  })

  it('uiSeekEndHandler', () => {
    // Arrange
    uiController.isSeeking = true

    const triggerSetSeekPositionEventSpy = spyOn(EventUtil, 'triggerSetSeekPositionEvent')
    triggerSetSeekPositionEventSpy.and.returnValue(undefined)

    // Act
    const result = uiController.uiSeekEndHandler()

    // Assert
    expect(result).toBeUndefined()
    expect(uiController.isSeeking).toBeFalsy()
    expect(triggerSetSeekPositionEventSpy).toHaveBeenCalledTimes(1)
  })

  describe('uiClosedCaptioningEventHandler', () => {
    beforeEach(() => {
      const body = $('body')
      body.append($(`<div id="controlsContainer"></div>`))
      body.append($(`<div id="ccOptionsContainer" style="display: none;"></div>`))
    })

    afterEach(() => {
      $('#controlsContainer').remove()
      $('#ccOptionsContainer').remove()
    })

    it('success', () => {
      // Arrange
      uiController.disableOverlayTransitioning = false

      const clearTimeoutSpy = spyOn(window, 'clearTimeout')
      clearTimeoutSpy.and.returnValue(undefined)

      const triggerPauseEventSpy = spyOn(EventUtil, 'triggerPauseEvent')
      triggerPauseEventSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiClosedCaptioningEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.disableOverlayTransitioning).toBeTruthy()
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(triggerPauseEventSpy).toHaveBeenCalledTimes(1)
      expect($('#controlsContainer').is(':visible')).toBeFalsy()
      expect($('#ccOptionsContainer').is(':visible')).toBeTruthy()
    })
  })

  describe('uiCloseClosedCaptioningEventHandler', () => {
    beforeEach(() => {
      const body = $('body')
      body.append($(`<div id="controlsContainer" style="display: none;"></div>`))
      body.append($(`<div id="ccOptionsContainer"></div>`))
    })

    afterEach(() => {
      $('#controlsContainer').remove()
      $('#ccOptionsContainer').remove()
    })

    it('success', () => {
      // Arrange
      uiController.disableOverlayTransitioning = true

      const clearTimeoutSpy = spyOn(window, 'clearTimeout')
      clearTimeoutSpy.and.returnValue(undefined)

      const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
      triggerResumeEventSpy.and.returnValue(undefined)

      const hideControlOverlayAfter3000msSpy = spyOn(uiController, 'hideControlOverlayAfter3000ms')
      hideControlOverlayAfter3000msSpy.and.returnValue(undefined)

      // Act
      const result = uiController.uiCloseClosedCaptioningEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.disableOverlayTransitioning).toBeFalsy()
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(triggerResumeEventSpy).toHaveBeenCalledTimes(1)
      expect(triggerResumeEventSpy).toHaveBeenCalledTimes(1)
      expect(hideControlOverlayAfter3000msSpy).toHaveBeenCalledTimes(1)
      expect($('#controlsContainer').is(':visible')).toBeTruthy()
      expect($('#ccOptionsContainer').is(':visible')).toBeFalsy()
    })
  })

  it('uiCloseClosedCaptioningLanguageChangeEventHandler', () => {
    // Arrange
    const evt = {
      target: {
        value: 'dummy-val'
      }
    }
    const triggerWebPlayerClosedCaptioningLanguageChangeEventSpy = spyOn(EventUtil, 'triggerWebPlayerClosedCaptioningLanguageChangeEvent')
    triggerWebPlayerClosedCaptioningLanguageChangeEventSpy.and.returnValue(undefined)

    // Act
    const result = uiController.uiCloseClosedCaptioningLanguageChangeEventHandler(evt)

    // Assert
    expect(result).toBeUndefined()
    expect(triggerWebPlayerClosedCaptioningLanguageChangeEventSpy).toHaveBeenCalledWith('dummy-val')
  })

  it('uiWebPlayerCloseEventHandler', () => {
    // Arrange
    const triggerWebPlayerCloseEventSpy = spyOn(EventUtil, 'triggerWebPlayerCloseEvent')
    triggerWebPlayerCloseEventSpy.and.returnValue(undefined)

    // Act
    const result = uiController.uiWebPlayerCloseEventHandler()

    // Assert
    expect(result).toBeUndefined()
    expect(triggerWebPlayerCloseEventSpy).toHaveBeenCalledTimes(1)
  })

  describe('webPlayerPlayingEventHandler', () => {
    let playIconElement
    let pauseIconElement
    beforeEach(() => {
      const body = $('body')
      playIconElement = $(`<div id="play"></div>`)
      body.append(playIconElement)
      uiController.playIconElement = playIconElement

      pauseIconElement = $(`<div id="pause" style="display: none;"></div>`)
      body.append(pauseIconElement)
      uiController.pauseIconElement = pauseIconElement
    })

    afterEach(() => {
      playIconElement.remove()
      pauseIconElement.remove()
    })

    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const result = uiController.webPlayerPlayingEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.playIconElement).is(':visible')).toBeFalsy()
      expect($(uiController.pauseIconElement).is(':visible')).toBeTruthy()
    })
  })

  describe('webPlayerPausedEventHandler', () => {
    let playIconElement
    let pauseIconElement
    beforeEach(() => {
      const body = $('body')
      playIconElement = $(`<div id="play" style="display: none;"></div>`)
      body.append(playIconElement)
      uiController.playIconElement = playIconElement

      pauseIconElement = $(`<div id="pause" ></div>`)
      body.append(pauseIconElement)
      uiController.pauseIconElement = pauseIconElement
    })

    afterEach(() => {
      playIconElement.remove()
      pauseIconElement.remove()
    })

    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const result = uiController.webPlayerPausedEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.playIconElement).is(':visible')).toBeTruthy()
      expect($(uiController.pauseIconElement).is(':visible')).toBeFalsy()
    })
  })

  describe('webPlayerTimeUpdateEventHandler', () => {
    let currentTimePositionElement
    let videoDurationElement
    let seekBarElement
    beforeEach(() => {
      const body = $('body')

      currentTimePositionElement = $(`<div id="currentTimePosition"></div>`)
      body.append(currentTimePositionElement)
      uiController.currentTimePositionElement = currentTimePositionElement

      videoDurationElement = $(`<div id="videoDuration"></div>`)
      body.append(videoDurationElement)
      uiController.videoDurationElement = videoDurationElement

      seekBarElement = $(`<div id="seekBar"></div>`)
      body.append(seekBarElement)
      uiController.seekBarElement = seekBarElement
    })

    afterEach(() => {
      currentTimePositionElement.remove()
      videoDurationElement.remove()
      seekBarElement.remove()
    })

    it('isSeeking=false', () => {
      // Arrange
      const evt = {}
      const params = {
        positionInMilliseconds: 25000,
        duration: 100000
      }
      const formatMillisecondsSpy = spyOn(Util, 'formatMilliseconds')
      formatMillisecondsSpy.and.returnValues('dummy-time', 'dummy-duration')
      uiController.isSeeking = false

      // Act
      const result = uiController.webPlayerTimeUpdateEventHandler(evt, params)

      // Assert
      expect(result).toBeUndefined()
      expect(formatMillisecondsSpy).toHaveBeenCalledTimes(2)
      expect($(uiController.currentTimePositionElement).html()).toEqual('dummy-time')
      expect($(uiController.videoDurationElement).html()).toEqual('dummy-duration')
      expect($(uiController.seekBarElement).val()).toEqual('25')
    })

    it('isSeeking=true', () => {
      // Arrange
      const evt = {}
      const params = {
        positionInMilliseconds: 25000,
        duration: 100000
      }
      const formatMillisecondsSpy = spyOn(Util, 'formatMilliseconds')
      formatMillisecondsSpy.and.returnValues('dummy-time', 'dummy-duration')
      uiController.isSeeking = true

      // Act
      const result = uiController.webPlayerTimeUpdateEventHandler(evt, params)

      // Assert
      expect(result).toBeUndefined()
      expect(formatMillisecondsSpy).not.toHaveBeenCalled()
      expect($(uiController.currentTimePositionElement).html()).toEqual('')
      expect($(uiController.videoDurationElement).html()).toEqual('')
      expect($(uiController.seekBarElement).val()).toEqual('')
    })
  })

  describe('webPlayerLoadEventHandler', () => {
    let currentTimePositionElement
    let videoDurationElement
    let seekBackwardElement
    let seekForwardElement
    let seekBarRowElement
    let videoTitleElement
    let videoSmallTitleElement
    let closedCaptioningElement
    let nextEpisodeRowElement
    beforeEach(() => {
      const body = $('body')

      currentTimePositionElement = $(`<div id="currentTimePosition"></div>`)
      body.append(currentTimePositionElement)
      uiController.currentTimePositionElement = currentTimePositionElement

      videoDurationElement = $(`<div id="videoDuration"></div>`)
      body.append(videoDurationElement)
      uiController.videoDurationElement = videoDurationElement

      seekBackwardElement = $(`<div id="seekBackward"></div>`)
      body.append(seekBackwardElement)
      uiController.seekBackwardElement = seekBackwardElement

      seekForwardElement = $(`<div id="seekForward"></div>`)
      body.append(seekForwardElement)
      uiController.seekForwardElement = seekForwardElement

      seekBarRowElement = $(`<div id="seekBarRow"></div>`)
      body.append(seekBarRowElement)
      uiController.seekBarRowElement = seekBarRowElement

      videoTitleElement = $(`<div id="videoTitle"></div>`)
      body.append(videoTitleElement)
      uiController.videoTitleElement = videoTitleElement

      videoSmallTitleElement = $(`<div id="videoSmallTitle"></div>`)
      body.append(videoSmallTitleElement)
      uiController.videoSmallTitleElement = videoSmallTitleElement

      closedCaptioningElement = $(`<div id="closedCaptioning"></div>`)
      body.append(closedCaptioningElement)
      uiController.closedCaptioningElement = closedCaptioningElement

      nextEpisodeRowElement = $(`<div id="nextEpisodeRow"></div>`)
      body.append(nextEpisodeRowElement)
      uiController.nextEpisodeRowElement = nextEpisodeRowElement
    })

    afterEach(() => {
      currentTimePositionElement.remove()
      videoDurationElement.remove()
      seekBarRowElement.remove()
      videoTitleElement.remove()
      videoSmallTitleElement.remove()
      closedCaptioningElement.remove()
      nextEpisodeRowElement.remove()
    })

    it('regular video - no subtitles', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          name: 'dummy-title'
        }
      }
      const playbackParams = new PlaybackParams({
        contentUri: Util.base64Encode(JSON.stringify(contentUri))
      })

      const positionControlsSpy = spyOn(uiController, 'positionControls')
      positionControlsSpy.and.returnValue(undefined)

      // Act
      const result = uiController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.videoTitleElement).html()).toEqual('dummy-title')
      expect($(uiController.videoSmallTitleElement).html()).toEqual('')
      expect(uiController.closedCaptioningEnabled).toBeFalsy()
      expect($(uiController.closedCaptioningElement).is(':visible')).toBeFalsy('closed captioning element should be invisible')
      expect($(uiController.seekBackwardElement).is(':visible')).toBeTruthy('seek backward element should be visible')
      expect($(uiController.seekForwardElement).is(':visible')).toBeTruthy('seek forward element should be visible')
      expect($(uiController.seekBarRowElement).is(':visible')).toBeTruthy('seek bar element should be visible')
      expect($(uiController.nextEpisodeRowElement).is(':visible')).toBeFalsy('next episode row should not be visible')
      expect(positionControlsSpy).toHaveBeenCalledTimes(1)
    })

    it('regular video - with subtitles', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          name: 'dummy-title',
          closedCaptionsFile: 'dummy-cc-file'
        }
      }
      const playbackParams = new PlaybackParams({
        contentUri: Util.base64Encode(JSON.stringify(contentUri))
      })

      const positionControlsSpy = spyOn(uiController, 'positionControls')
      positionControlsSpy.and.returnValue(undefined)

      // Act
      const result = uiController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.videoTitleElement).html()).toEqual('dummy-title')
      expect($(uiController.videoSmallTitleElement).html()).toEqual('')
      expect(uiController.closedCaptioningEnabled).toBeTruthy()
      expect($(uiController.closedCaptioningElement).is(':visible')).toBeTruthy('closed captioning element should be visible')
      expect($(uiController.seekBackwardElement).is(':visible')).toBeTruthy('seek backward element should be visible')
      expect($(uiController.seekForwardElement).is(':visible')).toBeTruthy('seek forward element should be visible')
      expect($(uiController.seekBarRowElement).is(':visible')).toBeTruthy('seek bar element should be visible')
      expect($(uiController.nextEpisodeRowElement).is(':visible')).toBeFalsy('next episode row should not be visible')
      expect(positionControlsSpy).toHaveBeenCalledTimes(1)
    })

    it('tv/live - no subtitles', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          name: 'dummy-title',
          networkDetails: { key: 'value' }
        }
      }
      const playbackParams = new PlaybackParams({
        contentUri: Util.base64Encode(JSON.stringify(contentUri))
      })

      const positionControlsSpy = spyOn(uiController, 'positionControls')
      positionControlsSpy.and.returnValue(undefined)

      // Act
      const result = uiController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.videoTitleElement).html()).toEqual('dummy-title')
      expect($(uiController.videoSmallTitleElement).html()).toEqual('')
      expect(uiController.closedCaptioningEnabled).toBeFalsy()
      expect($(uiController.closedCaptioningElement).is(':visible')).toBeFalsy('closed captioning element should be invisible')
      expect($(uiController.seekBackwardElement).is(':visible')).toBeFalsy('seek backward element should be invisible')
      expect($(uiController.seekForwardElement).is(':visible')).toBeFalsy('seek forward element should be invisible')
      expect($(uiController.seekBarRowElement).is(':visible')).toBeFalsy('seek bar element should be invisible')
      expect($(uiController.nextEpisodeRowElement).is(':visible')).toBeFalsy('next episode row should not be visible')
      expect(positionControlsSpy).toHaveBeenCalledTimes(1)
    })

    it('episodic content - no subtitles', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          name: 'dummy-title',
          episodeName: 'dummy-episode-name',
          seasonNumber: '1',
          episodeNumber: '2',
          nextEpisode: {
            id: 'dummy-id'
          }
        }
      }
      const playbackParams = new PlaybackParams({
        contentUri: Util.base64Encode(JSON.stringify(contentUri))
      })
      const positionControlsSpy = spyOn(uiController, 'positionControls')
      positionControlsSpy.and.returnValue(undefined)

      // Act
      const result = uiController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect($(uiController.videoTitleElement).html()).toEqual('dummy-episode-name')
      expect($(uiController.videoSmallTitleElement).html()).toEqual('dummy-title, Season 1, Ep. 2')
      expect(uiController.closedCaptioningEnabled).toBeFalsy()
      expect($(uiController.closedCaptioningElement).is(':visible')).toBeFalsy('closed captioning element should be invisible')
      expect($(uiController.seekBackwardElement).is(':visible')).toBeTruthy('seek backward element should be visible')
      expect($(uiController.seekForwardElement).is(':visible')).toBeTruthy('seek forward element should be visible')
      expect($(uiController.seekBarRowElement).is(':visible')).toBeTruthy('seek bar element should be visible')
      expect($(uiController.nextEpisodeRowElement).is(':visible')).toBeTruthy('next episode row should be visible')
      expect(positionControlsSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('showControlsOverlay', () => {
    let controlsOverlayElement
    let controlsContainerElement
    beforeEach(() => {
      const body = $('body')

      controlsOverlayElement = $(`<div id="controlsOverlay"></div>`)
      body.append(controlsOverlayElement)
      uiController.controlsOverlayElement = controlsOverlayElement

      controlsContainerElement = $(`<div id="controlsContainer"></div>`)
      body.append(controlsContainerElement)
      uiController.controlsContainerElement = controlsContainerElement
    })

    afterEach(() => {
      controlsOverlayElement.remove()
      controlsContainerElement.remove()
    })

    it('default', done => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = false

      // Act
      const result = uiController.showControlsOverlay()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.disableOverlayTransitioning).toBeTruthy()
      expect(uiController.overlayShowing).toBeFalsy()
      expect($(controlsOverlayElement).hasClass('fade-out')).toBeFalsy()
      expect($(controlsOverlayElement).hasClass('hidden')).toBeFalsy()
      expect($(controlsOverlayElement).hasClass('fade-in')).toBeTruthy()
      expect($(controlsContainerElement).hasClass('fade-out')).toBeFalsy()
      expect($(controlsContainerElement).hasClass('hidden')).toBeFalsy()
      expect($(controlsContainerElement).hasClass('fade-in')).toBeTruthy()
      setTimeout(() => {
        expect(uiController.disableOverlayTransitioning).toBeFalsy()
        expect(uiController.overlayShowing).toBeTruthy()
        done()
      }, 300)
    })
  })

  describe('hideControlsOverlay', () => {
    let controlsOverlayElement
    let controlsContainerElement
    beforeEach(() => {
      const body = $('body')

      controlsOverlayElement = $(`<div id="controlsOverlay"></div>`)
      body.append(controlsOverlayElement)
      uiController.controlsOverlayElement = controlsOverlayElement

      controlsContainerElement = $(`<div id="controlsContainer"></div>`)
      body.append(controlsContainerElement)
      uiController.controlsContainerElement = controlsContainerElement
    })

    afterEach(() => {
      controlsOverlayElement.remove()
      controlsContainerElement.remove()
    })

    it('default', done => {
      // Arrange
      uiController.disableOverlayTransitioning = false
      uiController.overlayShowing = true

      // Act
      const result = uiController.hideControlsOverlay()

      // Assert
      expect(result).toBeUndefined()
      expect(uiController.disableOverlayTransitioning).toBeTruthy()
      expect(uiController.overlayShowing).toBeTruthy()
      expect($(controlsOverlayElement).hasClass('fade-in')).toBeFalsy()
      expect($(controlsOverlayElement).hasClass('hidden')).toBeFalsy()
      expect($(controlsOverlayElement).hasClass('fade-out')).toBeTruthy()
      expect($(controlsContainerElement).hasClass('fade-in')).toBeFalsy()
      expect($(controlsContainerElement).hasClass('hidden')).toBeFalsy()
      expect($(controlsContainerElement).hasClass('fade-out')).toBeTruthy()
      setTimeout(() => {
        expect(uiController.disableOverlayTransitioning).toBeFalsy()
        expect(uiController.overlayShowing).toBeFalsy()
        done()
      }, 500)
    })
  })

  describe('hideControlOverlayAfter3000ms', () => {
    it('hideControlsOverlayTimeout = undefined', done => {
      // Arrange
      uiController.hideControlsOverlayTimeout = undefined

      const clearTimeoutSpy = spyOn(window, 'clearTimeout')
      clearTimeoutSpy.and.returnValue(undefined)

      const hideControlsOverlaySpy = spyOn(uiController, 'hideControlsOverlay')
      hideControlsOverlaySpy.and.returnValue(undefined)

      // Act
      const result = uiController.hideControlOverlayAfter3000ms()

      // Assert
      expect(result).toBeUndefined()
      expect(hideControlsOverlaySpy).not.toHaveBeenCalled()
      expect(clearTimeoutSpy).not.toHaveBeenCalled()
      setTimeout(() => {
        expect(hideControlsOverlaySpy).toHaveBeenCalledTimes(1)
        done()
      }, 4000)
    })
  })

  describe('uiWebPlayerNextEpisodeEventHandler', () => {
    afterEach(() => {
      uiController.videoMetadata = null
    })

    it('valid next episode', () => {
      // Arrange
      uiController.videoMetadata = {
        nextEpisode: {
          id: 'dummy-id'
        }
      }
      const triggerNextEventSpy = spyOn(EventUtil, 'triggerNextEvent')
      triggerNextEventSpy.and.returnValue(Promise.resolve(undefined))

      // Act
      const result = uiController.uiWebPlayerNextEpisodeEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerNextEventSpy).toHaveBeenCalledWith('dummy-id')
    })

    it('invalid next episode', () => {
      // Arrange
      uiController.videoMetadata = {
        junk: 'junk'
      }
      const triggerNextEventSpy = spyOn(EventUtil, 'triggerNextEvent')
      triggerNextEventSpy.and.returnValue(Promise.resolve(undefined))

      // Act
      const result = uiController.uiWebPlayerNextEpisodeEventHandler()

      // Assert
      expect(result).toBeUndefined()
      expect(triggerNextEventSpy).not.toHaveBeenCalled()
    })
  })
})
