import STS from 'aws-sdk/clients/sts'
import { getLogger } from 'log4js'

/**
 * AWS IAM STS access methods
 */
export class StsAccess {
  /**
   * Get an instance of the STS client API
   * Mainly used for unit testing.
   *
   * @returns {object} STS object
   */
  static get sts () {
    return this._sts ? this._sts : new STS()
  }

  /**
   * Set an instance of the STS client API
   * Mainly used for unit testing.
   *
   * @param {object} sts STS object
   */
  static set sts (sts) {
    this._sts = sts
  }

  /**
   * Set temporary AWS credentials using IAM STS. These credentials will
   * be pushed down to the web player so that it can write its
   * logs to AWS CloudWatch Logs. The policy managing the temporary credentials
   * can also be expanded if the web player needs to interact with other AWS resources.
   *
   * This token is not required for basic video skills. They are used only if the web player
   * needs to make callbacks to an AWS resource (e.g. CloudWatch Logs, video time updates) while running on device.
   *
   * @param {string} roleArn Role ARN name
   * @param {string} roleSessionName Role session name
   * @param {number} durationSeconds Duration in seconds
   * @returns {Promise} Promise for AWS credentials for web player
   */
  static assumeRole (roleArn, roleSessionName, durationSeconds) {
    const params = {
      RoleArn: roleArn,
      DurationSeconds: durationSeconds,
      RoleSessionName: roleSessionName
    }
    return new Promise((resolve, reject) => {
      this.sts.assumeRole(params, (err, data) => {
        if (err) {
          this.logger.error('STS assume role API call failed', err, err.stack)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  static get logger () {
    return getLogger('sts-access')
  }
}
