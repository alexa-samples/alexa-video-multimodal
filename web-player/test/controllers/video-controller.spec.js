import { VideoController } from '../../src/controllers/video-controller'
import $ from 'jquery'
import { TestUtils } from '../test-utils.spec'
import { WebPlayerEvent } from '../../src/enums/web-player-event'
import { VideoEvent } from '../../src/enums/video-event'
import { EventUtil } from '../../src/util/event-util'
import { PlaybackParams } from '../../src/models/playback-params'

describe('VideoController', () => {
  let videoController = null

  beforeEach(() => {
    videoController = new VideoController()
    const testDom = TestUtils.getTestDom()
    videoController.videoElement = testDom.find('#player')
    videoController.videoElement.addEventListener = () => {}
    window.$ = $
  })

  afterEach(() => {
    videoController = null
  })

  it('init', () => {
    // Arrange
    const setVideoEventHandlersSpy = spyOn(videoController, 'setVideoEventHandlers')
    const setWebPlayerEventHandlersSpy = spyOn(videoController, 'setWebPlayerEventHandlers')

    // Act
    const result = videoController.init()

    // Assert
    expect(result).toBeUndefined()
    expect(setVideoEventHandlersSpy).toHaveBeenCalledTimes(1)
    expect(setWebPlayerEventHandlersSpy).toHaveBeenCalledTimes(1)
  })

  it('setVideoEventHandlers', () => {
    // Arrange
    // Nothing to arrange

    // Act
    const result = videoController.setVideoEventHandlers()

    // Assert
    expect(result).toBeUndefined()
    expect(videoController.videoElement.oncanplay).toBeDefined()
    expect(videoController.videoElement.onplaying).toBeDefined()
    expect(videoController.videoElement.onpause).toBeDefined()
    expect(videoController.videoElement.ontimeupdate).toBeDefined()
    expect(videoController.videoElement.onwaiting).toBeDefined()
    expect(videoController.videoElement.onended).toBeDefined()
    expect(videoController.videoElement.onerror).toBeDefined()
  })

  it('setWebPlayerEventHandlers', () => {
    // Arrange
    const body = $('body')
    const jquerySpy = spyOn(window, '$')
    jquerySpy.and.returnValue(body)

    // Act
    const result = videoController.setWebPlayerEventHandlers()

    // Assert
    expect(result).toBeUndefined()
    const events = $._data(body.get(0), 'events')

    expect(events[WebPlayerEvent.LOAD]).toBeDefined()
    expect(events[WebPlayerEvent.CAN_PLAY]).toBeDefined()
    expect(events[WebPlayerEvent.RESUME]).toBeDefined()
    expect(events[WebPlayerEvent.PAUSE]).toBeDefined()
    expect(events[WebPlayerEvent.SET_SEEK_POSITION]).toBeDefined()
    expect(events[WebPlayerEvent.ADJUST_SEEK_POSITION]).toBeDefined()
  })
  it('video CAN_PLAY handler', () => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerCanPlayEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()

    // Act
    const result = videoController.videoHandlers[VideoEvent.CAN_PLAY]()

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith()
  })

  it('video PLAYING handler', () => {
    // Arrange
    videoController.videoElement = {
      currentTime: 123,
      addEventListener: () => {}
    }
    const eventSpy = spyOn(EventUtil, 'triggerPlayingEventEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()
    const evt = {}

    // Act
    const result = videoController.videoHandlers[VideoEvent.PLAYING](evt)

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith(123000)
  })
  it('video PAUSED handler', () => {
    // Arrange
    videoController.videoElement = {
      currentTime: 123,
      addEventListener: () => {}
    }
    const eventSpy = spyOn(EventUtil, 'triggerPausedEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()
    const evt = {}

    // Act
    const result = videoController.videoHandlers[VideoEvent.PAUSED](evt)

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith(123000)
  })

  it('video TIME_UPDATE handler', () => {
    // Arrange
    videoController.videoElement = {
      currentTime: 123,
      duration: 456,
      addEventListener: () => {}
    }
    videoController.videoMetadata = { id: 'dummy-id' }
    const eventSpy = spyOn(EventUtil, 'triggerTimeUpdateEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()

    const evt = {}

    // Act
    const result = videoController.videoHandlers[VideoEvent.TIME_UPDATE](evt)

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith(123000, 456000, 'dummy-id')
  })

  it('video WAITING handler', () => {
    // Arrange
    videoController.videoElement = {
      currentTime: 123,
      addEventListener: () => {}
    }
    const eventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()
    const evt = {}

    // Act
    const result = videoController.videoHandlers[VideoEvent.WAITING](evt)

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith(123000)
  })

  it('video ENDED handler', () => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerEndEventEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()

    // Act
    const result = videoController.videoHandlers[VideoEvent.ENDED]()

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledWith()
  })

  it('video ERROR handler', () => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerErrorEvent')
    eventSpy.and.returnValue(undefined)
    videoController.setVideoEventHandlers()

    // Act
    const result = videoController.videoHandlers[VideoEvent.ERROR]()

    // Assert
    expect(result).toBeUndefined()
    expect(eventSpy).toHaveBeenCalledTimes(1)
  })

  describe('webPlayerLoadEventHandler', () => {
    it('mp4 file', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-stream-url.mp4'
        }
      }
      const playbackParams = new PlaybackParams()
      playbackParams.contentUri = contentUri

      const sourceElement = {
        setAttribute: () => {
        }
      }
      const setAttributeSpy = spyOn(sourceElement, 'setAttribute')
      setAttributeSpy.and.returnValue(undefined)

      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(sourceElement)

      videoController.videoElement = {
        innerHTML: '',
        appendChild: () => {
        },
        load: () => {
        },
        currentTime: 0
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      const loadSpy = spyOn(videoController.videoElement, 'load')
      loadSpy.and.returnValue(undefined)

      const triggerBufferingEventEventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
      triggerBufferingEventEventSpy.and.returnValue(undefined)

      const setPositionSpy = spyOn(videoController, 'setPosition')
      setPositionSpy.and.returnValue(undefined)

      const getStartPositionSpy = spyOn(videoController, 'getStartPosition')
      getStartPositionSpy.and.returnValue(0)

      // Act
      const result = videoController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).toHaveBeenCalledWith('source')
      expect(setAttributeSpy).toHaveBeenCalledWith('src', contentUri.videoMetadata.videoUrl)
      expect(setAttributeSpy).toHaveBeenCalledWith('type', 'video/mp4')
      expect(appendChildSpy).toHaveBeenCalledWith(sourceElement)
      expect(videoController.videoElement.currentTime).toEqual(0)
      expect(loadSpy).toHaveBeenCalledWith()
      expect(triggerBufferingEventEventSpy).toHaveBeenCalledWith(0)
      expect(setPositionSpy).not.toHaveBeenCalled()
      expect(getStartPositionSpy).toHaveBeenCalledTimes(1)
    })

    it('m3u8 file', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-stream-url.m3u8'
        }
      }
      const playbackParams = new PlaybackParams()
      playbackParams.contentUri = contentUri

      const sourceElement = {
        setAttribute: () => {
        }
      }
      const setAttributeSpy = spyOn(sourceElement, 'setAttribute')
      setAttributeSpy.and.returnValue(undefined)

      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(sourceElement)

      videoController.videoElement = {
        innerHTML: '',
        appendChild: () => {
        },
        load: () => {
        },
        currentTime: 0
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      const loadSpy = spyOn(videoController.videoElement, 'load')
      loadSpy.and.returnValue(undefined)

      const triggerBufferingEventEventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
      triggerBufferingEventEventSpy.and.returnValue(undefined)

      const setPositionSpy = spyOn(videoController, 'setPosition')
      setPositionSpy.and.returnValue(undefined)

      const getStartPositionSpy = spyOn(videoController, 'getStartPosition')
      getStartPositionSpy.and.returnValue(0)
      //
      // Act
      const result = videoController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).toHaveBeenCalledWith('source')
      expect(setAttributeSpy).toHaveBeenCalledWith('src', contentUri.videoMetadata.videoUrl)
      expect(setAttributeSpy).toHaveBeenCalledWith('type', 'application/x-mpeg')
      expect(appendChildSpy).toHaveBeenCalledWith(sourceElement)
      expect(videoController.videoElement.currentTime).toEqual(0)
      expect(loadSpy).toHaveBeenCalledWith()
      expect(triggerBufferingEventEventSpy).toHaveBeenCalledWith(0)
      expect(setPositionSpy).not.toHaveBeenCalled()
      expect(getStartPositionSpy).toHaveBeenCalledTimes(1)
    })

    it('webm file', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-stream-url.webm'
        }
      }
      const playbackParams = new PlaybackParams()
      playbackParams.contentUri = contentUri

      const sourceElement = {
        setAttribute: () => {
        }
      }
      const setAttributeSpy = spyOn(sourceElement, 'setAttribute')
      setAttributeSpy.and.returnValue(undefined)

      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(sourceElement)

      videoController.videoElement = {
        innerHTML: '',
        appendChild: () => {
        },
        load: () => {
        },
        currentTime: 0
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      const loadSpy = spyOn(videoController.videoElement, 'load')
      loadSpy.and.returnValue(undefined)

      const triggerBufferingEventEventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
      triggerBufferingEventEventSpy.and.returnValue(undefined)

      const setPositionSpy = spyOn(videoController, 'setPosition')
      setPositionSpy.and.returnValue(undefined)

      const getStartPositionSpy = spyOn(videoController, 'getStartPosition')
      getStartPositionSpy.and.returnValue(0)
      //
      // Act
      const result = videoController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).toHaveBeenCalledWith('source')
      expect(setAttributeSpy).toHaveBeenCalledWith('src', contentUri.videoMetadata.videoUrl)
      expect(setAttributeSpy).toHaveBeenCalledWith('type', 'video/webm')
      expect(appendChildSpy).toHaveBeenCalledWith(sourceElement)
      expect(videoController.videoElement.currentTime).toEqual(0)
      expect(loadSpy).toHaveBeenCalledWith()
      expect(triggerBufferingEventEventSpy).toHaveBeenCalledWith(0)
      expect(setPositionSpy).not.toHaveBeenCalled()
      expect(getStartPositionSpy).toHaveBeenCalledTimes(1)
    })

    it('offsetInMilliseconds=999 file', () => {
      // Arrange
      const evt = {}
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-stream-url.webm'
        }
      }
      const playbackParams = new PlaybackParams()
      playbackParams.contentUri = contentUri
      playbackParams.offsetInMilliseconds = 999

      const sourceElement = {
        setAttribute: () => {
        }
      }
      const setAttributeSpy = spyOn(sourceElement, 'setAttribute')
      setAttributeSpy.and.returnValue(undefined)

      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(sourceElement)

      videoController.videoElement = {
        innerHTML: '',
        appendChild: () => {
        },
        load: () => {
        },
        currentTime: 0
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      const loadSpy = spyOn(videoController.videoElement, 'load')
      loadSpy.and.returnValue(undefined)

      const triggerBufferingEventEventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
      triggerBufferingEventEventSpy.and.returnValue(undefined)

      const setPositionSpy = spyOn(videoController, 'setPosition')
      setPositionSpy.and.returnValue(undefined)

      // Act
      const result = videoController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).toHaveBeenCalledWith('source')
      expect(setAttributeSpy).toHaveBeenCalledWith('src', contentUri.videoMetadata.videoUrl)
      expect(setAttributeSpy).toHaveBeenCalledWith('type', 'video/webm')
      expect(appendChildSpy).toHaveBeenCalledWith(sourceElement)
      expect(loadSpy).toHaveBeenCalledWith()
      expect(triggerBufferingEventEventSpy).toHaveBeenCalledWith(0)
    })

    it('unsupported file type', () => {
      // Arrange
      const evt = {}
      const playbackParams = new PlaybackParams()
      playbackParams.contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-stream-url.junk'
        }
      }

      const sourceElement = {
        setAttribute: () => {
        }
      }
      const setAttributeSpy = spyOn(sourceElement, 'setAttribute')
      setAttributeSpy.and.returnValue(undefined)

      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(sourceElement)

      videoController.videoElement = {
        innerHTML: '',
        appendChild: () => {
        },
        load: () => {
        },
        currentTime: 0
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      const loadSpy = spyOn(videoController.videoElement, 'load')
      loadSpy.and.returnValue(undefined)

      const triggerBufferingEventEventSpy = spyOn(EventUtil, 'triggerBufferingEventEvent')
      triggerBufferingEventEventSpy.and.returnValue(undefined)

      const setPositionSpy = spyOn(videoController, 'setPosition')
      setPositionSpy.and.returnValue(undefined)

      const getStartPositionSpy = spyOn(videoController, 'getStartPosition')
      getStartPositionSpy.and.returnValue(0)

      const triggerErrorEventSpy = spyOn(EventUtil, 'triggerErrorEvent')
      triggerErrorEventSpy.and.returnValue(undefined)

      // Act
      const result = videoController.webPlayerLoadEventHandler(evt, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(triggerErrorEventSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('webPlayerSetClosedCaptioningLanguageChangeEventHandler', () => {
    it('lang: en', () => {
      // Arrange
      const evt = {}
      const lang = 'en'
      videoController.videoMetadata = {
        closedCaptionsFile: 'dummy-cc-file'
      }
      const trackElement = {
        setAttribute: (key, value) => {}
      }
      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(trackElement)

      const setAttributeSpy = spyOn(trackElement, 'setAttribute')
      setAttributeSpy.and.returnValues(undefined, undefined, undefined, undefined, undefined, undefined)

      videoController.videoElement = {
        appendChild: () => {
        }
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      // Act
      const result = videoController.webPlayerSetClosedCaptioningLanguageChangeEventHandler(evt, lang)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).toHaveBeenCalledTimes(1)
      expect(setAttributeSpy).toHaveBeenCalledTimes(5)
      expect(appendChildSpy).toHaveBeenCalledTimes(1)
    })

    it('lang: en - no cc file', () => {
      // Arrange
      const evt = {}
      const lang = 'en'
      videoController.videoMetadata = {}
      const trackElement = {
        setAttribute: (key, value) => {}
      }
      const createElementSpy = spyOn(document, 'createElement')
      createElementSpy.and.returnValue(trackElement)

      const setAttributeSpy = spyOn(trackElement, 'setAttribute')
      setAttributeSpy.and.returnValues(undefined, undefined, undefined, undefined, undefined, undefined)

      videoController.videoElement = {
        appendChild: () => {
        }
      }

      const appendChildSpy = spyOn(videoController.videoElement, 'appendChild')
      appendChildSpy.and.returnValue(undefined)

      // Act
      const result = videoController.webPlayerSetClosedCaptioningLanguageChangeEventHandler(evt, lang)

      // Assert
      expect(result).toBeUndefined()
      expect(createElementSpy).not.toHaveBeenCalled()
      expect(setAttributeSpy).not.toHaveBeenCalled()
      expect(appendChildSpy).not.toHaveBeenCalled()
    })

    it('lang: disabled', () => {
      // Arrange
      const evt = {}
      const lang = 'disabled'
      videoController.trackElement = {
        remove: () => {}
      }
      const removeSpy = spyOn(videoController.trackElement, 'remove')
      removeSpy.and.returnValue(undefined)

      // Act
      const result = videoController.webPlayerSetClosedCaptioningLanguageChangeEventHandler(evt, lang)

      // Assert
      expect(result).toBeUndefined()
      expect(removeSpy).toHaveBeenCalledTimes(1)
    })

    it('lang: disabled - no track element', () => {
      // Arrange
      const evt = {}
      const lang = 'disabled'

      // Act
      const result = videoController.webPlayerSetClosedCaptioningLanguageChangeEventHandler(evt, lang)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('webPlayerCanPlayEventHandler', () => {
    it('autoPlay: false', () => {
      // Arrange
      const resizeVideoSpy = spyOn(videoController, 'resizeVideo')
      resizeVideoSpy.and.returnValue(undefined)
      videoController.videoElement = {
        play: (evt) => {
        }
      }
      const videoSpy = spyOn(videoController.videoElement, 'play')
      videoSpy.and.returnValue(Promise.resolve())
      videoController.autoPlay = false
      const evt = {}

      // Act
      const result = videoController.webPlayerCanPlayEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
      expect(resizeVideoSpy).toHaveBeenCalledTimes(1)
      expect(videoSpy).not.toHaveBeenCalledTimes(1)
    })

    it('autoPlay: true', () => {
      // Arrange
      const resizeVideoSpy = spyOn(videoController, 'resizeVideo')
      resizeVideoSpy.and.returnValue(undefined)
      videoController.videoElement = {
        play: (evt) => {
        }
      }
      const videoSpy = spyOn(videoController.videoElement, 'play')
      videoSpy.and.returnValue(Promise.resolve())
      videoController.autoPlay = true
      const evt = {}

      // Act
      const result = videoController.webPlayerCanPlayEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
      expect(resizeVideoSpy).toHaveBeenCalledTimes(1)
      expect(videoSpy).toHaveBeenCalledTimes(1)
      expect(videoController.autoPlay).toEqual(false)
    })
  })

  it('webPlayerPauseHandler', () => {
    // Arrange
    videoController.videoElement = {
      pause: (evt) => {

      }
    }
    const videoSpy = spyOn(videoController.videoElement, 'pause')
    videoSpy.and.returnValue(undefined)
    const evt = {}

    // Act
    const result = videoController.webPlayerPauseHandler(evt)

    // Assert
    expect(result).toBeUndefined()
    expect(videoSpy).toHaveBeenCalledWith()
  })

  it('webPlayerResumeEventHandler', () => {
    // Arrange
    videoController.videoElement = {
      play: (evt) => {
      }
    }
    const videoSpy = spyOn(videoController.videoElement, 'play')
    videoSpy.and.returnValue(Promise.resolve())
    const evt = {}

    // Act
    const result = videoController.webPlayerResumeEventHandler(evt)

    // Assert
    expect(result).toBeUndefined()
    expect(videoSpy).toHaveBeenCalledWith()
  })

  it('webPlayerSetSeekPositionEventHandler', () => {
    // Arrange
    const videoSpy = spyOn(videoController, 'setPosition')
    videoSpy.and.returnValue(undefined)
    const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
    triggerResumeEventSpy.and.returnValue(undefined)
    const evt = {}
    const positionInMilliseconds = 123

    // Act
    const result = videoController.webPlayerSetSeekPositionEventHandler(evt, positionInMilliseconds)

    // Assert
    expect(result).toBeUndefined()
    expect(videoSpy).toHaveBeenCalledWith(positionInMilliseconds)
    expect(triggerResumeEventSpy).toHaveBeenCalledTimes(1)
  })

  it('webPlayerAdjustSeekPositionEventHandler', () => {
    // Arrange
    videoController.videoElement = {
      currentTime: 456
    }
    const videoSpy = spyOn(videoController, 'setPosition')
    videoSpy.and.returnValue(undefined)
    const triggerResumeEventSpy = spyOn(EventUtil, 'triggerResumeEvent')
    triggerResumeEventSpy.and.returnValue(undefined)
    const evt = {}
    const positionInMilliseconds = 123

    // Act
    const result = videoController.webPlayerAdjustSeekPositionEventHandler(evt, positionInMilliseconds)

    // Assert
    expect(result).toBeUndefined()
    expect(videoSpy).toHaveBeenCalledWith(456123)
    expect(triggerResumeEventSpy).toHaveBeenCalledTimes(1)
  })

  describe('setPosition', () => {
    it('success', () => {
      // Arrange
      videoController.videoElement = {
        currentTime: 10,
        duration: 100
      }
      const positionInMilliseconds = 25000

      // Act
      const result = videoController.setPosition(positionInMilliseconds)

      // Assert
      expect(result).toBeUndefined()
      expect(videoController.videoElement.currentTime).toEqual(25)
    })

    it('past video end', () => {
      // Arrange
      videoController.videoElement = {
        currentTime: 10,
        duration: 100
      }
      const positionInMilliseconds = 999999999

      // Act
      const result = videoController.setPosition(positionInMilliseconds)

      // Assert
      expect(result).toBeUndefined()
      expect(videoController.videoElement.currentTime).toEqual(97)
    })

    it('past video end (short video)', () => {
      // Arrange
      videoController.videoElement = {
        currentTime: 10,
        duration: 2
      }
      const positionInMilliseconds = 999999999

      // Act
      const result = videoController.setPosition(positionInMilliseconds)

      // Assert
      expect(result).toBeUndefined()
      expect(videoController.videoElement.currentTime).toEqual(0)
    })

    it('before video start', () => {
      // Arrange
      videoController.videoElement = {
        currentTime: 10,
        duration: 100
      }
      const positionInMilliseconds = -100

      // Act
      const result = videoController.setPosition(positionInMilliseconds)

      // Assert
      expect(result).toBeUndefined()
      expect(videoController.videoElement.currentTime).toEqual(0)
    })
  })
})
