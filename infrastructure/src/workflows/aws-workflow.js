import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import * as log4js from 'log4js'
import { Util } from '../util/util'
import { forkJoin, of } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { S3Access } from '../access/aws/s3-access'
import { FilesystemAccess } from '../access/filesystem-access'
import { LambdaStackWorkflow } from './lambda-stack-workflow'
import { CognitoAccess } from '../access/aws/cognito-access'
import { APP_LOGGER } from '../infrastructure'

/**
 * Utility class for AWS related workflows
 */
export class AwsWorkflow {
  static get logger () {
    return log4js.getLogger('aws-workflow')
  }

  /**
   * A workflow for stack creation, which performs the following actions:
   *  - checks if stack exists
   *  - creates a stack
   *  - waits for it to get into the 'stackCreateComplete' state
   *
   * @param {string} stackName Stack name
   * @param {object} parameters Stack parameters
   * @param {string} templateAbsolutePath Absolute path to the stack template
   * @returns {Observable} An observable
   */
  static stackCreationWorkflow (stackName, parameters, templateAbsolutePath) {
    return CloudFormationAccess.checkStackExists(stackName)
      .pipe(mergeMap(stackExists => {
        if (stackExists) {
          APP_LOGGER.info(`Not creating "${stackName}" stack because it already exists`)
          this.logger.debug(`Not creating "${stackName}" stack because it already exists`)
          return of(undefined)
        } else {
          APP_LOGGER.info(`Creating "${stackName}" stack`)
          const templateContents = FilesystemAccess.readFile(templateAbsolutePath)
          let hadError = false
          return CloudFormationAccess.createCloudFormationStack(stackName, parameters, templateContents)
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Waiting for stack "${stackName}" to be in state 'stackCreateComplete' (This can take a few minutes)`)
              return CloudFormationAccess.waitForStackState(stackName, 'stackCreateComplete', false)
            }))
            .pipe(mergeMap(result => {
              if (result === undefined) {
                hadError = true
                return CloudFormationAccess.getStackStatus(stackName)
              }
              return of(undefined)
            }))
            .pipe(mergeMap(stackStatus => {
              if (stackStatus === 'ROLLBACK_COMPLETE') {
                APP_LOGGER.info(`Initial stack creation failed for stack "${stackName}". Deleting stack "${stackName}"`)
                return this.stackDeletionWorkflow(stackName)
              }
              if (stackStatus === undefined) {
                APP_LOGGER.info(`No stacks found for stack "${stackName}"`)
              }
              return of(undefined)
            }))
            .pipe(map(() => {
              if (hadError) {
                APP_LOGGER.info(`Stack creation failed for stack "${stackName}"`)
              } else {
                APP_LOGGER.info(`Stack creation success for stack "${stackName}"`)
              }
            }))
        }
      }))
  }

  /**
   * A workflow to update a stack. It performs the following actions:
   *  - checks stack exists
   *  - create a change set
   *  - waits for change to get into 'changeSetCreateComplete' state
   *  - executes the change set
   *  - waits for the stack to get into the 'stackUpdateComplete' state
   *
   * @param {string} stackName Stack name
   * @param {object} parameters Stack parameters
   * @param {string} templateAbsolutePath Absolute path to the stack template
   * @returns {Observable} An observable
   */
  static stackUpdateWorkflow (stackName, parameters, templateAbsolutePath) {
    return CloudFormationAccess.checkStackExists(stackName)
      .pipe(mergeMap(stackExists => {
        if (!stackExists) {
          APP_LOGGER.info(`Not updating  "${stackName}" stack because it does not exists`)
          this.logger.debug(`Not updating "${stackName}" stack because it does not exists`)
          return of(undefined)
        } else {
          APP_LOGGER.info(`Updating  "${stackName}" stack`)
          const changeSetName = 'change-set-' + Date.now()
          const templateContents = FilesystemAccess.readFile(templateAbsolutePath)
          APP_LOGGER.info(`Creating a change set for  "${stackName}" `)
          return CloudFormationAccess.createChangeSet(stackName, parameters, templateContents, changeSetName)
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Waiting for change set "${changeSetName}" to be in state "changeSetCreateComplete" for stack "${stackName}" (This can take a few minutes)`)
              return CloudFormationAccess.waitForChangeSetState(stackName, changeSetName, 'changeSetCreateComplete')
            }))
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Executing change set "${changeSetName}" for stack "${stackName}" `)
              return CloudFormationAccess.executeChangeSet(stackName, changeSetName)
            }))
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Waiting for stack "${stackName}" to be in state "stackUpdateComplete" (This can take a few minutes)`)
              return CloudFormationAccess.waitForStackState(stackName, 'stackUpdateComplete')
            }))
            .pipe(map(() => {
              APP_LOGGER.info(`Stack update success for stack "${stackName}"`)
            }))
        }
      }))
  }

  /**
   * A workflow to delete a stack that performs the followuing actions:
   *  - checks stack exists
   *  - empties S3 buckets in stack
   *  - deletes the stack
   *  - waits for the stack to get into the 'stackDeleteComplete' state
   *
   * @param {string} stackName Stack name
   * @returns {Observable} An observable
   */
  static stackDeletionWorkflow (stackName) {
    return CloudFormationAccess.checkStackExists(stackName)
      .pipe(mergeMap(stackExists => {
        if (!stackExists) {
          APP_LOGGER.info(`Not deleting "${stackName}" stack because it does not exists`)
          this.logger.debug(`Not deleting "${stackName}" stack because it does not exists`)
          return of(undefined)
        } else {
          return AwsWorkflow.emptyStackBucketsWorkflow(stackName)
            .pipe(mergeMap(() => {
              return AwsWorkflow.emptyCognitoConfigsWorkflow(stackName)
            }))
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Deleting stack "${stackName}"`)
              return CloudFormationAccess.deleteCloudFormationStack(stackName)
            }))
            .pipe(mergeMap(() => {
              APP_LOGGER.info(`Waiting for stack "${stackName}" to be in state "stackDeleteComplete" (This can take a few minutes)`)
              return CloudFormationAccess.waitForStackState(stackName, 'stackDeleteComplete')
            }))
        }
      }))
  }

  /**
   * Delete all objects in stack:
   *  - get all S3 bucket names in stack
   *  - filter out buckets that do not exist
   *  - list all objects in buckets (parallelized)
   *  - delete all objects in the buckets (parallelized)
   *
   * @param {string} stackName Stack name
   * @returns {Observable} An observable
   */
  static emptyStackBucketsWorkflow (stackName) {
    APP_LOGGER.info(`Emptying buckets in stack "${stackName}"`)
    // Empty all buckets in the stack
    return CloudFormationAccess.getResourcesOfType(stackName, 'AWS::S3::Bucket')
      .pipe(map(resources => {
        return resources.map(r => r.PhysicalResourceId)
      }))
      .pipe(mergeMap(bucketNames => {
        const bucketExistsRequests = {}
        if (bucketNames.length === 0) {
          return of(bucketExistsRequests)
        }
        bucketNames.forEach(b => {
          bucketExistsRequests[b] = S3Access.checkIfBucketExists(b)
        })
        return forkJoin(bucketExistsRequests)
      }))
      .pipe(mergeMap(bucketExistsMap => {
        const emptyBucketRequests = {}
        Object.entries(bucketExistsMap).forEach((entry) => {
          const [bucketName, bucketExists] = entry
          if (bucketExists) {
            emptyBucketRequests[bucketName] = AwsWorkflow.emptyBucketWorkflow(bucketName)
          }
        })
        if (Util.isEmptyMap(emptyBucketRequests)) {
          return of(undefined)
        }
        return forkJoin(emptyBucketRequests)
      }))
      .pipe(map(() => undefined))
  }

  /**
   * Empty a bucket:
   *  - list objects in the bucket
   *  - delete the objects
   *
   * @param {string} bucketName Bucket name
   * @returns {Observable} An observable
   */
  static emptyBucketWorkflow (bucketName) {
    this.logger.info('Emptying bucket "' + bucketName + '"')
    return S3Access.listObjects(bucketName)
      .pipe(mergeMap(objects => {
        const objectKeys = objects.Contents.map(o => {
          return {
            Key: o.Key
          }
        })
        if (objectKeys.length === 0) {
          this.logger.info('Bucket "' + bucketName + '" is already empty')
          return of(undefined)
        } else {
          return S3Access.deleteObjects(bucketName, objectKeys)
        }
      }))
      .pipe(map(() => {
        this.logger.info('Done emptying bucket "' + bucketName + '"')
      }))
  }

  /**
   * Workflow to remove Cognito configs so that CloudFormation can delete a stack
   * containing AWS Cognito resources
   *
   * @param {string} stackName Stack name
   * @returns {Observable} An observable
   */
  static emptyCognitoConfigsWorkflow (stackName) {
    let userPoolId = null
    let domain = null
    if (LambdaStackWorkflow.getStackName() !== stackName) {
      this.logger.info('No need to empty cognito configs as this is not the lambda stack')
      return of(undefined)
    }
    APP_LOGGER.info(`Deleting AWS Cognito configs for "${stackName}"`)
    return CloudFormationAccess.describeStackResource(stackName, 'CognitoUserPool')
      .pipe(map(description => {
        userPoolId = description.StackResourceDetail.PhysicalResourceId
      }))
      .pipe(mergeMap(() => {
        return CognitoAccess.describeUserPool(userPoolId)
      }))
      .pipe(map((description) => {
        if (description && description.UserPool && description.UserPool.Domain) {
          domain = description.UserPool.Domain
          return true
        } else {
          return false
        }
      }))
      .pipe(mergeMap((exists) => {
        if (!exists) {
          return of(undefined)
        }
        return CognitoAccess.deleteUserPoolDomain(userPoolId, domain)
      }))
  }

  /**
   * Upload a directory and all its contents to S3
   *
   * @param {string} dir The absolute path of the local file to be uploaded
   * @param {string} targetBucketName The S3 bucket to upload contents to
   * @param {string|null} objectKeyPrefix The S3 key
   * @param {string} acl The ACL of the object (e.g. private)
   * @returns {Observable} An observable
   */
  static uploadDirectoryToS3 (dir, targetBucketName, objectKeyPrefix = null, acl = 'private') {
    const files = FilesystemAccess.listFiles(dir)
    const requests = {}
    files.forEach(f => {
      const absPath = FilesystemAccess.constructPath([dir, f])
      requests[absPath] = S3Access.uploadFile(absPath, targetBucketName, objectKeyPrefix ? objectKeyPrefix + '/' + f : f, acl)
    })
    return forkJoin(requests)
  }
}
