import { AwsCredentials } from '../../src/models/aws-metadata'
import { AwsClient } from 'aws4fetch'
import { ApiGatewayAccess } from '../../src/access/api-gateway-access'

describe('ApiGatewayAccess', () => {
  describe('retrieveNewAwsStsCredentials', () => {
    it('success', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'

      const expectedResult = {
        AccessKeyId: 'dummy-new-access-key-id',
        SecretAccessKey: 'dummy-new-secret-access-key',
        SessionToken: 'dummy-new-session-token'
      }
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return expectedResult
        }
      }))

      // Act
      const promise = ApiGatewayAccess.retrieveNewAwsStsCredentials(apiGatewayId, region, awsCredentials)

      // Assert
      promise
        .then(result => {
          expect(result).toEqual(expectedResult)
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('fail', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'

      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(new Error('error')))

      // Act
      const promise = ApiGatewayAccess.retrieveNewAwsStsCredentials(apiGatewayId, region, awsCredentials)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('getPlaybackContextTokenForVideoId', () => {
    it('success', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const videoId = 'dummy-video-id'
      const mockResponse = {
        event: {
          payload: {
            searchResults: [
              {
                playbackContextToken: 'dummy-playback-context-token'
              }
            ]
          }
        }
      }
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.getPlaybackContextTokenForVideoId(apiGatewayId, region, awsCredentials, videoId)

      // Assert
      promise
        .then(result => {
          expect(result).toEqual('dummy-playback-context-token')
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('fail - bad request', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'

      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const videoId = 'dummy-video-id'

      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(new Error('error')))

      // Act
      const promise = ApiGatewayAccess.getPlaybackContextTokenForVideoId(apiGatewayId, region, awsCredentials, videoId)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('fail parsing error', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const videoId = 'dummy-video-id'
      const mockResponse = {
        junk: 'response'
      }
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.getPlaybackContextTokenForVideoId(apiGatewayId, region, awsCredentials, videoId)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('updateVideoProgress', () => {
    it('success', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const videoId = 'dummy-video-id'
      const positionInMilliseconds = 123
      const mockResponse = {}
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.updateVideoProgress(apiGatewayId, region, awsCredentials, videoId, positionInMilliseconds)

      // Assert
      promise
        .then(result => {
          expect(result).toBeDefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const videoId = 'dummy-video-id'
      const positionInMilliseconds = 123
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const errorObject = new Error('dummy-error')
      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const promise = ApiGatewayAccess.updateVideoProgress(apiGatewayId, region, awsCredentials, videoId, positionInMilliseconds)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('createCloudWatchLogsLogStream', () => {
    it('success', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const mockResponse = {}
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.createCloudWatchLogsLogStream(apiGatewayId, region, awsCredentials, logStreamName)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const errorObject = new Error('dummy-error')
      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const promise = ApiGatewayAccess.createCloudWatchLogsLogStream(apiGatewayId, region, awsCredentials, logStreamName)

      // Assert
      promise
        .then(result => {
          expect(result).toBeUndefined()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('putLogEvents', () => {
    it('success', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const sequenceToken = 'dummy-sequence-token'
      const logEvents = []
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const mockResponse = { nextSequenceToken: 'dummy-next-sequence-token' }
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.putLogEvents(apiGatewayId, region, awsCredentials, logStreamName, sequenceToken, logEvents)

      // Assert
      promise
        .then(result => {
          expect(result).toEqual('dummy-next-sequence-token')
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const sequenceToken = 'dummy-sequence-token'
      const logEvents = []
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const errorObject = new Error('dummy-error')
      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const promise = ApiGatewayAccess.putLogEvents(apiGatewayId, region, awsCredentials, logStreamName, sequenceToken, logEvents)

      // Assert
      promise
        .then(result => {
          expect(result).toBeNull()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('getSequenceToken', () => {
    it('success - with sequence token', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const mockResponse = { sequenceToken: 'dummy-sequence-token' }
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.getSequenceToken(apiGatewayId, region, awsCredentials, logStreamName)

      // Assert
      promise
        .then(result => {
          expect(result).toEqual('dummy-sequence-token')
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('success - no sequence token', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const mockResponse = {}
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.resolve({
        json: () => {
          return mockResponse
        }
      }))

      // Act
      const promise = ApiGatewayAccess.getSequenceToken(apiGatewayId, region, awsCredentials, logStreamName)

      // Assert
      promise
        .then(result => {
          expect(result).toBeNull()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure', done => {
      // Arrange
      const apiGatewayId = 'dummy-api-gateway-id'
      const region = 'dummy-region'
      const logStreamName = 'dummy-log-stream-name'
      const awsCredentials = new AwsCredentials()
      awsCredentials.AccessKeyId = 'dummy-access-key-id'
      awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
      awsCredentials.SessionToken = 'dummy-session-token'
      const aws = new AwsClient({
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken
      })
      const getAwsClientSpy = spyOn(ApiGatewayAccess, 'getAwsClient')
      getAwsClientSpy.and.returnValue(aws)

      const errorObject = new Error('dummy-error')
      const fetchSpy = spyOn(aws, 'fetch')
      fetchSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const promise = ApiGatewayAccess.getSequenceToken(apiGatewayId, region, awsCredentials, logStreamName)

      // Assert
      promise
        .then(result => {
          expect(result).toBeNull()
          expect(getAwsClientSpy).toHaveBeenCalledTimes(1)
          expect(fetchSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  it('getAwsClient', () => {
    // Arrange
    const awsCredentials = new AwsCredentials()
    awsCredentials.AccessKeyId = 'dummy-access-key-id'
    awsCredentials.SecretAccessKey = 'dummy-secret-access-key'
    awsCredentials.SessionToken = 'dummy-session-token'

    // Act
    const result = ApiGatewayAccess.getAwsClient(awsCredentials)

    // Assert
    expect(result.accessKeyId).toEqual(awsCredentials.AccessKeyId)
    expect(result.secretAccessKey).toEqual(awsCredentials.SecretAccessKey)
    expect(result.sessionToken).toEqual(awsCredentials.SessionToken)
  })
})
