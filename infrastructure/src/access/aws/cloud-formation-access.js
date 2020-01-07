import * as log4js from 'log4js'
import { AwsSdkUtil } from '../../util/aws/aws-sdk-util'
import CloudFormation from 'aws-sdk/clients/cloudformation'
import { map } from 'rxjs/operators'

/**
 * AWS CloudFormation access functions
 */
export class CloudFormationAccess {
  /**
   * Check that a cloud formation stack exists by name
   *
   * @param {string} stackName Stack name
   * @returns {Observable<boolean>} Observable - true if the stack exists
   */
  static checkStackExists (stackName) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.describeStacks,
      [params],
      logger,
      'check cloud formation stack "' + stackName + '" exists',
      false,
      true)
      .pipe(map(data => {
        if (data) {
          logger.info('Stack "' + stackName + '" exists')
          return true
        } else {
          logger.info('Stack "' + stackName + '" does not exist')
          return false
        }
      }))
  }

  /**
   * Return the cloud formation status of a stack by name
   *
   * @param {string} stackName Stack name
   * @returns {Observable<string>} Observable - a string of the stack's status; undefined if no stacks are found
   */
  static getStackStatus (stackName) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.describeStacks,
      [params],
      logger,
      'get cloud formation stack status for stack "' + stackName + '"',
      false,
      true)
      .pipe(map(describeStacksResult => {
        const stacksResult = describeStacksResult.Stacks
        if (stacksResult.length === 0) {
          return undefined
        }
        return stacksResult[0].StackStatus
      }))
  }

  /**
   * Create a CloudFormation stack (does not wait for completion)
   *
   * @param {string} stackName Stack name
   * @param {object} parameters CloudFormation stack parameters object
   * @param {string} templateContents A string with the CloudFormation template contents
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @returns {Observable<undefined>} An observable
   */
  static createCloudFormationStack (stackName, parameters, templateContents, exitOnError = true, suppressErrorMessage = false) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName,
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      EnableTerminationProtection: false,
      OnFailure: 'ROLLBACK',
      TemplateBody: templateContents,
      Parameters: parameters
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.createStack,
      [params],
      logger,
      'create stack "' + stackName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Delete a CloudFormation stack (does not wait for completion)
   *
   * @param {string} stackName Stack name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static deleteCloudFormationStack (stackName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.deleteStack,
      [params],
      logger,
      logMessage || 'delete stack "' + stackName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * List AWS CloudFormation stacks
   *
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static listStacks (exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {}
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.listStacks,
      [params],
      logger,
      logMessage || 'list aws cloud formation stacks',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Wait for CloudFormation stack to be in a specified state
   *
   * @param {string} stackName Stack name
   * @param {string} state The CloudFormation stack state to wait for
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @returns {Observable<undefined>} An observable
   */
  static waitForStackState (stackName, state, exitOnError = true, suppressErrorMessage = false) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.waitFor,
      [state, params],
      logger,
      'wait for stack "' + stackName + '" to be in state "' + state + '" (this could take a few minutes)',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Describe stack resources
   *
   * @param {string} stackName Stack name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @returns {Observable<undefined>} An observable
   */
  static describeStackResources (stackName, exitOnError = true, suppressErrorMessage = false) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.describeStackResources,
      [params],
      logger,
      'describe stack resources for stack "' + stackName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Get all resources in a stack of a given type (e.g. get all 'AWS::S3::Bucket' resources)
   *
   * @param {string} stackName Stack name
   * @param {string} resourceType A resource type (e.g. AWS::S3::Bucket)
   * @returns {Observable<{}>} An observable
   */
  static getResourcesOfType (stackName, resourceType) {
    return CloudFormationAccess.describeStackResources(stackName)
      .pipe(map(resources => {
        return resources.StackResources
          .filter(r => r.ResourceType === resourceType)
      }))
  }

  /**
   * Create a change set (does not wait for change set to be created)
   *
   * @param {string} stackName Stack name
   * @param {object} parameters CloudFormation stack parameters object
   * @param {string} templateContents A string with the CloudFormation template contents
   * @param {string} changeSetName Change set name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static createChangeSet (stackName, parameters, templateContents, changeSetName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      ChangeSetName: changeSetName,
      StackName: stackName,
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      TemplateBody: templateContents,
      Parameters: parameters
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.createChangeSet,
      [params],
      logger,
      logMessage || 'creating change set for stack "' + stackName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Wait for CloudFormation change set to be in a specified state
   *
   * @param {string} stackName Stack name
   * @param {string} changeSetName Change set name
   * @param {string} state The CloudFormation change set state to wait for
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static waitForChangeSetState (stackName, changeSetName, state, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName,
      ChangeSetName: changeSetName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.waitFor,
      [state, params],
      logger,
      logMessage || 'wait for change set  "' + changeSetName + '" to be in state "' + state + '" for stack "' + stackName + '" (this could take a few minutes)',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Execute a change set
   *
   * @param {string} stackName Stack name
   * @param {string} changeSetName Change set name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<undefined>} An observable
   */
  static executeChangeSet (stackName, changeSetName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName,
      ChangeSetName: changeSetName
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.executeChangeSet,
      [params],
      logger,
      logMessage || 'execute change set  "' + changeSetName + '" for stack "' + stackName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Describe a stack resource
   *
   * @param {string} stackName Stack name
   * @param {string} logicalResourceId Logical resource Id
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @returns {Observable<undefined>} An observable
   */
  static describeStackResource (stackName, logicalResourceId, exitOnError = true, suppressErrorMessage = false) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      StackName: stackName,
      LogicalResourceId: logicalResourceId
    }
    const cloudFormation = new CloudFormation()
    return AwsSdkUtil.makeRequest(
      cloudFormation,
      cloudFormation.describeStackResource,
      [params],
      logger,
      'describe stack resource for stack "' + stackName + '" with logicalResourceId "' + logicalResourceId + '"',
      exitOnError,
      suppressErrorMessage)
  }
}
