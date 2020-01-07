import { FilesystemAccess } from '../../access/filesystem-access'
import * as log4js from 'log4js'
import { of } from 'rxjs'
import { map } from 'rxjs/operators'
import { CloudFormationAccess } from '../../access/aws/cloud-formation-access'
import { Util } from '../util'
import { AwsSdkUtil } from './aws-sdk-util'
import { APP_LOGGER } from '../../infrastructure'

/**
 * AWS account utility functions
 */
export class AwsAccountUtil {
  /**
   * Prompt for AWS credentials including aws_access_key_id, aws_secret_access_key
   *
   * @param {object} awsConfig AWS config
   * @returns {Observable<object>} Observable with user responses
   */
  static promptForAwsCredentials (awsConfig) {
    const awsKeyPrompt = {
      type: 'text',
      name: 'awsAccessKeyId',
      message: 'Please enter your AWS Access Key',
      validate: value => value && value.trim().length > 0 ? true : 'You must specify a value',
      initial: awsConfig.awsAccessKeyId ? awsConfig.awsAccessKeyId : null
    }
    const awsSecretPrompt = {
      type: 'password',
      name: 'awsSecretAccessKey',
      message: 'Please enter your AWS Secret Access Key',
      validate: value => value && value.trim().length > 0 ? true : 'You must specify a value',
      initial: awsConfig.awsSecretAccessKey ? awsConfig.awsSecretAccessKey : null
    }
    const promptList = [awsKeyPrompt, awsSecretPrompt]
    return Util.doPrompt(promptList)
  }

  /**
   * Check whether the AWS credentials are set up
   *
   * @returns {Observable<boolean>} True if required
   */
  static requiresAwsCredentialsPrompt () {
    const awsConfigs = this.readAwsConfigs()
    if (!awsConfigs.awsAccessKeyId || !awsConfigs.awsSecretAccessKey) {
      return of(true)
    }
    return this.validateCredentials()
      .pipe(map(isValid => !isValid))
  }

  /**
   * Reads AWS config files and returns the configs as an object
   *
   * @returns {object} AWS configs
   */
  static readAwsConfigs () {
    const logger = log4js.getLogger('aws-account-util')
    const awsConfigs = {
      awsAccessKeyId: null,
      awsSecretAccessKey: null
    }

    if (!this._hasAwsDirectory()) {
      logger.info('Directory ~/.aws is not present')
      return awsConfigs
    }

    logger.debug('Read the ~/.aws/credentials file')
    const profile = this.getAwsUserProfile()
    if (this._hasAwsCredentialsFile()) {
      const credentialsFile = FilesystemAccess.readIniFile(this.getAwsCredentialsFileName())
      if (credentialsFile[this.getAwsUserProfile()]) {
        if (credentialsFile[profile].aws_access_key_id) {
          awsConfigs.awsAccessKeyId = credentialsFile[profile].aws_access_key_id
        }
        if (!credentialsFile[profile].aws_secret_access_key) {} else {
          awsConfigs.awsSecretAccessKey = credentialsFile[profile].aws_secret_access_key
        }
      }
    }

    return awsConfigs
  }

  /**
   * Write the AWS configs to disk
   *
   * @param {object} awsConfigs AWS configs
   * @returns {object} AWS configs
   */
  static persistAwsConfigs (awsConfigs) {
    const logger = log4js.getLogger('aws-account-util')
    logger.debug('Ensure ~/.aws directory and relevant files exist.')
    if (!this._hasAwsDirectory()) {
      FilesystemAccess.mkdir(this.getAwsConfigDirectoryName())
    }
    if (!this._hasAwsCredentialsFile()) {
      FilesystemAccess.touch(this.getAwsCredentialsFileName())
    }
    logger.debug('Write the ~/.aws/credentials file')
    const profile = this.getAwsUserProfile()
    const credentialsFile = FilesystemAccess.readIniFile(this.getAwsCredentialsFileName())
    if (!credentialsFile[profile]) {
      credentialsFile[profile] = {}
    }
    credentialsFile[profile].aws_access_key_id = awsConfigs.awsAccessKeyId
    credentialsFile[profile].aws_secret_access_key = awsConfigs.awsSecretAccessKey
    FilesystemAccess.writeIniFile(this.getAwsCredentialsFileName(), credentialsFile)

    return awsConfigs
  }

  /**
   * Validate credentials by making a simple AWS SDK request (list cloud formation stacks)
   *
   * @returns {Observable<boolean>} True if valid
   */
  static validateCredentials () {
    APP_LOGGER.info('Validating AWS credentials')
    const awsAccessKeyId = AwsAccountUtil.getAwsAccessKeyId()
    const awsSecretAccessKey = AwsAccountUtil.getAwsSecretAccessKey()
    AwsSdkUtil.setAwsCredentials(awsAccessKeyId, awsSecretAccessKey)
    return CloudFormationAccess.listStacks(false, true)
      .pipe(map(data => {
        const isValid = !!data
        APP_LOGGER.info('AWS credentials are ' + (isValid ? 'valid' : 'invalid'))
        return isValid
      }))
  }

  /**
   * Get the aws-sdk user profile
   *
   * @returns {string} AWS User Profile
   */
  static getAwsUserProfile () {
    return 'alexa-video-multimodal-reference-software-user-profile'
  }

  /**
   * Get the AWS access key Id from the AWS config file
   *
   * @returns {string} AWS access key Id
   */
  static getAwsAccessKeyId () {
    return this.readAwsConfigs().awsAccessKeyId
  }

  /**
   * Get the AWS secret access key from the AWS config file
   *
   * @returns {string} AWS secret access key
   */
  static getAwsSecretAccessKey () {
    return this.readAwsConfigs().awsSecretAccessKey
  }

  /**
   * Check if ~/.aws directory exists
   *
   * @returns {boolean} True if exists
   * @private
   */
  static _hasAwsDirectory () {
    return FilesystemAccess.checkIfFileOrDirectoryExists(this.getAwsConfigDirectoryName())
  }

  /**
   * Check if ~/.aws/credentials file exists
   *
   * @returns {boolean} True if exists
   * @private
   */
  static _hasAwsCredentialsFile () {
    return FilesystemAccess.checkIfFileOrDirectoryExists(this.getAwsCredentialsFileName())
  }

  /**
   * return ~/.aws
   *
   * @returns {string} Absolute path to the AWS config directory
   */
  static getAwsConfigDirectoryName () {
    const cwd = FilesystemAccess.getHomeDirectory()
    return FilesystemAccess.constructPath([cwd, '.aws'])
  }

  /**
   * return ~/.aws/credentials
   *
   * @returns {string} Absolute path to the AWS credentials file name
   */
  static getAwsCredentialsFileName () {
    return FilesystemAccess.constructPath([this.getAwsConfigDirectoryName(), 'credentials'])
  }
}
