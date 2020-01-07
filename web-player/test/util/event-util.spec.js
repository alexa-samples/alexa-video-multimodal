import { EventUtil } from '../../src/util/event-util'
import { WebPlayerEvent } from '../../src/enums/web-player-event'
import $ from 'jquery'
import { PlaybackParams } from '../../src/models/playback-params'
import { AwsMetadata } from '../../src/models/aws-metadata'
import { ErrorType } from '../../src/enums/error-type'
import { AlexaController } from '../../src/controllers/alexa-controller'

describe('EventUtil', () => {
  it('triggerLoadEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const playbackParams = new PlaybackParams({})
    $('body').on(WebPlayerEvent.LOAD, (evt, params) => {
      expect(params).toEqual(playbackParams)
      done()
    })

    // Act
    EventUtil.triggerLoadEvent(playbackParams)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerPauseEvent', done => {
    // Arrange/Assert
    $('body').on(WebPlayerEvent.PAUSE, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerPauseEvent()
  })

  it('triggerPausedEvent', done => {
    // Arrange/Assert
    const positionInMilliseconds = parseInt('0', 10)
    $('body').on(WebPlayerEvent.PAUSED, (evt, params) => {
      expect(params).toEqual(positionInMilliseconds)
      done()
    })

    // Act
    EventUtil.triggerPausedEvent(positionInMilliseconds)
  })

  it('triggerPlayEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.RESUME, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerResumeEvent()

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerPrepareForCloseEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.PREPARE_FOR_CLOSE, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerPrepareForCloseEvent()

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerSetSeekPositionEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const positionInMilliseconds = parseInt('0', 10)
    $('body').on(WebPlayerEvent.SET_SEEK_POSITION, (evt, params) => {
      expect(params).toEqual(positionInMilliseconds)
      done()
    })

    // Act
    EventUtil.triggerSetSeekPositionEvent(positionInMilliseconds)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerAdjustSeekPositionEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const offsetInMilliseconds = parseInt('0', 10)
    $('body').on(WebPlayerEvent.ADJUST_SEEK_POSITION, (evt, params) => {
      expect(params).toEqual(offsetInMilliseconds)
      done()
    })

    // Act
    EventUtil.triggerAdjustSeekPositionEvent(offsetInMilliseconds)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerNextEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.NEXT, (evt, params) => {
      expect(params).toEqual('dummy-video-id')
      done()
    })

    // Act
    EventUtil.triggerNextEvent('dummy-video-id')

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerPreviousEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.PREVIOUS, (evt, params) => {
      expect(params).toEqual('dummy-video-id')
      done()
    })

    // Act
    EventUtil.triggerPreviousEvent('dummy-video-id')

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerClosedCaptionsStateChangeEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const closedCaptionState = {}
    $('body').on(WebPlayerEvent.CLOSED_CAPTIONS_STATE_CHANGE_EVENT, (evt, params) => {
      expect(params).toEqual(closedCaptionState)
      done()
    })

    // Act
    EventUtil.triggerClosedCaptionsStateChangeEvent(closedCaptionState)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerAccessTokenChangeEventEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const accessToken = 'dummy-access-token'
    $('body').on(WebPlayerEvent.ACCESS_TOKEN_CHANGE, (evt, params) => {
      expect(params).toEqual(accessToken)
      done()
    })

    // Act
    EventUtil.triggerAccessTokenChangeEvent(accessToken)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerBufferingEventEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const positionInMilliseconds = parseInt('0', 10)
    $('body').on(WebPlayerEvent.BUFFERING, (evt, params) => {
      expect(params).toEqual(positionInMilliseconds)
      done()
    })

    // Act
    EventUtil.triggerBufferingEventEvent(positionInMilliseconds)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerPlayingEventEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const positionInMilliseconds = parseInt('0', 10)
    $('body').on(WebPlayerEvent.PLAYING, (evt, params) => {
      expect(params).toEqual(positionInMilliseconds)
      done()
    })

    // Act
    EventUtil.triggerPlayingEventEvent(positionInMilliseconds)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerEndEventEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.END, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerEndEventEvent()

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerIdleEventEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.IDLE, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerIdleEventEvent()

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerCanPlayEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.CAN_PLAY, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerCanPlayEvent()

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerTimeUpdateEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const positionInMilliseconds = 5
    const duration = 999
    const videoId = 'dummy-video-id'
    $('body').on(WebPlayerEvent.TIME_UPDATE, (evt, params) => {
      expect(params.positionInMilliseconds).toEqual(positionInMilliseconds)
      expect(params.duration).toEqual(duration)
      expect(params.videoId).toEqual(videoId)
      done()
    })

    // Act
    EventUtil.triggerTimeUpdateEvent(positionInMilliseconds, duration, videoId)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerErrorEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.ERROR, (evt, params) => {
      expect(params).toEqual({
        message: 'dummy-error-message',
        type: ErrorType.CLIENT_ERROR
      })
      done()
    })

    // Act
    EventUtil.triggerErrorEvent('dummy-error-message', ErrorType.CLIENT_ERROR)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerWebPlayerCloseEvent', done => {
    // Arrange/Assert
    $('body').on(WebPlayerEvent.CLOSE, (evt, params) => {
      expect(params).toEqual(undefined)
      done()
    })

    // Act
    EventUtil.triggerWebPlayerCloseEvent()
  })

  it('triggerWebPlayerClosedCaptioningLanguageChangeEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    $('body').on(WebPlayerEvent.CLOSED_CAPTIONING_LANGUAGE_CHANGE, (evt, params) => {
      expect(params).toEqual('en')
      done()
    })

    // Act
    EventUtil.triggerWebPlayerClosedCaptioningLanguageChangeEvent('en')

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })

  it('triggerAwsMetadataUpdateEvent', done => {
    // Arrange/Assert
    const webPlayerCleanupTimerResetSpy = spyOn(AlexaController, 'webPlayerCleanupTimerReset')
    const awsMetadata = new AwsMetadata()
    $('body').on(WebPlayerEvent.AWS_METADATA_UPDATE, (evt, params) => {
      expect(params).toEqual(awsMetadata)
      done()
    })

    // Act
    EventUtil.triggerAwsMetadataUpdateEvent(awsMetadata)

    // Assert
    expect(webPlayerCleanupTimerResetSpy).toHaveBeenCalledTimes(1)
  })
})
