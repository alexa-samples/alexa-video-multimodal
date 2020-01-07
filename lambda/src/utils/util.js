import { v4 as uuid } from 'uuid'
import { StsAccess } from '../access/aws/sts-access'
import { DatabaseGateway } from '../gateway/database-gateway'
import { S3Access } from '../access/aws/s3-access'
import { Constants } from '../utils/constants'
import { UserUtil } from './user-util'
import { VideoProgressDbGateway } from '../gateway/video-progress-db-gateway'
import { getLogger } from 'log4js'

/**
 * Util class containing helper methods to Handler and other classes.
 */
export class Util {
  /**
   * Generates unique message Id for each response message
   *
   * @returns {string} A UUID
   */
  static generateMessageId () {
    return uuid()
  }

  /**
   * Paginate and generate next token for next page
   *
   * @param {Array} ids Array of Video/Category ids
   * @param {number} resultLimit Limit on Number of items in a single result
   * @param {string} projectName Lambda Name
   * @returns {string|null} The next token
   */
  static generateNextToken (ids, resultLimit, projectName) {
    if (ids.length <= resultLimit) {
      return null
    }

    const nextToken = Util.generateMessageId()
    DatabaseGateway.putItemsForToken(nextToken, ids.slice(resultLimit), projectName)

    return nextToken
  }

  /**
   * Get the top entity of each type: Video, Actor, Comedy, Franchise, etc.
   *
   * @param {Array} entities List of entities extracted from Alexa Request directive
   * @returns {Array} List of top entities in the array for each 'type'
   */
  static getTopEntitiesOfAllTypes (entities) {
    const resultEntities = []
    resultEntities.push(entities[0])

    entities.forEach(entity => {
      if (entity.type !== resultEntities[resultEntities.length - 1].type) {
        resultEntities.push(entity)
      }
    })
    return resultEntities
  }

  /**
   * Maps database results to database models
   *
   * @param {object} userJson Object obtained from database
   * @param {object} objectPrototype The Model class object to copy to
   * @returns {object} Model class object with properties
   */
  static mapDatabaseResultToModelObject (userJson, objectPrototype) {
    const object = Object.create(objectPrototype)
    return Object.assign(object, userJson)
  }

  /**
   * Generates the playback context token which includes the url for the video.
   * If available in the lambda environment, this will also set:
   * - AWS credentials that can be used by the web player
   * - The AWS region
   *
   * @param {object} videoMetadata Video metadata
   * @param {object} webPlayerCredentials Expiring AWS credentials to enable the web player to call the AWS API Gateway
   * @param {string} customerId The customer id from account linking
   * @returns {string} The token is returned as a string of serialized JSON
   */
  static getPlaybackContextToken (videoMetadata, webPlayerCredentials, customerId) {
    const contextToken = {
      videoMetadata: videoMetadata,
      aws: {
        customerId: customerId,
        credentials: {},
        region: undefined
      },
      autoPlay: true
    }

    if (process.env.AWS_REGION) {
      contextToken.aws.region = process.env.AWS_REGION
    }

    if (process.env.API_GATEWAY_ID) {
      contextToken.aws.apiGatewayId = process.env.API_GATEWAY_ID
    }

    if (process.env.ENABLE_WEB_PLAYER_LOGGING) {
      contextToken.aws.cloudWatchLogsEnabled = process.env.ENABLE_WEB_PLAYER_LOGGING === 'true'
    }

    contextToken.aws.credentials = webPlayerCredentials

    return Util.base64Encode(JSON.stringify(contextToken))
  }

  /**
   * Get temporary IAM credentials that expire so that the web player can call the AWS API Gateway
   *
   * @returns {Promise<{}>} A promise of the AWS credentials
   */
  static getWebPlayerAwsCredentials () {
    let p = null
    if (process.env.IAM_STS_WEB_PLAYER_ROLE_ARN) {
      this.logger.info('Environment variable IAM_STS_WEB_PLAYER_ROLE_ARN is set - creating web player credentials', process.env.IAM_STS_WEB_PLAYER_ROLE_ARN)
      const roleArn = process.env.IAM_STS_WEB_PLAYER_ROLE_ARN
      const roleSessionName = 'web-player-' + Date.now()
      this.logger.info('Using role session name for STS Access assume role', roleSessionName)
      p = StsAccess.assumeRole(roleArn, roleSessionName, 3600)
    } else {
      this.logger.info('Environment variable IAM_STS_WEB_PLAYER_ROLE_ARN is not set - not creating web player credentials')
      p = Promise.resolve()
    }
    return p.then(
      (data) => {
        if (data && data.Credentials) {
          this.logger.info('Successfully retrieved the aws credentials.')
          return data.Credentials
        } else {
          this.logger.error('Did not receive web player credentials')
        }
      },
      err => {
        this.logger.error('Failed to generate and web player credentials', err)
      }
    )
  }

