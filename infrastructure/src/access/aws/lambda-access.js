import * as log4js from 'log4js'
import { AwsSdkUtil } from '../../util/aws/aws-sdk-util'
import Lambda from 'aws-sdk/clients/lambda'
import { map, mergeMap } from 'rxjs/operators'
import forEach from 'lodash/forEach'

/**
 * AWS Lambda access functions
 */
export class LambdaAccess {
  static get logger () {
    return log4js.getLogger('lambda-access')
  }

  /**
   * Update a lambda function's code. This is done by
   * informing the lambda to use new code on S3.
   *
   * @param {string} functionName AWS Lambda function name
   * @param {string} s3Bucket S3 Bucket with the lambda code
   * @param {string} s3Key S3 Key with the lambda code
   * @param {boolean} publish true if the lambda must publish the changes with the updated code immediately
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static updateFunctionCode (functionName, s3Bucket, s3Key, publish = true, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const params = {
      FunctionName: functionName,
      Publish: true,
      S3Bucket: s3Bucket,
      S3Key: s3Key
    }
    const lambda = new Lambda()
    return AwsSdkUtil.makeRequest(
      lambda,
      lambda.updateFunctionCode,
      [params],
      this.logger,
      logMessage || 'update lambda function code',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Check if a lambda function exists
   *
   * @param {string} functionName AWS Lambda function name
   * @returns {Observable<boolean>} An observable - true if the function name exists
   */
  static checkIfLambdaFunctionExists (functionName) {
    const logger = log4js.getLogger('s3-util')
    return LambdaAccess.getFunction(
      functionName,
      false,
      true,
      'check if lambda function exists "' + functionName + '"')
      .pipe(map(data => {
        if (data) {
          logger.info('Lambda function "' + functionName + '" exists')
          return true
        } else {
          logger.info('Lambda function "' + functionName + '" does not exist')
          return false
        }
      }))
  }

  /**
   * Get a lambda function
   *
   * @param {string} functionName AWS Lambda function name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<object>} An observable with the lambda function information
   */
  static getFunction (functionName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('lambda-util')
    const params = {
      FunctionName: functionName
    }
    const lambda = new Lambda()
    return AwsSdkUtil.makeRequest(
      lambda,
      lambda.getFunction,
      [params],
      logger,
      logMessage || 'get lambda function "' + functionName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Add a permission to a function
   * This is used in this project to configure the Alexa skill as
   * a trigger for the lambda
   *
   * @param {string} functionName AWS Lambda function name
   * @param {string} action Permission action
   * @param {string} principal Permission principle
   * @param {string} statementId Permission statement Id
   * @param {string} eventSourceToken Permission event source token
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static addPermission (functionName, action, principal, statementId, eventSourceToken, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('lambda-util')
    const params = {
      Action: action,
      FunctionName: functionName,
      Principal: principal,
      StatementId: statementId,
      EventSourceToken: eventSourceToken
    }
    const lambda = new Lambda()
    return AwsSdkUtil.makeRequest(
      lambda,
      lambda.addPermission,
      [params],
      logger,
      logMessage || 'get lambda function "' + functionName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Get the configuration for a lambda function
   *
   * @param {string} functionName AWS Lambda function name
   * @param {boolean} exitOnError Exit the process if this APIcall fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static getFunctionConfiguration (functionName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('lambda-util')
    const params = {
      FunctionName: functionName
    }
    const lambda = new Lambda()
    return AwsSdkUtil.makeRequest(
      lambda,
      lambda.getFunctionConfiguration,
      [params],
      logger,
      logMessage || 'get lambda function configuration "' + functionName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Update the configuration for a lambda function
   *
   * @param {string} functionName AWS Lambda function name
   * @param {object} params Parameters for the updateFunctionConfiguration request
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static updateFunctionConfiguration (functionName, params, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('lambda-util')
    const lambda = new Lambda()
    return AwsSdkUtil.makeRequest(
      lambda,
      lambda.updateFunctionConfiguration,
      [params],
      logger,
      logMessage || 'get lambda function configuration "' + functionName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Update the environment variables for a lambda function by updating its configuration
   *
   * @param {string} functionName AWS Lambda function name
   * @param {object} environmentVariables a map linking environment variable names to value
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static updateLambdaEnvironmentVariables (functionName, environmentVariables, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    let functionConfiguration = null
    return this.getFunctionConfiguration(functionName, exitOnError, suppressErrorMessage, logMessage)
      .pipe(map(config => {
        functionConfiguration = config
        forEach(environmentVariables, (value, key) => {
          functionConfiguration.Environment.Variables[key] = value
        })
        delete functionConfiguration.FunctionArn
        delete functionConfiguration.CodeSize
        delete functionConfiguration.LastModified
        delete functionConfiguration.CodeSha256
        delete functionConfiguration.Version
        delete functionConfiguration.MasterArn
        delete functionConfiguration.VpcConfig
      }))
      .pipe(mergeMap(() => this.updateFunctionConfiguration(functionName, functionConfiguration, exitOnError, suppressErrorMessage, logMessage)))
  }
}
