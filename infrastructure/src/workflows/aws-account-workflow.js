import { AwsAccountUtil } from '../util/aws/aws-account-util'
import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import * as log4js from 'log4js'
import { AwsSdkUtil } from '../util/aws/aws-sdk-util'

/**
 * AWS account workflow definitions
 */
export class AwsAccountWorkflow {
  static get logger () {
    return log4js.getLogger('ask-account-workflow')
  }

  /**
   * Run the AWS account initialization workflow
   *
   * @returns {Observable} An observable
   */
  static initialize () {
    this.logger.info('Read any existing aws configs')
    const awsConfigs = AwsAccountUtil.readAwsConfigs()
    this.logger.info('Prompt for aws configs')
    return AwsAccountUtil.promptForAwsCredentials(awsConfigs)
      .pipe(mergeMap(awsConfigs => {
        this.logger.info('Save the aws configs')
        AwsAccountUtil.persistAwsConfigs(awsConfigs)
        this.logger.info('Validate the aws configs')
        return AwsAccountUtil.validateCredentials()
      }))
      .pipe(mergeMap(validCredentials => {
        if (validCredentials) {
          this.logger.info('Credentials are valid')
          return of(undefined)
        } else {
          this.logger.error('AWS credentials were invalid, please re-enter them')
          return this.initialize()
        }
      }))
      .pipe(map(() => {
        const awsAccessKeyId = AwsAccountUtil.getAwsAccessKeyId()
        const awsSecretAccessKey = AwsAccountUtil.getAwsSecretAccessKey()
        AwsSdkUtil.setAwsCredentials(awsAccessKeyId, awsSecretAccessKey)
      }))
  }

  /**
   * Run the AWS setup steps only if required
   *
   * @returns {Observable} An observable
   */
  static initializeIfNeeded () {
    this.logger.info('Starting initialize aws configs workflow if needed')
    return AwsAccountUtil.requiresAwsCredentialsPrompt()
      .pipe(mergeMap(isRequired => {
        if (isRequired) {
          return this.initialize()
        } else {
          this.logger.info('Using existing AWS credentials')
          this.logger.info('Initialize AWS configs workflow complete')
          return of(undefined)
        }
      }))
      .pipe(map(() => {
        const awsAccessKeyId = AwsAccountUtil.getAwsAccessKeyId()
        const awsSecretAccessKey = AwsAccountUtil.getAwsSecretAccessKey()
        AwsSdkUtil.setAwsCredentials(awsAccessKeyId, awsSecretAccessKey)
      }))
  }
}
