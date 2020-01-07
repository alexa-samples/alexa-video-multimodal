import { Constants } from '../utils/constants'
import { DynamoDbAccess } from '../access/aws/dynamo-db-access'
import { getLogger } from 'log4js'

/**
 * This class handles operations relating to tracking video progress for users.
 * This is meant to support 'continue watching' functionality
 */
export class VideoProgressDbGateway {
  /**
   * This method constructs a DynamoDb putItem request to persist the last known time position of a specific video
   * for a specific user
   *
   * @param {string} projectName Project name (used to construct the DynamoDB table name)
   * @param {string} userId The user Id
   * @param {string} videoId The video Id
   * @param {number} positionInMilliseconds The last known position of the video in milliseconds
   * @returns {Promise<object>} A thenable promise
   */
  static updateVideoProgress (projectName, userId, videoId, positionInMilliseconds) {
    const ttl = Math.floor(Date.now() / 1000) + Constants.VIDEO_PROGRESS_TTL
    const tableName = projectName + '-video-progress-table'
    const item = {
      userId: { S: userId },
      videoId: { S: videoId },
      positionInMilliseconds: { N: positionInMilliseconds + '' },
      ttl: { N: ttl + '' }
    }
    return DynamoDbAccess.putItem(item, tableName)
      .catch(err => {
        this.logger.error('Error', err)
      })
  }

  /**
   * Given a list of video ids and  a userId, look up the video progress for each video for that user.
   * This returns a map where the key is the videoId and the values is the position in milliseconds for that specific video.
   *
   * @param {string} projectName Project name (used to construct the DynamoDB table name)
   * @param {string} userId The user Id
   * @param {Array}videoIds A list of video Ids to lookup
   * @returns {Promise<object>} A map where the key is the videoId and the values is the position in milliseconds for that specific video
   */
  static getProgressForVideos (projectName, userId, videoIds) {
    const keys = videoIds.map(videoId => {
      return {
        userId: { S: userId },
        videoId: { S: videoId }
      }
    })
    const tableName = projectName + '-video-progress-table'
    return DynamoDbAccess.batchGetItem(keys, tableName)
      .then(result => {
        const videoID2PositionMap = {}
        result.Responses[projectName + '-video-progress-table'].forEach(r => {
          videoID2PositionMap[r.videoId.S] = r.positionInMilliseconds.N
        })
        return videoID2PositionMap
      })
  }

  static get logger () {
    return getLogger('video-progress-db-gateway')
  }
}
