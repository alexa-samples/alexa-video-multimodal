import { CognitoAccess } from '../access/aws/cognito-access'
import { VideoProgressDbGateway } from '../gateway/video-progress-db-gateway'
import { getLogger } from 'log4js'

/**
 * Utility methods for user data actiona
 */
export class UserUtil {
  /**
   * Persist the progress a particular user has made watching a specific video in a database
   *
   * @param {object} event The raw event sent to the lambda
   * @param {string} projectName The name of the project
   * @returns {Promise} A thenable promise
   */
  static updateUserVideoProgress (event, projectName) {
    const directive = event.directive
    const payload = directive.payload
    const videoProgress = payload.videoProgress
    const videoId = videoProgress.id
    const positionInMilliseconds = videoProgress.positionInMilliseconds
    const accessToken = videoProgress.accessToken
    return UserUtil.getUserIdfromAccessToken(accessToken)
      .then(userName => {
        if (userName) {
          return VideoProgressDbGateway.updateVideoProgress(projectName, userName, videoId, positionInMilliseconds)
        } else {
          return Promise.resolve()
        }
      })
  }

  /**
   * Given an access token, get the user name associated with that token
   *
   * @param {string} accessToken The access token
   * @returns {Promise<string>} The UserName
   */
  static getUserIdfromAccessToken (accessToken) {
    return CognitoAccess.getUser(accessToken)
      .then(attributes => {
        if (attributes.Username) {
          return attributes.Username
        } else {
          throw new Error('invalid response returned' + attributes)
        }
      })
      .catch(err => {
        this.logger.error('There was an error with getUser', err)
      })
  }

  static get logger () {
    return getLogger('user-util')
  }
}
