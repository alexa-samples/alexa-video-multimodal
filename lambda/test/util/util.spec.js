import { Util } from '../../src/utils/util'
import { StsAccess } from '../../src/access/aws/sts-access'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { VideoMetadata } from '../../src/models/database-models/video-metadata'
import { S3Access } from '../../src/access/aws/s3-access'
import { UserUtil } from '../../src/utils/user-util'
import { VideoProgressDbGateway } from '../../src/gateway/video-progress-db-gateway'

describe('Util', () => {
  afterEach(() => {
    delete process.env.AWS_REGION
    delete process.env.API_GATEWAY_ID
    delete process.env.ENABLE_WEB_PLAYER_LOGGING
  })

  describe('getPlaybackContextToken', () => {
    it('no environment variables and no credentials', () => {
      // Arrange
      const videoMetadata = {
        videoUrl: 'dummy-url'
      }
      const expectedToken = JSON.stringify({
        videoMetadata: videoMetadata,
        aws: {
          credentials: {},
          region: undefined
        },
        autoPlay: true
      })

      // Act
      const token = Util.getPlaybackContextToken(videoMetadata, {})

      // Assert
      expect(Util.base64Decode(token)).toEqual(expectedToken)
    })

    it('with environment variables and credentials', () => {
      // Arrange
      const videoMetadata = {
        videoUrl: 'dummy-url'
      }
      process.env.AWS_REGION = 'dummy-aws-region'
      process.env.API_GATEWAY_ID = 'dummy-api-gateway-id'
      process.env.ENABLE_WEB_PLAYER_LOGGING = 'true'
      const credentials = {
        AccessKeyId: 'dummy-access-key-id',
        SecretAccessKey: 'dummy-secret-access-key',
        SessionToken: 'dummy-session-token'

      }
      const expectedToken = JSON.stringify({
        videoMetadata: videoMetadata,
        aws: {
          credentials: credentials,
          region: 'dummy-aws-region',
          apiGatewayId: 'dummy-api-gateway-id',
          cloudWatchLogsEnabled: true
        },
        autoPlay: true
      })

      // Act
      const token = Util.getPlaybackContextToken(videoMetadata, credentials)

      // Assert
      expect(Util.base64Decode(token)).toEqual(expectedToken)
    })
  })

  it('generateMessageId', () => {
    // Arrange
    // nothing to arrange

    // Act
    const messageId0 = Util.generateMessageId()
    const messageId1 = Util.generateMessageId()

    // Assert
    expect(messageId0).toBeDefined()
    expect(messageId1).toBeDefined()
    expect(messageId0.length).toBeGreaterThan(0)
    expect(messageId1.length).toBeGreaterThan(0)
    expect(messageId0).not.toEqual(messageId1)
  })

  describe('generateNextToken', () => {
    it('too few video ids', () => {
      // Arrange
      const videoIds = ['video-id-0']

      const generateMessageIdSpy = spyOn(Util, 'generateMessageId')
      generateMessageIdSpy.and.returnValue('dummy-message-id')

      const putItemsForTokenSpy = spyOn(DatabaseGateway, 'putItemsForToken')
      putItemsForTokenSpy.and.returnValue(undefined)
      // Act
      const result = Util.generateNextToken(videoIds, 3, 'dummy-project-name')

      // Assert
      expect(result).toBeNull()
      expect(generateMessageIdSpy).not.toHaveBeenCalledTimes(1)
      expect(putItemsForTokenSpy).not.toHaveBeenCalledTimes(1)
    })

    it('extra video ids', () => {
      // Arrange
      const videoIds = [
        'video-id-0',
        'video-id-1',
        'video-id-2',
        'video-id-3'
      ]

      const generateMessageIdSpy = spyOn(Util, 'generateMessageId')
      generateMessageIdSpy.and.returnValue('dummy-message-id')

      const putItemsForTokenSpy = spyOn(DatabaseGateway, 'putItemsForToken')
      putItemsForTokenSpy.and.returnValue(undefined)
      // Act
      const result = Util.generateNextToken(videoIds, 3, 'dummy-project-name')

      // Assert
      expect(result).toEqual('dummy-message-id')
      expect(generateMessageIdSpy).toHaveBeenCalledTimes(1)
      expect(putItemsForTokenSpy).toHaveBeenCalledWith('dummy-message-id', ['video-id-3'], 'dummy-project-name')
    })
  })

  it('getTopEntitiesOfAllTypes', () => {
    // Arrange
    const entities = [
      {
        type: 'Action',
        title: 'action-movie-0'
      },
      {
        type: 'Action',
        title: 'action-movie-1'
      },
      {
        type: 'Drama',
        title: 'drama-movie-0'
      },
      {
        type: 'Drama',
        title: 'drama-movie-1'
      }
    ]
    const expectedResult = [
      {
        type: 'Action',
        title: 'action-movie-0'
      },
      {
        type: 'Drama',
        title: 'drama-movie-0'
      }
    ]

    // Act
    const result = Util.getTopEntitiesOfAllTypes(entities)

    // Assert
    expect(result).toEqual(expectedResult)
  })

  it('mapDatabaseResultToModelObject', () => {
    // Arrange
    const userJson = {
      id: 'MV002527780000',
      name: 'Iron Man 2'
    }
    const objectPrototype = VideoMetadata.prototype

    // Act
    const result = Util.mapDatabaseResultToModelObject(userJson, objectPrototype)

    // Assert
    expect(result.id).toEqual('MV002527780000')
    expect(result.name).toEqual('Iron Man 2')
  })

  describe('getWebPlayerAwsCredentials', () => {
    beforeEach(() => {
      process.env.IAM_STS_WEB_PLAYER_ROLE_ARN = 'dummy-arn'
    })

    afterEach(() => {
      delete process.env.IAM_STS_WEB_PLAYER_ROLE_ARN
    })

    it('success', (done) => {
      // Arrange
      const assumeRoleSpy = spyOn(StsAccess, 'assumeRole')
      assumeRoleSpy.and.returnValue(Promise.resolve({ Credentials: {} }))
      process.env.IAM_STS_WEB_PLAYER_ROLE_ARN = 'dummy-arn'

      // Act
      const promise = Util.getWebPlayerAwsCredentials()

      // Assert
      promise.then(
        (result) => {
          expect(result).toEqual({})
          expect(assumeRoleSpy).toHaveBeenCalledTimes(1)
          done()
        }
      ).catch(done.fail)
    })

    it('failure', (done) => {
      // Arrange
      const assumeRoleSpy = spyOn(StsAccess, 'assumeRole')
      assumeRoleSpy.and.returnValue(Promise.reject(new Error('dummy-error')))
      process.env.IAM_STS_WEB_PLAYER_ROLE_ARN = 'dummy-arn'

      // Act
      const promise = Util.getWebPlayerAwsCredentials()

      // Assert
      promise.then((result) => {
        expect(result).toBeUndefined()
        expect(assumeRoleSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('no role arn evn var set', (done) => {
      // Arrange
      const assumeRoleSpy = spyOn(StsAccess, 'assumeRole')
      delete process.env.IAM_STS_WEB_PLAYER_ROLE_ARN

      // Act
      const promise = Util.getWebPlayerAwsCredentials()

      // Assert
      promise.then((result) => {
        expect(result).toBeUndefined()
        expect(assumeRoleSpy).not.toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })
  })

  describe('signVideoMetadataUrls', () => {
    beforeEach(() => {
      process.env.VIDEO_CONTENT_BUCKET = 'dummy-content-bucket'
    })

    afterEach(() => {
      delete process.env.VIDEO_CONTENT_BUCKET
    })

    it('with all video attributes', () => {
      // Arrange
      const videoMetadataList = [
        {
          videoUrl: 'dummy-video-url',
          thumbnailImageSources: [
            {
              url: 'dummy-thumbnail-url'
            }
          ],
          closedCaptionsFile: 'dummy-cc-file'
        }
      ]
      const getSignedUrlSpy = spyOn(S3Access, 'getSignedUrl')
      getSignedUrlSpy.and.returnValues('signed-dummy-video-url', 'signed-dummy-thumbnail-url', 'signed-dummy-cc-file')

      // Act
      const result = Util.signVideoMetadataUrls(videoMetadataList)

      // Assert
      expect(result).toEqual([
        {
          videoUrl: 'signed-dummy-video-url',
          thumbnailImageSources: [
            {
              url: 'signed-dummy-thumbnail-url'
            }
          ],
          closedCaptionsFile: 'signed-dummy-cc-file'
        }
      ])

      expect(getSignedUrlSpy).toHaveBeenCalledTimes(3)
    })

    it('with no video attributes', () => {
      // Arrange
      const videoMetadataList = [
        {
          'dummy-key': 'dummy-value'
        }
      ]
      const getSignedUrlSpy = spyOn(S3Access, 'getSignedUrl')

      // Act
      const result = Util.signVideoMetadataUrls(videoMetadataList)

      // Assert
      expect(result).toEqual([
        {
          'dummy-key': 'dummy-value'
        }
      ])

      expect(getSignedUrlSpy).not.toHaveBeenCalled()
    })
  })

  describe('getAccessTokenFromEvent', () => {
    it('success', () => {
      // Arrange
      const event = {
        directive: {
          endpoint: {
            scope: {
              token: 'dummy-token'
            }
          }
        }
      }

      // Act
      const token = Util.getAccessTokenFromEvent(event)

      // Assert
      expect(token).toEqual('dummy-token')
    })
    it('no token', () => {
      // Arrange
      const event = {
        directive: {
          endpoint: {
            scope: {}
          }
        }
      }

      // Act
      const token = Util.getAccessTokenFromEvent(event)

      // Assert
      expect(token).toBeNull()
    })
    it('no scope', () => {
      // Arrange
      const event = {
        directive: {
          endpoint: {}
        }
      }

      // Act
      const token = Util.getAccessTokenFromEvent(event)

      // Assert
      expect(token).toBeNull()
    })
    it('no endpoint', () => {
      // Arrange
      const event = {
        directive: {}
      }

      // Act
      const token = Util.getAccessTokenFromEvent(event)

      // Assert
      expect(token).toBeNull()
    })
    it('no directive', () => {
      // Arrange
      const event = {}

      // Act
      const token = Util.getAccessTokenFromEvent(event)

      // Assert
      expect(token).toBeNull()
    })
  })
  describe('setVideoProgressTime', () => {
    it('success', done => {
      // Arrange
      const videoMetadataList = [
        {
          id: 'dummy-video-id-0',
          runTimeInMilliseconds: 60000
        },
        {
          id: 'dummy-video-id-1',
          runTimeInMilliseconds: 60000
        }
      ]

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve('dummy-user-id'))

      const getProgressForVideosSpy = spyOn(VideoProgressDbGateway, 'getProgressForVideos')
      getProgressForVideosSpy.and.returnValue(Promise.resolve({ 'dummy-video-id-0': 1000, 'dummy-video-id-1': 2000 }))

      // Act
      const p = Util.setVideoProgressTime('dummy-access-token', 'dummy-project-name', videoMetadataList)

      // Assert
      p
        .then(result => {
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(getProgressForVideosSpy).toHaveBeenCalledTimes(1)
          expect(result[0].absoluteViewingPositionMilliseconds).toEqual(1000)
          expect(result[1].absoluteViewingPositionMilliseconds).toEqual(2000)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('no records in database', done => {
      // Arrange
      const videoMetadataList = [
        {
          id: 'dummy-video-id-0',
          runTimeInMilliseconds: 60000
        },
        {
          id: 'dummy-video-id-1',
          runTimeInMilliseconds: 60000
        }
      ]

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve('dummy-user-id'))

      const getProgressForVideosSpy = spyOn(VideoProgressDbGateway, 'getProgressForVideos')
      getProgressForVideosSpy.and.returnValue(Promise.resolve({}))

      // Act
      const p = Util.setVideoProgressTime('dummy-access-token', 'dummy-project-name', videoMetadataList)

      // Assert
      p
        .then(result => {
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(getProgressForVideosSpy).toHaveBeenCalledTimes(1)
          expect(result[0].absoluteViewingPositionMilliseconds).toEqual(0)
          expect(result[1].absoluteViewingPositionMilliseconds).toEqual(0)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('video progress near end of video', done => {
      // Arrange
      const videoMetadataList = [
        {
          id: 'dummy-video-id-0',
          runTimeInMilliseconds: 60000
        },
        {
          id: 'dummy-video-id-1',
          runTimeInMilliseconds: 60000
        }
      ]

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve('dummy-user-id'))

      const getProgressForVideosSpy = spyOn(VideoProgressDbGateway, 'getProgressForVideos')
      getProgressForVideosSpy.and.returnValue(Promise.resolve({ 'dummy-video-id-0': 50000, 'dummy-video-id-1': 2000 }))

      // Act
      const p = Util.setVideoProgressTime('dummy-access-token', 'dummy-project-name', videoMetadataList)

      // Assert
      p
        .then(result => {
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(getProgressForVideosSpy).toHaveBeenCalledTimes(1)
          expect(result[0].absoluteViewingPositionMilliseconds).toEqual(0)
          expect(result[1].absoluteViewingPositionMilliseconds).toEqual(2000)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('error', done => {
      // Arrange
      const videoMetadataList = [
        {
          id: 'dummy-video-id-0',
          runTimeInMilliseconds: 60000,
          absoluteViewingPositionMilliseconds: 0
        },
        {
          id: 'dummy-video-id-1',
          runTimeInMilliseconds: 60000,
          absoluteViewingPositionMilliseconds: 0
        }
      ]

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve('dummy-user-id'))

      const getProgressForVideosSpy = spyOn(VideoProgressDbGateway, 'getProgressForVideos')
      getProgressForVideosSpy.and.returnValue(Promise.reject(new Error('dummy-error')))

      // Act
      const p = Util.setVideoProgressTime('dummy-access-token', 'dummy-project-name', videoMetadataList)

      // Assert
      p
        .then(result => {
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(getProgressForVideosSpy).toHaveBeenCalledTimes(1)
          expect(result[0].absoluteViewingPositionMilliseconds).toEqual(0)
          expect(result[1].absoluteViewingPositionMilliseconds).toEqual(0)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