  /**
   * Create self-signed URLs for all the URLs in a video metadata object
   *
   * @param {Array} videoMetadataList A list of video metadata objects
   * @returns {Array} A list of video metadata objects with self-signed S3 URLs
   */
  static signVideoMetadataUrls (videoMetadataList) {
    const videoContentBucket = process.env.VIDEO_CONTENT_BUCKET
    return videoMetadataList.map(videoMetadata => {
      if (videoMetadata.videoUrl) {
        const s3Key = `${Constants.VIDEO_CONTENT_S3_PREFIX}/${videoMetadata.videoUrl}`
        videoMetadata.videoUrl = S3Access.getSignedUrl(videoContentBucket, s3Key)
      }
      if (videoMetadata.thumbnailImageSources) {
        videoMetadata.thumbnailImageSources.forEach(thumbnailImageSource => {
          const s3Key = `${Constants.VIDEO_CONTENT_S3_PREFIX}/${thumbnailImageSource.url}`
          thumbnailImageSource.url = S3Access.getSignedUrl(videoContentBucket, s3Key)
        })
      }
      if (videoMetadata.closedCaptionsFile) {
        const s3Key = `${Constants.VIDEO_CONTENT_S3_PREFIX}/${videoMetadata.closedCaptionsFile}`
        videoMetadata.closedCaptionsFile = S3Access.getSignedUrl(videoContentBucket, s3Key)
      }
      return videoMetadata
    })
  }

  /**
   * Base64 encode a string
   *
   * @param {string} input The string to be encoded
   * @returns {*} The Base64 string result
   */
  static base64Encode (input) {
    return Buffer.from(input).toString('base64')
  }

  /**
   * Base64 decode a string
   *
   * @param {string} input The Base64 string to be decoded
   * @returns {*} The string result
   */
  static base64Decode (input) {
    return Buffer.from(input, 'base64').toString()
  }

  /**
   * Get the access token from a request. If the request does not have an access token then default to null.
   *
   * @param {object} event The raw input into the lambda
   * @returns {string|null} The access token or null
   */
  static getAccessTokenFromEvent (event) {
    const directive = event.directive ? event.directive : null
    const endpoint = directive && directive.endpoint ? directive.endpoint : null
    const scope = endpoint && endpoint.scope ? endpoint.scope : null
    const token = scope && scope.token ? scope.token : null
    return token
  }

  /**
   * Given an access token, project name, and a list of video metadata items,
   * look up the video ids in the video progress DynamoDb table. Next, set the
   * `absoluteViewingPositionMilliseconds` field in the video metadata objects to
   * be the last known time position. If the last known time position is within
   * 15 seconds of the end of the video, set `absoluteViewingPositionMilliseconds` to 0.
   *
   * @param {string} accessToken The AWS Cognito access used to derive the user's Id
   * @param {string} projectName The name of the project (used for constructing DynamoDB table names)
   * @param {Array} videoMetadataList The original video metadata object list
   * @returns {Promise<object>} A promise of updated video metadata objects
   */
  static setVideoProgressTime (accessToken, projectName, videoMetadataList) {
    return UserUtil.getUserIdfromAccessToken(accessToken)
      .then(userId => {
        const videoIds = videoMetadataList.map(videoMetadata => videoMetadata.id)
        return VideoProgressDbGateway.getProgressForVideos(projectName, userId, videoIds)
      })
      .then(videoId2PositionMap => {
        videoMetadataList.forEach(videoMetadata => {
          if (videoId2PositionMap[videoMetadata.id]) {
            if (parseInt(videoId2PositionMap[videoMetadata.id]) < parseInt(videoMetadata.runTimeInMilliseconds) - 15000) {
              videoMetadata.absoluteViewingPositionMilliseconds = videoId2PositionMap[videoMetadata.id]
            } else {
              videoMetadata.absoluteViewingPositionMilliseconds = 0
            }
          } else {
            videoMetadata.absoluteViewingPositionMilliseconds = 0
          }
        })
        return videoMetadataList
      })
      .catch(err => {
        this.logger.error('There was an error with Util.setVideoProgressTime', err)
        return videoMetadataList
      })
  }

  static get logger () {
    return getLogger('util')
  }
}
