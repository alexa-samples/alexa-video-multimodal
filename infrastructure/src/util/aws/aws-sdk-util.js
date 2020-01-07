import { from, Observable, of } from 'rxjs'
import * as AWS from 'aws-sdk'
import { catchError, map } from 'rxjs/operators'
import { Util } from '../util'

/**
 * Utility for AWS Node.js SDK
 */
export class AwsSdkUtil {
  /**
   * Wrapper around making requests with the node aws-sdk to return rxjs observables.
   * Standardized logging and error handling.
   *
   * @param {object} api API, for example new S3()
   * @param {object} func API function (e.g. s3.listBuckets)
   * @param {Array} args API call arguments
   * @param {object} logger A logger
   * @param {string} message A log message for the API call
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {boolean} suppressAllLogs Do not log anything (except errors)
   * @returns {Observable<object>} The response of the API call
   */
  static makeRequest (api, func, args, logger, message, exitOnError = true, suppressErrorMessage = false, suppressAllLogs = false) {
    let hadError = false
    if (!suppressAllLogs) {
      logger.info('Going to ' + message)
    }
    return from(func.apply(api, args).promise())
      .pipe(catchError((err) => {
        hadError = true
        if (exitOnError) {
          Util.exitWithError('Error with ' + message + ' -> ' + err)
        } else if (!suppressErrorMessage) {
          logger.error('Error with ' + message)
        }
        return of(undefined)
      })).pipe(map(data => {
        if (!hadError) {
          if (!suppressAllLogs) {
            logger.info('Success with ' + message)
          }
        }
        return data
      }))
  }

  /**
   * Set the AWS credentials to be used by aws-sdk
   *
   * @param {string} accessKeyId Access key Id
   * @param {string} secretAccessKey Secret access key
   * @param {string|null} sessionToken Session token
   */
  static setAwsCredentials (accessKeyId, secretAccessKey, sessionToken = null) {
    const region = Util.getAwsDeploymentRegion()
    const credentials = {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region
    }
    if (sessionToken) {
      credentials[sessionToken] = sessionToken
    }
    AWS.config.update(credentials)
  }
}
