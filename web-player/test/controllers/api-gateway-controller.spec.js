import { AwsCredentials } from '../../src/models/aws-metadata'
import { ApiGatewayController } from '../../src/controllers/api-gateway-controller'
import { ApiGatewayAccess } from '../../src/access/api-gateway-access'
import $ from 'jquery'
import { WebPlayerEvent } from '../../src/enums/web-player-event'
import { PlaybackParams } from '../../src/models/playback-params'
import { EventUtil } from '../../src/util/event-util'
import { LogUtil } from '../../src/util/log-util'

describe('ApiGatewayController', () => {
  let apiGatewayController = null

  beforeEach(() => {
    apiGatewayController = new ApiGatewayController()
    window.$ = $
  })

  it('init', () => {
    // Arrange
    const setWebPlayerEventHandlersSpy = spyOn(apiGatewayController, 'setWebPlayerEventHandlers')
    setWebPlayerEventHandlersSpy.and.returnValue(undefined)
    const refreshAwsCredentialsSpy = spyOn(apiGatewayController, 'refreshAwsCredentials')
    refreshAwsCredentialsSpy.and.returnValue(undefined)

    // Act
    const result = apiGatewayController.init()
    clearTimeout(apiGatewayController.credentialRefreshTimer)

    // Assert
    expect(result).toBeUndefined()
    expect(setWebPlayerEventHandlersSpy).toHaveBeenCalledTimes(1)
    expect(refreshAwsCredentialsSpy).toHaveBeenCalledTimes(0)
  })

  describe('refreshAwsCredentials', () => {
    it('success', done => {
      // Arrange
      apiGatewayController.awsMetadata.apiGatewayId = 'dummy-api-gateway-id'
      apiGatewayController.awsMetadata.region = 'dummy-region'
      apiGatewayController.awsMetadata.credentials = new AwsCredentials()
      apiGatewayController.awsMetadata.credentials.AccessKeyId = 'dummy-access-key-id'
      apiGatewayController.awsMetadata.credentials.SecretAccessKey = 'dummy-secret-access-key'
      apiGatewayController.awsMetadata.credentials.SessionToken = 'dummy-session-token'

      const newCredentials = {
        AccessKeyId: 'dummy-new-access-key-id',
        SecretAccessKey: 'dummy-new-secret-access-key',
        SessionToken: 'dummy-new-session-token'
      }

      const retrieveNewAwsStsCredentialsSpy = spyOn(ApiGatewayAccess, 'retrieveNewAwsStsCredentials')
      retrieveNewAwsStsCredentialsSpy.and.returnValue(Promise.resolve(newCredentials))

      // Act
      const promise = apiGatewayController.refreshAwsCredentials({})
      clearTimeout(apiGatewayController.credentialRefreshTimer)

      // Assert
      promise.then(result => {
        clearTimeout(apiGatewayController.credentialRefreshTimer)

        expect(result).toBeUndefined()
        expect(retrieveNewAwsStsCredentialsSpy).toHaveBeenCalledTimes(1)
        expect(apiGatewayController.awsMetadata.credentials.AccessKeyId).toEqual('dummy-new-access-key-id')
        expect(apiGatewayController.awsMetadata.credentials.SecretAccessKey).toEqual('dummy-new-secret-access-key')
        expect(apiGatewayController.awsMetadata.credentials.SessionToken).toEqual('dummy-new-session-token')
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })

    it('request failure', done => {
      // Arrange
      apiGatewayController.awsMetadata.apiGatewayId = 'dummy-api-gateway-id'
      apiGatewayController.awsMetadata.region = 'dummy-region'
      apiGatewayController.awsMetadata.credentials = new AwsCredentials()
      apiGatewayController.awsMetadata.credentials.AccessKeyId = 'dummy-access-key-id'
      apiGatewayController.awsMetadata.credentials.SecretAccessKey = 'dummy-secret-access-key'
      apiGatewayController.awsMetadata.credentials.SessionToken = 'dummy-session-token'

      const retrieveNewAwsStsCredentialsSpy = spyOn(ApiGatewayAccess, 'retrieveNewAwsStsCredentials')
      retrieveNewAwsStsCredentialsSpy.and.returnValue(Promise.reject(new Error('dummy-error')))

      // Act
      const promise = apiGatewayController.refreshAwsCredentials()

      // Assert
      promise.then(result => {
        clearTimeout(apiGatewayController.credentialRefreshTimer)

        expect(result).toBeUndefined()
        expect(retrieveNewAwsStsCredentialsSpy).toHaveBeenCalledTimes(1)
        expect(apiGatewayController.awsMetadata.credentials).toEqual({})
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })

    it('aws metadata not set', () => {
      // Arrange
      apiGatewayController.awsMetadata.region = null
      apiGatewayController.awsMetadata.apiGatewayId = null
      apiGatewayController.awsMetadata.credentials = null

      const retrieveNewAwsStsCredentialsSpy = spyOn(ApiGatewayAccess, 'retrieveNewAwsStsCredentials')
      retrieveNewAwsStsCredentialsSpy.and.returnValue(Promise.reject(new Error('dummy-error')))

      // Act
      const result = apiGatewayController.refreshAwsCredentials()

      // Assert
      clearTimeout(apiGatewayController.credentialRefreshTimer)

      expect(result).toBeUndefined()
      expect(retrieveNewAwsStsCredentialsSpy).not.toHaveBeenCalled()
    })
  })

  it('handleWebPlayerNextOrPreviousEvent', done => {
    // Arrange
    apiGatewayController.awsMetadata.apiGatewayId = 'dummy-api-gateway-id'
    apiGatewayController.awsMetadata.region = 'dummy-region'
    apiGatewayController.awsMetadata.credentials = new AwsCredentials()
    apiGatewayController.awsMetadata.credentials.AccessKeyId = 'dummy-access-key-id'
    apiGatewayController.awsMetadata.credentials.SecretAccessKey = 'dummy-secret-access-key'
    apiGatewayController.awsMetadata.credentials.SessionToken = 'dummy-session-token'

    const contentUri = btoa(JSON.stringify({
      contentUri: 'dummy-playback-context-token'
    }))
    const getPlaybackContextTokenForVideoIdSpy = spyOn(ApiGatewayAccess, 'getPlaybackContextTokenForVideoId')
    getPlaybackContextTokenForVideoIdSpy.and.returnValue(Promise.resolve(contentUri))

    const playbackParams = new PlaybackParams({
      accessToken: null,
      tokenRefreshIntervalInMilliseconds: null,
      contentUri: contentUri,
      offsetInMilliseconds: 0,
      autoPlay: true
    })

    const triggerLoadEventSpy = spyOn(EventUtil, 'triggerLoadEvent')
    triggerLoadEventSpy.and.returnValue(undefined)

    // Act
    const p = apiGatewayController.handleWebPlayerNextOrPreviousEvent({}, 'dummy-video-id')
    // Assert
    p
      .then(result => {
        expect(result).toBeUndefined()
        expect(triggerLoadEventSpy).toHaveBeenCalledWith(playbackParams)
        expect(getPlaybackContextTokenForVideoIdSpy).toHaveBeenCalledTimes(1)
        expect(triggerLoadEventSpy).toHaveBeenCalledTimes(1)
        done()
      })
      .catch(done.fail)
  })

  it('setWebPlayerEventHandlers', () => {
    // Arrange
    const body = $('body')
    const jquerySpy = spyOn(window, '$')
    jquerySpy.and.returnValue(body)

    // Act
    const result = apiGatewayController.setWebPlayerEventHandlers()

    // Assert
    expect(result).toBeUndefined()
    const events = $._data(body.get(0), 'events')

    expect(events[WebPlayerEvent.AWS_METADATA_UPDATE]).toBeDefined()
    expect(events[WebPlayerEvent.NEXT]).toBeDefined()
    expect(events[WebPlayerEvent.PREVIOUS]).toBeDefined()
    expect(events[WebPlayerEvent.TIME_UPDATE]).toBeDefined()
    expect(events[WebPlayerEvent.SET_SEEK_POSITION]).toBeDefined()
    expect(events[WebPlayerEvent.ADJUST_SEEK_POSITION]).toBeDefined()
    expect(events[WebPlayerEvent.LOAD]).toBeDefined()
  })

  describe('handleWebPlayerAwsMetadataUpdateEvent', () => {
    it('all aws metadata present', () => {
      // Arrange
      const input = {
        credentials: {
          AccessKeyId: 'dummy-access-key-id',
          SecretAccessKey: 'dummy-secret-access-key',
          SessionToken: 'dummy-session-token'
        },
        region: 'dummy-region',
        apiGatewayId: 'dummy-api-gateway-id'
      }
      const evt = {}
      const cloudWatchlogsutilConfigureSpy = spyOn(LogUtil.cloudWatchLogsUtil, 'configure')
      cloudWatchlogsutilConfigureSpy.and.returnValue(undefined)

      // Act
      const result = apiGatewayController.handleWebPlayerAwsMetadataUpdateEvent(evt, input)

      // Assert
      expect(result).toBeUndefined()
      expect(apiGatewayController.awsMetadata.credentials.AccessKeyId).toEqual('dummy-access-key-id')
      expect(apiGatewayController.awsMetadata.credentials.SecretAccessKey).toEqual('dummy-secret-access-key')
      expect(apiGatewayController.awsMetadata.credentials.SessionToken).toEqual('dummy-session-token')
      expect(apiGatewayController.awsMetadata.region).toEqual('dummy-region')
      expect(apiGatewayController.awsMetadata.apiGatewayId).toEqual('dummy-api-gateway-id')
      expect(cloudWatchlogsutilConfigureSpy).toHaveBeenCalledTimes(1)
    })

    it('no aws metadata present', () => {
      // Arrange
      const input = {}
      const evt = {}
      const cloudWatchlogsutilConfigureSpy = spyOn(LogUtil.cloudWatchLogsUtil, 'configure')
      cloudWatchlogsutilConfigureSpy.and.returnValue(undefined)

      // Act
      const result = apiGatewayController.handleWebPlayerAwsMetadataUpdateEvent(evt, input)

      // Assert
      expect(result).toBeUndefined()
      expect(apiGatewayController.awsMetadata.credentials.AccessKeyId).toBeNull()
      expect(apiGatewayController.awsMetadata.credentials.SecretAccessKey).toBeNull()
      expect(apiGatewayController.awsMetadata.credentials.SessionToken).toBeNull()
      expect(apiGatewayController.awsMetadata.region).toBeNull()
      expect(apiGatewayController.awsMetadata.apiGatewayId).toBeNull()
      expect(cloudWatchlogsutilConfigureSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('webPlayerVideoProgressUpdateEventHandler', done => {
    // Arrange
    const params = {
      positionInMilliseconds: 123,
      videoId: 'dummy-video-id'
    }
    const evt = {}
    apiGatewayController.updateVideoProgressThrottled = (...args) => {
      return ApiGatewayAccess.updateVideoProgress(...args)
    }
    const updateVideoProgressSpy = spyOn(ApiGatewayAccess, 'updateVideoProgress')
    updateVideoProgressSpy.and.returnValue(Promise.resolve(undefined))
    // Act
    const p = apiGatewayController.webPlayerVideoProgressUpdateEventHandler(evt, params)

    // Assert
    p
      .then(result => {
        expect(result).toBeUndefined()
        expect(updateVideoProgressSpy).toHaveBeenCalledTimes(1)
        done()
      })
      .catch(err => {
        done.fail(err)
      })
  })

  it('webPlayerLoadEventHandler', () => {
    // Arrange
    const evt = {}
    const playbackParams = {
      contentUri: {
        videoMetadata: 'dummy-content-uri'
      }
    }

    // Act
    const result = apiGatewayController.webPlayerLoadEventHandler(evt, playbackParams)

    // Assert
    expect(apiGatewayController.videoMetadata).toEqual('dummy-content-uri')
    expect(result).toBeUndefined()
  })

  describe('webPlayerSetSeekPositionEventHandler', () => {
    beforeEach(() => {
      apiGatewayController.awsMetadata = {
        apiGatewayId: 'dummy-api-gateway-id',
        region: 'rummy-region',
        credentials: 'dummy-credentials-object'
      }
      apiGatewayController.videoMetadata = {
        id: 'dummy-video-id'
      }
    })

    afterEach(() => {
      apiGatewayController.awsMetadata = undefined
      apiGatewayController.videoMetadata = undefined
    })

    it('success', done => {
      // Arrange
      const evt = {}
      const positionInMilliseconds = 123456

      const updateVideoProgressSpy = spyOn(ApiGatewayAccess, 'updateVideoProgress')
      updateVideoProgressSpy.and.returnValue(Promise.resolve({}))

      // Act
      const p = apiGatewayController.webPlayerSetSeekPositionEventHandler(evt, positionInMilliseconds)

      // Assert
      p
        .then(result => {
          expect(result).toEqual({})
          expect(updateVideoProgressSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('webPlayerAdjustSeekPositionEventHandler', () => {
    beforeEach(() => {
      const body = $('body')
      body.append($(`<input id="seekBar" value="222222"/>`))
      apiGatewayController.awsMetadata = {
        apiGatewayId: 'dummy-api-gateway-id',
        region: 'rummy-region',
        credentials: 'dummy-credentials-object'
      }
      apiGatewayController.videoMetadata = {
        id: 'dummy-video-id',
        runTimeInMilliseconds: 111111
      }
    })

    afterEach(() => {
      apiGatewayController.awsMetadata = undefined
      apiGatewayController.videoMetadata = undefined
      $('#seekBar').remove()
    })

    it('success', done => {
      // Arrange
      const evt = {}
      // const positionInMilliseconds = 222222

      const updateVideoProgressSpy = spyOn(ApiGatewayAccess, 'updateVideoProgress')
      updateVideoProgressSpy.and.returnValue(Promise.resolve({}))

      // Act
      const p = apiGatewayController.webPlayerAdjustSeekPositionEventHandler(evt, 1111)

      // Assert
      p
        .then(result => {
          expect(result).toEqual({})
          expect(updateVideoProgressSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
