import { FilesystemAccess } from '../access/filesystem-access'
import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { S3Access } from '../access/aws/s3-access'
import { Util } from '../util/util'
import { ProjectConfigUtil } from '../util/project-config-util'
import { AwsWorkflow } from './aws-workflow'
import uuidv4 from 'uuid/v4'
import { APP_LOGGER } from '../infrastructure'

/**
 * Workflows relating to creating, updating, and deleting the Artifact CloudFormation stack
 *
 * This stack primarily consists of a single S3 bucket that hosts the web-player.js file for the skill.
 * It also hosts the lamda.zip file to be read by the skill lambda when the lambda is created using
 * CloudFormation in a later step.
 *
 */
export class ArtifactStackWorkflow {
  /**
   * Workflow to create the Artifact CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static runCreateWorkflow () {
    const parameters = this.getParameters()
    const templateFilePath = this.getTemplateFilePath()
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    return CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(mergeMap(stackExists => {
        if (!stackExists) {
          return AwsWorkflow.stackCreationWorkflow(artifactStackName, parameters, templateFilePath)
        } else {
          APP_LOGGER.info('Not creating the Artifact CloudFormation stack because it already exists')
          return of(undefined)
        }
      }))
  }

  /**
   * Workflow to update the Artifact CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static updateWorkflow () {
    const stackName = this.getStackName()
    const templateFilePath = this.getTemplateFilePath()
    let parameters = null
    return this.getArtifactBucketName()
      .pipe(mergeMap(artifactBucketName => {
        parameters = this.getParameters(artifactBucketName)
        return AwsWorkflow.stackUpdateWorkflow(stackName, parameters, templateFilePath)
      }))
  }

  /**
   * Workflow to delete the Artifact CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static deleteWorkflow () {
    const stackName = this.getStackName()
    return AwsWorkflow.stackDeletionWorkflow(stackName)
  }

  /**
   * Get the bucket name for the S3 bucket in the Artifact stack
   *
   * @returns {Observable<string>} Observable with the Artifact stack S3 bucket name
   */
  static getArtifactBucketName () {
    const stackName = this.getStackName()
    let bucketName = null
    return CloudFormationAccess.describeStackResource(stackName, 'ArtifactBucket')
      .pipe(map(resource => resource.StackResourceDetail.PhysicalResourceId))
      .pipe(mergeMap(b => {
        bucketName = b
        return S3Access.checkIfBucketExists(b)
      }))
      .pipe(map(bucketExists => {
        return bucketExists ? bucketName : Util.exitWithError('Bucket does not exists "' + bucketName + '"')
      }))
  }

  /**
   * Get the Artifact stack template file absolute path
   *
   * @returns {string} Absolute path to the Artifact stack template file
   */
  static getTemplateFilePath () {
    const cwd = FilesystemAccess.getCurrentWorkingDirectory()
    return FilesystemAccess.constructPath([cwd, 'cloud-formation-templates', 'template.artifact.json'])
  }

  /**
   * Get the Artifact stack name
   *
   * @returns {string} Artifact stack name
   */
  static getStackName () {
    return ProjectConfigUtil.getProjectName() + '-artifact-stack'
  }

  /**
   * Get parameters object for the CloudFormation stack template
   *
   * @param {string|null} artifactBucketName The name of the Artifact bucket
   * @returns {Array} Stack template parameters
   * @private
   */
  static getParameters (artifactBucketName = null) {
    return [{
      ParameterKey: 'ArtifactBucketName',
      ParameterValue: artifactBucketName || (ProjectConfigUtil.getProjectName() + '-' + uuidv4())
    }]
  }
}
