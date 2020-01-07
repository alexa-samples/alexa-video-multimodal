import { EventUtil } from '../../src/util/event-util'
import { AlexaController } from '../../src/controllers/alexa-controller'
import { TestUtils } from '../test-utils.spec'
import { PlayerStateModel } from '../../src/models/player-state-model'
import $ from 'jquery'
import { WebPlayerEvent } from '../../src/enums/web-player-event'
import { AlexaEvent } from '../../src/enums/alexa-event'
import { PlaybackParams } from '../../src/models/playback-params'
import { ContentType } from '../../src/enums/content-type'
import { PlayerState } from '../../src/enums/player-state'
import { ErrorType } from '../../src/enums/error-type'

describe('AlexaController', () => {
  let alexaController = null
  let AlexaWebPlayerController = null

  beforeEach(() => {
    alexaController = new AlexaController()
    alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
    AlexaWebPlayerController = TestUtils.getMockAlexaWebPlayerController()
    window.AlexaWebPlayerController = AlexaWebPlayerController
    window.$ = $
    window.alexaController = undefined
  })

  it('init', () => {
    // Arrange
    const initializeSpy = spyOn(AlexaWebPlayerController, 'initialize')

    // Act
    const result = alexaController.init()

    // Assert
    expect(result).toBeUndefined()
    expect(initializeSpy).toHaveBeenCalledTimes(1)
  })

  it('initializeReadyCallback', () => {
    // Arrange
    const alexaInterface = TestUtils.getMockAlexaInterface()

    const setAlexaEventHandlersSpy = spyOn(alexaController, 'setAlexaEventHandlers')
    setAlexaEventHandlersSpy.and.returnValue(undefined)
    const setupWebPlayerHandlersSpy = spyOn(alexaController, 'setupWebPlayerHandlers')
    setupWebPlayerHandlersSpy.and.returnValue(undefined)
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)
    const showLoadingOverlaySpy = spyOn(alexaInterface, 'showLoadingOverlay')
    showLoadingOverlaySpy.and.returnValue(undefined)

    // Act
    const result = alexaController.initializeReadyCallback(alexaInterface)

    // Assert
    expect(result).toBeUndefined()
    expect(setAlexaEventHandlersSpy).toHaveBeenCalledTimes(1)
    expect(setupWebPlayerHandlersSpy).toHaveBeenCalledTimes(1)
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.IDLE))
    expect(showLoadingOverlaySpy).toHaveBeenCalledWith(false)
    expect(window.alexaController).toEqual(alexaController)
  })

  it('initializeErrorCallback', () => {
    // Arrange
    // nothing to arrange

    // Act
    const result = alexaController.initializeErrorCallback('')

    // Assert
    expect(result).toBeUndefined()
  })

  it('setAlexaEventHandlers', () => {
    // Arrange
    const onSpy = spyOn(alexaController._alexaInterface, 'on')
    let registeredHandlers = null
    onSpy.and.callFake(args => {
      registeredHandlers = args
    })

    // Act
    const result = alexaController.setAlexaEventHandlers()

    // Assert
    expect(result).toBeUndefined()
    expect(registeredHandlers[AlexaEvent.LOAD_CONTENT]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.PAUSE]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.RESUME]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.PREPARE_FOR_CLOSE]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.SET_SEEK_POSITION]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.ADJUST_SEEK_POSITION]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.NEXT]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.PREVIOUS]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.CLOSED_CAPTIONS_STATE_CHANGE]).toBeDefined()
    expect(registeredHandlers[AlexaEvent.ACCESS_TOKEN_CHANGE]).toBeDefined()
  })

  it('setPlayerState', () => {
    // Arrange
    const setPlayerStateSpy = spyOn(alexaController._alexaInterface, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)
    const playerState = new PlayerStateModel(null, parseInt('0', 10))

    // Act
    const result = alexaController.setPlayerState(playerState)

    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(playerState)
  })

  it('setupWebPlayerHandlers', () => {
    // Arrange
    const body = $('body')
    const jquerySpy = spyOn(window, '$')
    jquerySpy.and.returnValue(body)

    // Act
    const result = alexaController.setupWebPlayerHandlers()

    // Assert
    expect(result).toBeUndefined()
    const events = $._data(body.get(0), 'events')

    expect(events[WebPlayerEvent.LOAD]).toBeDefined()
    expect(events[WebPlayerEvent.PAUSED]).toBeDefined()
    expect(events[WebPlayerEvent.PREPARE_FOR_CLOSE]).toBeDefined()
    expect(events[WebPlayerEvent.BUFFERING]).toBeDefined()
    expect(events[WebPlayerEvent.PLAYING]).toBeDefined()
    expect(events[WebPlayerEvent.END]).toBeDefined()
    expect(events[WebPlayerEvent.IDLE]).toBeDefined()
    expect(events[WebPlayerEvent.ACCESS_TOKEN_CHANGE]).toBeDefined()
  })

  it('webPlayerCleanupTimerReset', done => {
    // Arrange
    const clearTimeoutSpy = spyOn(window, 'clearTimeout')
    AlexaController.webPlayerTimeOut = setTimeout(() => {
      EventUtil.triggerWebPlayerCloseEvent()
    }, 300000)
    const expectedTimer = AlexaController.webPlayerTimeOut

    // Act
    AlexaController.webPlayerCleanupTimerReset()

    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalledWith(expectedTimer)
    expect(AlexaController.webPlayerTimeOut).toBeNull()
    done()
  })

  it('Alexa LOAD_CONTENT handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerLoadEvent')
    eventSpy.and.returnValue(undefined)
    alexaController.setAlexaEventHandlers()
    const playbackParams = new PlaybackParams({})

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.LOAD_CONTENT](playbackParams)

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerLoadEvent).toHaveBeenCalledWith(playbackParams)
      done()
    }).catch(done.fail)
  })

  it('Alexa PAUSE handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerPauseEvent')
    eventSpy.and.returnValue(undefined)
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.PAUSE]()

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerPauseEvent).toHaveBeenCalledWith()
      done()
    }).catch(done.fail)
  })

  it('Alexa RESUME handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerResumeEvent')
    eventSpy.and.returnValue(undefined)
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.RESUME]()

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerResumeEvent).toHaveBeenCalledWith()
      done()
    }).catch(done.fail)
  })

  it('Alexa PREPARE_FOR_CLODE handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerPrepareForCloseEvent')
    eventSpy.and.returnValue(undefined)
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.PREPARE_FOR_CLOSE]()

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerPrepareForCloseEvent).toHaveBeenCalledWith()
      done()
    }).catch(done.fail)
  })

  it('Alexa SET_SEEK_POSITION handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerSetSeekPositionEvent')
    eventSpy.and.returnValue(undefined)
    const positionInMilliseconds = parseInt('0', 10)
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.SET_SEEK_POSITION](positionInMilliseconds)

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerSetSeekPositionEvent).toHaveBeenCalledWith(positionInMilliseconds)
      done()
    }).catch(done.fail)
  })

  it('Alexa ADJUST_SEEK_POSITION handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerAdjustSeekPositionEvent')
    eventSpy.and.returnValue(undefined)
    const offsetInMilliseconds = parseInt('0', 10)
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.ADJUST_SEEK_POSITION](offsetInMilliseconds)

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerAdjustSeekPositionEvent).toHaveBeenCalledWith(offsetInMilliseconds)
      done()
    }).catch(done.fail)
  })

  describe('Alexa NEXT handler', () => {
    afterEach(() => {
      alexaController.videoMetadata = null
    })

    it('has next episode', done => {
      // Arrange
      alexaController.videoMetadata = {
        nextEpisode: {
          id: 'dummy-video-id'
        }
      }
      const eventSpy = spyOn(EventUtil, 'triggerNextEvent')
      eventSpy.and.returnValue(Promise.resolve(undefined))
      alexaController.setAlexaEventHandlers()

      // Act
      const p = alexaController.alexaHandlers[AlexaEvent.NEXT]()

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(EventUtil.triggerNextEvent).toHaveBeenCalledWith('dummy-video-id')
        done()
      }).catch(done.fail)
    })

    it('does not have next episode', done => {
      // Arrange
      alexaController.videoMetadata = {}
      const eventSpy = spyOn(EventUtil, 'triggerNextEvent')
      eventSpy.and.returnValue(Promise.resolve(undefined))
      alexaController.setAlexaEventHandlers()

      // Act
      const p = alexaController.alexaHandlers[AlexaEvent.NEXT]()

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(EventUtil.triggerNextEvent).not.toHaveBeenCalled()
        done()
      }).catch(done.fail)
    })
  })

  describe('Alexa PREVIOUS handler', () => {
    afterEach(() => {
      alexaController.videoMetadata = null
    })

    it('has previous episode', done => {
      // Arrange
      alexaController.videoMetadata = {
        previousEpisode: {
          id: 'dummy-video-id'
        }
      }
      const eventSpy = spyOn(EventUtil, 'triggerPreviousEvent')
      eventSpy.and.returnValue(Promise.resolve(undefined))
      alexaController.setAlexaEventHandlers()

      // Act
      const p = alexaController.alexaHandlers[AlexaEvent.PREVIOUS]()

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(EventUtil.triggerPreviousEvent).toHaveBeenCalledWith('dummy-video-id')
        done()
      }).catch(done.fail)
    })

    it('does not have previous episode', done => {
      // Arrange
      alexaController.videoMetadata = {}
      const eventSpy = spyOn(EventUtil, 'triggerPreviousEvent')
      eventSpy.and.returnValue(Promise.resolve(undefined))
      alexaController.setAlexaEventHandlers()

      // Act
      const p = alexaController.alexaHandlers[AlexaEvent.PREVIOUS]()

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(EventUtil.triggerPreviousEvent).not.toHaveBeenCalled()
        done()
      }).catch(done.fail)
    })
  })

  it('Alexa CLOSED_CAPTIONS_STATE_CHANGE handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerClosedCaptionsStateChangeEvent')
    eventSpy.and.returnValue(undefined)
    const closedCaptionState = {}
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.CLOSED_CAPTIONS_STATE_CHANGE](closedCaptionState)

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerClosedCaptionsStateChangeEvent).toHaveBeenCalledWith(closedCaptionState)
      done()
    }).catch(done.fail)
  })

  it('Alexa ACCESS_TOKEN _CHANGE handler', done => {
    // Arrange
    const eventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
    eventSpy.and.returnValue(undefined)
    const accessToken = 'dummy-access-token'
    alexaController.setAlexaEventHandlers()

    // Act
    const p = alexaController.alexaHandlers[AlexaEvent.ACCESS_TOKEN_CHANGE](accessToken)

    // Assert
    p.then(result => {
      expect(result).toBeUndefined()
      expect(EventUtil.triggerAccessTokenChangeEvent).toHaveBeenCalledWith(accessToken)
      done()
    }).catch(done.fail)
  })

  describe('webPlayerLoadEventHandler', () => {
    afterEach(() => {
      AlexaController.accessToken = undefined
    })

    it('with VIDEO (not TV/live) metadata', () => {
      // Arrange
      const setMetadataSpy = spyOn(alexaController._alexaInterface, 'setMetadata')
      setMetadataSpy.and.returnValue(undefined)
      const setAllowedOperationsSpy = spyOn(alexaController._alexaInterface, 'setAllowedOperations')
      setAllowedOperationsSpy.and.returnValue(undefined)
      const triggerAwsMetadataUpdateEventSpy = spyOn(EventUtil, 'triggerAwsMetadataUpdateEvent')
      triggerAwsMetadataUpdateEventSpy.and.returnValue(undefined)
      const triggerAccessTokenChangeEventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
      triggerAccessTokenChangeEventSpy.and.returnValue(undefined)
      const offsetInMilliseconds = parseInt('0', 10)
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-url',
          webPlayerContentType: ContentType.VIDEO,
          name: 'dummy-name',
          closedCaptionsFile: 'dummy-cc-file',
          runTimeInMilliseconds: 999
        },
        autoPlay: true
      }
      const playbackParams = {
        contentUri: contentUri,
        accessToken: 'dummy-access-token',
        offsetInMilliseconds: offsetInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(setMetadataSpy).toHaveBeenCalledWith({
        type: ContentType.VIDEO,
        value: {
          name: 'dummy-name',
          closedCaptions: {
            available: true
          },
          durationInMilliseconds: 999
        }
      })

      expect(setAllowedOperationsSpy).toHaveBeenCalledWith({
        adjustRelativeSeekPositionForward: true,
        adjustRelativeSeekPositionBackwards: true,
        setAbsoluteSeekPositionForward: true,
        setAbsoluteSeekPositionBackwards: true,
        next: false,
        previous: false
      })

      expect(triggerAwsMetadataUpdateEventSpy).not.toHaveBeenCalled()
      expect(triggerAccessTokenChangeEventSpy).toHaveBeenCalledTimes(1)
    })

    it('with VIDEO (TV/live) metadata', () => {
      // Arrange
      const setMetadataSpy = spyOn(alexaController._alexaInterface, 'setMetadata')
      setMetadataSpy.and.returnValue(undefined)
      const setAllowedOperationsSpy = spyOn(alexaController._alexaInterface, 'setAllowedOperations')
      setAllowedOperationsSpy.and.returnValue(undefined)
      const triggerAwsMetadataUpdateEventSpy = spyOn(EventUtil, 'triggerAwsMetadataUpdateEvent')
      triggerAwsMetadataUpdateEventSpy.and.returnValue(undefined)
      const triggerAccessTokenChangeEventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
      triggerAccessTokenChangeEventSpy.and.returnValue(undefined)
      const offsetInMilliseconds = parseInt('0', 10)
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-url',
          webPlayerContentType: ContentType.VIDEO,
          networkDetails: { key: 'value' },
          name: 'dummy-name',
          closedCaptionsFile: 'dummy-cc-file',
          runTimeInMilliseconds: 999
        },
        autoPlay: true
      }
      const playbackParams = {
        contentUri: contentUri,
        offsetInMilliseconds: offsetInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(setMetadataSpy).toHaveBeenCalledWith({
        type: ContentType.VIDEO,
        value: {
          name: 'dummy-name',
          closedCaptions: {
            available: true
          },
          durationInMilliseconds: 999
        }
      })

      expect(triggerAwsMetadataUpdateEventSpy).not.toHaveBeenCalled()
      expect(setAllowedOperationsSpy).toHaveBeenCalledWith({
        adjustRelativeSeekPositionForward: false,
        adjustRelativeSeekPositionBackwards: false,
        setAbsoluteSeekPositionForward: false,
        setAbsoluteSeekPositionBackwards: false,
        next: false,
        previous: false
      })

      expect(triggerAccessTokenChangeEventSpy).not.toHaveBeenCalled()
    })

    it('with tv series episode metadata', () => {
      // Arrange
      const setMetadataSpy = spyOn(alexaController._alexaInterface, 'setMetadata')
      setMetadataSpy.and.returnValue(undefined)
      const setAllowedOperationsSpy = spyOn(alexaController._alexaInterface, 'setAllowedOperations')
      setAllowedOperationsSpy.and.returnValue(undefined)
      const triggerAwsMetadataUpdateEventSpy = spyOn(EventUtil, 'triggerAwsMetadataUpdateEvent')
      triggerAwsMetadataUpdateEventSpy.and.returnValue(undefined)
      const triggerAccessTokenChangeEventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
      triggerAccessTokenChangeEventSpy.and.returnValue(undefined)
      const offsetInMilliseconds = parseInt('0', 10)
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-url',
          webPlayerContentType: ContentType.TV_SERIES_EPISODE,
          closedCaptionsFile: 'dummy-cc-file',
          runTimeInMilliseconds: 999,
          name: 'dummy-name',
          seasonNumber: 1,
          episodeNumber: 1,
          episodeName: 'dummy-episode-name'
        },
        autoPlay: true
      }
      const playbackParams = {
        contentUri: contentUri,
        accessToken: 'dummy-access-token',
        offsetInMilliseconds: offsetInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(setMetadataSpy).toHaveBeenCalledWith({
        type: ContentType.TV_SERIES_EPISODE,
        value: {
          name: 'dummy-name',
          closedCaptions: {
            available: true
          },
          durationInMilliseconds: 999,
          series: {
            name: 'dummy-name',
            seasonNumber: 1
          },
          episode: {
            number: 1,
            name: 'dummy-episode-name'
          }
        }
      })

      expect(triggerAwsMetadataUpdateEventSpy).not.toHaveBeenCalled()
      expect(setAllowedOperationsSpy).toHaveBeenCalledWith({
        adjustRelativeSeekPositionForward: true,
        adjustRelativeSeekPositionBackwards: true,
        setAbsoluteSeekPositionForward: true,
        setAbsoluteSeekPositionBackwards: true,
        next: true,
        previous: true
      })

      expect(triggerAccessTokenChangeEventSpy).toHaveBeenCalledTimes(1)
    })

    it('no content type', () => {
      // Arrange
      const setMetadataSpy = spyOn(alexaController._alexaInterface, 'setMetadata')
      setMetadataSpy.and.returnValue(undefined)
      const setAllowedOperationsSpy = spyOn(alexaController._alexaInterface, 'setAllowedOperations')
      setAllowedOperationsSpy.and.returnValue(undefined)
      const triggerAwsMetadataUpdateEventSpy = spyOn(EventUtil, 'triggerAwsMetadataUpdateEvent')
      triggerAwsMetadataUpdateEventSpy.and.returnValue(undefined)
      const triggerAccessTokenChangeEventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
      triggerAccessTokenChangeEventSpy.and.returnValue(undefined)
      const offsetInMilliseconds = parseInt('0', 10)
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-url'
        },
        autoPlay: true
      }
      const playbackParams = {
        contentUri: contentUri,
        accessToken: 'dummy-access-token',
        offsetInMilliseconds: offsetInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(setMetadataSpy).not.toHaveBeenCalled()
      expect(setAllowedOperationsSpy).not.toHaveBeenCalled()
      expect(triggerAwsMetadataUpdateEventSpy).not.toHaveBeenCalled()
      expect(triggerAccessTokenChangeEventSpy).toHaveBeenCalledTimes(1)
    })

    it('no content type - with aws credentials', () => {
      // Arrange
      const setMetadataSpy = spyOn(alexaController._alexaInterface, 'setMetadata')
      setMetadataSpy.and.returnValue(undefined)
      const setAllowedOperationsSpy = spyOn(alexaController._alexaInterface, 'setAllowedOperations')
      setAllowedOperationsSpy.and.returnValue(undefined)
      const triggerAwsMetadataUpdateEventSpy = spyOn(EventUtil, 'triggerAwsMetadataUpdateEvent')
      triggerAwsMetadataUpdateEventSpy.and.returnValue(undefined)
      const triggerAccessTokenChangeEventSpy = spyOn(EventUtil, 'triggerAccessTokenChangeEvent')
      triggerAccessTokenChangeEventSpy.and.returnValue(undefined)
      const offsetInMilliseconds = parseInt('0', 10)
      const contentUri = {
        videoMetadata: {
          videoUrl: 'dummy-url'
        },
        aws: {
          'dummy-key': 'dummy-value'
        },
        autoPlay: true
      }
      const playbackParams = {
        contentUri: contentUri,
        accessToken: 'dummy-access-token',
        offsetInMilliseconds: offsetInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, playbackParams)

      // Assert
      expect(result).toBeUndefined()
      expect(setMetadataSpy).not.toHaveBeenCalled()
      expect(setAllowedOperationsSpy).not.toHaveBeenCalled()
      expect(triggerAwsMetadataUpdateEventSpy).toHaveBeenCalledTimes(1)
      expect(triggerAccessTokenChangeEventSpy).toHaveBeenCalledTimes(1)
    })

    it('error parsing playback context token', () => {
      // Arrange
      const triggerErrorEventSpy = spyOn(EventUtil, 'triggerErrorEvent')
      triggerErrorEventSpy.and.returnValue(undefined)

      // Act
      const result = alexaController.webPlayerLoadEventHandler(null, 'junk input')

      // Assert
      expect(result).toBeUndefined()
      expect(triggerErrorEventSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('webPlayerPausedHandler', () => {
    // Arrange
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)
    const positionInMilliseconds = parseInt('0', 10)

    // Act
    const result = alexaController.webPlayerPausedHandler(null, positionInMilliseconds)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.PAUSED, positionInMilliseconds))
  })

  it('test webPlayerPausedHandler timeout due to inactivity', () => {
    // Arrange
    jasmine.clock().install()
    const triggerWebPlayerCloseEventSpy = spyOn(EventUtil, 'triggerWebPlayerCloseEvent')
    triggerWebPlayerCloseEventSpy.and.returnValue(undefined)
    const positionInMilliseconds = parseInt('0', 10)

    // Act
    const result = alexaController.webPlayerPausedHandler(null, positionInMilliseconds)
    jasmine.clock().tick(310000)

    // Assert
    expect(result).toBeUndefined()
    expect(triggerWebPlayerCloseEventSpy).toHaveBeenCalledTimes(1)

    // Cleanup
    jasmine.clock().uninstall()
  })

  it('webPlayerPrepareForCloseEventHandler', () => {
    // Arrange
    // nothing to arrange

    // Act
    const result = alexaController.webPlayerPrepareForCloseEventHandler(null)
    //
    // Assert
    expect(result).toBeUndefined()
  })

  it('webPlayerBufferingEventHandler', () => {
    // Arrange
    const positionInMilliseconds = parseInt('0', 10)
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)

    // Act
    const result = alexaController.webPlayerBufferingEventHandler(null, positionInMilliseconds)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.BUFFERING, positionInMilliseconds))
  })

  it('webPlayerPlayingEventHandler', () => {
    // Arrange
    const positionInMilliseconds = parseInt('0', 10)
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)

    // Act
    const result = alexaController.webPlayerPlayingEventHandler(null, positionInMilliseconds)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.PLAYING, positionInMilliseconds))
  })

  it('webPlayerEndEventHandler', () => {
    // Arrange
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)
    const closeSpy = spyOn(alexaController._alexaInterface, 'close')
    closeSpy.and.returnValue(undefined)

    // Act
    const result = alexaController.webPlayerEndEventHandler(null)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.IDLE))
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('webPlayerIdleEventHandler', () => {
    // Arrange
    const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
    setPlayerStateSpy.and.returnValue(undefined)

    // Act
    const result = alexaController.webPlayerIdleEventHandler(null)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.IDLE))
  })

  it('webPlayerCloseEventHandler', () => {
    // Arrange
    const closeSpy = spyOn(alexaController._alexaInterface, 'close')
    closeSpy.and.returnValue(undefined)

    // Act
    const result = alexaController.webPlayerCloseEventHandler(null)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(closeSpy).toHaveBeenCalledWith()
  })

  describe('webPlayerTimeUpdateEventHandler', () => {
    it('throttled', () => {
      // Arrange
      const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
      setPlayerStateSpy.and.returnValue(undefined)

      alexaController.setPlayerStateThrottled = (...args) => {
        return alexaController.setPlayerState(...args)
      }
      const positionInMilliseconds = parseInt('55', 10)
      const params = {
        positionInMilliseconds: positionInMilliseconds
      }

      // Act
      const result = alexaController.webPlayerTimeUpdateEventHandler(null, params)
      //
      // Assert
      expect(result).toBeUndefined()
      expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.PLAYING, positionInMilliseconds))
    })

    it('not throttled', () => {
      // Arrange
      const setPlayerStateSpy = spyOn(alexaController, 'setPlayerState')
      setPlayerStateSpy.and.returnValue(undefined)

      alexaController.setPlayerStateThrottled = (...args) => {
        return alexaController.setPlayerState(...args)
      }
      const positionInMilliseconds = parseInt('55', 10)
      const params = {
        positionInMilliseconds: positionInMilliseconds,
        noThrottle: true
      }

      // Act
      const result = alexaController.webPlayerTimeUpdateEventHandler(null, params)
      //
      // Assert
      expect(result).toBeUndefined()
      expect(setPlayerStateSpy).toHaveBeenCalledWith(new PlayerStateModel(PlayerState.PLAYING, positionInMilliseconds))
    })
  })

  it('webPlayerErrorEventHandler', () => {
    // Arrange
    const sendErrorSpy = spyOn(alexaController._alexaInterface, 'sendError')
    sendErrorSpy.and.returnValue(undefined)
    const message = 'dummy-error-message'
    const type = ErrorType.SERVER_ERROR
    const params = { message, type }

    // Act
    const result = alexaController.webPlayerErrorEventHandler(null, params)
    //
    // Assert
    expect(result).toBeUndefined()
    expect(sendErrorSpy).toHaveBeenCalledWith(params)
  })

  describe('getAlexaController', () => {
    it('is set', () => {
      // Arrange
      window.alexaController = 'dummy-controller'

      // Act
      const alexaController = AlexaController.getAlexaController()
      //
      // Assert
      expect(alexaController).toEqual('dummy-controller')
    })

    it('is not set', () => {
      // Arrange
      window.alexaController = undefined

      // Act / Assert
      expect(() => AlexaController.getAlexaController()).toThrow()
    })
  })

  describe('webPlayerHandleAccessTokenChangeEvent', () => {
    afterEach(() => {
      AlexaController.accessToken = undefined
    })

    it('webPlayerHandleAccessTokenChangeEvent', () => {
      // Arrange
      const evt = {}
      const accessToken = 'dummy-access-token'

      // Act
      const result = alexaController.webPlayerHandleAccessTokenChangeEvent(evt, accessToken)

      // Assert
      expect(result).toBeUndefined()
      expect(AlexaController.accessToken).toEqual(accessToken)
    })
  })
})
