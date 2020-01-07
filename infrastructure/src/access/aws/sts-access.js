import * as log4js from 'log4js'
import { AwsSdkUtil } from '../../util/aws/aws-sdk-util'
import { STS } from 'aws-sdk'
import { map } from 'rxjs/operators'

/**
 * AWS IAM STS access functions
 */
export class StsAccess {
  static get logger () {
    return log4js.getLogger('sts-util')
  }

  /**
   * Get a caller identity
   *
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<object>} An observable with the caller identity
   */
  static getCallerIdentity (exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const params = {}

    const sts = new STS()
    return AwsSdkUtil.makeRequest(
      sts,
      sts.getCallerIdentity,
      [params],
      this.logger,
      logMessage || 'get caller identity',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Get AWS account Id
   *
   * @returns {Observable<string>} An observable with the account Id
   */
  static getAccountNumber () {
    return this.getCallerIdentity()
      .pipe(map(data => data.Account))
  }
}
