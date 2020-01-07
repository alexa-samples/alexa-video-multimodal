import * as log4js from 'log4js'
import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ArtifactStackWorkflow } from './artifact-stack-workflow'
import { S3Access } from '../access/aws/s3-access'
import { AwsWorkflow } from './aws-workflow'
import { LambdaStackWorkflow } from './lambda-stack-workflow'
import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import AsciiTable from 'ascii-table'
import { Util } from '../util/util'
import { APP_LOGGER } from '../infrastructure'
import { AccountWorkflow } from './account-workflow'
import { BuildWorkflow } from './build-workflow'
import * as path from 'path'
import { LambdaAccess } from '../access/aws/lambda-access'
import { CliUtil } from '../util/cli-util'
import commandLineArgs from 'command-line-args'
import { MigrateContentWorkflow } from './migrate-content-workflow'
import { ProjectConfigUtil } from '../util/project-config-util'

/**
 * Workflow definitions for deploying the multi modal skill
 */
export class DeployWorkflow {
  /**
   * Create a string with an ASCII table that describes all the deployed cloud resources
   *
   * @returns {Observable<string>} Observable with the ASCII table as a string
   */
  static getStackStatusTable () {
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    const lambdaStackName = LambdaStackWorkflow.getStackName()

    let output = ''
    let artifactStackDescription = null
    let artifactBucketName = null
    let skillId = null
    return AccountWorkflow.initializeIfNeededWorkflow(false)
      .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(artifactStackName)))
      .pipe(mergeMap(stackExists => stackExists ? CloudFormationAccess.describeStackResources(artifactStackName) : of(null)))
      .pipe(map(description => {
        artifactStackDescription = description
      }))
      .pipe(mergeMap(() => artifactStackDescription ? ArtifactStackWorkflow.getArtifactBucketName() : of(null)))
      .pipe(map(bucketName => {
        artifactBucketName = bucketName
      }))
      .pipe(mergeMap(() => artifactStackDescription ? LambdaStackWorkflow.getSkillId(artifactBucketName) : of(null)))
      .pipe(map(id => {
        skillId = id
      }))
      .pipe(map(() => {
        if (artifactStackDescription) {
          const headerTable = new AsciiTable('Overview')
          headerTable.addRow('Project Name', ProjectConfigUtil.getProjectName())
          headerTable.addRow('Skill Name', ProjectConfigUtil.getSkillName())
          headerTable.addRow('Skill Id', skillId)
          headerTable.addRow('AWS Region Containing AWS Resources', Util.getAwsDeploymentRegion())

          const table = new AsciiTable(artifactStackName)
          table.setHeading('Resource Type', 'Resource Id', 'Resource Status')
          artifactStackDescription.StackResources.forEach(stackResource => {
            table.addRow(
              stackResource.ResourceType,
              stackResource.PhysicalResourceId,
              stackResource.ResourceStatus
            )
          })
          output += '\n' + headerTable.toString()
          output += '\n' + table.toString()
        } else {
          output += '\nStack ' + artifactStackName + ' does not exist'
        }
      }))
      .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(lambdaStackName)))
      .pipe(mergeMap(stackExists => stackExists ? CloudFormationAccess.describeStackResources(lambdaStackName) : of(null)))
      .pipe(map(description => {
        if (description) {
          const table = new AsciiTable(lambdaStackName)
          table.setHeading('Resource Type', 'Resource Id', 'Resource Status')
          description.StackResources.forEach((stackResource) => {
            table.addRow(
              stackResource.ResourceType,
              stackResource.PhysicalResourceId,
              stackResource.ResourceStatus
            )
          })
          output += '\n' + table.toString()
        } else {
          output += '\nStack ' + lambdaStackName + ' does not exist\n'
        }
        return output
      }))
  }

  /**
   * Build the entire skill:
   *   * Update the Login with Amazon credentials if they've expired
   *   * Create an S3 bucket (Artifact bucket)
   *   * Start copying demo content to the Artifact bucket asychronously
   *   * Build the lambda and web player, and then upload them to the Artifact bucket
   *   * Create the AWS Lambda, Multimodal SKill, and AWS Cognito resources
   *   * Wait for the demo content to finish copying if it's still copying
   *
   * @returns {Observable} An observable
   */
  static runDeployWorkflow () {
    APP_LOGGER.info('Creating the Alexa Multimodal Skill')
    return AccountWorkflow.initializeIfNeededWorkflow(false)
      .pipe(mergeMap(() => DeployWorkflow.isDeployRerun()))
      .pipe(mergeMap(() => ArtifactStackWorkflow.runCreateWorkflow()))
      .pipe(mergeMap(() => MigrateContentWorkflow.runMigrateContentWorkflow()))
      .pipe(mergeMap(() => DeployWorkflow.runDeployLambdaCodeWorkflow(false)))
      .pipe(mergeMap(() => DeployWorkflow.runDeployWebPlayerCodeWorkflow()))
      .pipe(mergeMap(() => LambdaStackWorkflow.runCreateWorkflow()))
      .pipe(mergeMap(() => MigrateContentWorkflow.waitForVideoContentSync()))
      .pipe(mergeMap(() => DeployWorkflow.getStackStatusTable()))
  }

  /**
   * Update resource workflows (lambda or web player)
   *
   * @param {Array} argv A list of arguments passed in by the command line for updating resources valid values are --lambda and --web-player. All other values will trigger the help message.
   * @returns {Observable<any>} An observable
   */
  static runUpdateResourceWorkflow (argv) {
    const optionDefinitions = CliUtil.getResourceOptionDefinitions()

    const options = commandLineArgs(optionDefinitions, { argv: argv })
    if (options['lambda']) {
      const areYouSureMessage = 'Are you sure you want to update the lambda? This will affect your existing skill.'
      return Util.yesNoPrompt(areYouSureMessage)
        .pipe(map((response) => {
          return response.yesOrNo === 'n'
        }))
        .pipe(mergeMap(declined => {
          if (declined) {
            return Util.exitWithError()
          } else {
            return AccountWorkflow.initializeIfNeededWorkflow(false)
              .pipe(mergeMap(() => DeployWorkflow.runDeployLambdaCodeWorkflow(true)))
              .pipe(mergeMap(() => DeployWorkflow.getStackStatusTable()))
          }
        }))
    } else if (options['web-player']) {
      const areYouSureMessage = 'Are you sure you want to update the web player? This will affect your existing skill.'
      return Util.yesNoPrompt(areYouSureMessage)
        .pipe(map((response) => {
          return response.yesOrNo === 'n'
        }))
        .pipe(mergeMap(declined => {
          if (declined) {
            return Util.exitWithError()
          } else {
            return AccountWorkflow.initializeIfNeededWorkflow(false)
              .pipe(mergeMap(() => DeployWorkflow.runDeployWebPlayerCodeWorkflow()))
              .pipe(mergeMap(() => DeployWorkflow.getStackStatusTable()))
          }
        }))
    } else {
      const descriptionHeader = {
        header: 'Update either the web player or the lambda',
        content: 'This will update the web player on S3 or the source code of the AWS Lambda for your skill'
      }
      CliUtil.handleHelpOption(descriptionHeader, optionDefinitions)
    }
  }

  /**
   * Build the web player and upload it to S3
   *
   * @returns {Observable} An observable
   */
  static runDeployWebPlayerCodeWorkflow () {
    let artifactBucketName = null
    let localWebPlayerAbsolutePath = null
    const artifactStackName = ArtifactStackWorkflow.getStackName()

    return CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(map(exists => {
        if (!exists) {
          return Util.exitWithError('The artifact stack does not exist. Cannot deploy the web player')
        }
      }))
      .pipe(mergeMap(() => ArtifactStackWorkflow.getArtifactBucketName()))
      .pipe(map((b) => {
        artifactBucketName = b
        DeployWorkflow.logger.info('Using this web player S3 bucket "' + artifactBucketName + '"')
      }))
      .pipe(mergeMap(() => BuildWorkflow.runBuildWebPlayerWorkflow()))
      .pipe(map(p => {
        localWebPlayerAbsolutePath = p
      }))
      .pipe(mergeMap(() => {
        APP_LOGGER.info(`Uploading the web player to the artifact S3 bucket ${artifactBucketName}`)
        return AwsWorkflow.uploadDirectoryToS3(localWebPlayerAbsolutePath, artifactBucketName, 'web-player', 'public-read')
      }))
  }

  /**
   * Build the lambda and upload it to S3. Update the AWS lambda to use the updated source code.
   *
   * @param {boolean} updateExistingSkill Set to `true` to update the lambda for an existing skill, otherwise just upload the code to S3 for a yet to be created skill
   * @returns {Observable} An observable
   */
  static runDeployLambdaCodeWorkflow (updateExistingSkill) {
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    let artifactBucketName = null
    let localLambdaAbsolutePath = null
    let lambdaFunctionName = null
    let lambdaS3Path = null

    let result = CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(map(exists => {
        if (!exists) {
          Util.exitWithError('The artifact stack does not exist.  Cannot deploy the lambda')
        }
      }))
      .pipe(mergeMap(() => {
        return ArtifactStackWorkflow.getArtifactBucketName()
      }))
      .pipe(map((b) => {
        artifactBucketName = b
        DeployWorkflow.logger.info('Using this artifact s3 bucket "' + artifactBucketName + '"')
      }))
      .pipe(mergeMap(() => BuildWorkflow.runBuildLambdaWorkflow()))
      .pipe(map(p => {
        localLambdaAbsolutePath = p
      }))
      .pipe(mergeMap(() => {
        APP_LOGGER.info(`Uploading the Lambda to the artifact S3 bucket ${artifactBucketName}`)
        const lambdaFileName = path.basename(localLambdaAbsolutePath)
        lambdaS3Path = 'lambda/' + lambdaFileName
        return S3Access.uploadFile(localLambdaAbsolutePath, artifactBucketName, lambdaS3Path)
      }))
    if (updateExistingSkill) {
      const lambdaStackName = LambdaStackWorkflow.getStackName()
      result = result
        .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(lambdaStackName)))
        .pipe(map(exists => {
          if (!exists) {
            Util.exitWithError('The lambda stack does not exist.  Cannot update the lambda')
          }
        }))
        .pipe(mergeMap(() => {
          return LambdaStackWorkflow.getLambdaFunctionName()
        }))
        .pipe(map((name) => {
          lambdaFunctionName = name
          DeployWorkflow.logger.info('Using this lambda function name "' + lambdaFunctionName + '"')
        }))
        .pipe(mergeMap(() => {
          APP_LOGGER.info(`Updating the lambda function code for lambda function ${lambdaFunctionName}`)
          return LambdaAccess.updateFunctionCode(lambdaFunctionName, artifactBucketName, lambdaS3Path)
        }))
    }

    return result
  }

  static get logger () {
    return log4js.getLogger('deploy-workflow')
  }

  /**
   * Check if any of the resources that the --deploy command would create already exists. If it does, then fail with a meaningful error message.
   *
   * @returns {Observable<undefined>} An observable
   */
  static isDeployRerun () {
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    const lambdaStackName = LambdaStackWorkflow.getStackName()
    let artifactBucketName = null
    let artifactStackExists = false
    let lambdaStackExists = false
    let skillExists = false

    return CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(map(exists => {
        artifactStackExists = exists
      }))
      .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(lambdaStackName)))
      .pipe(map(exists => {
        lambdaStackExists = exists
      }))
      .pipe(mergeMap(() => {
        if (artifactStackExists) {
          return ArtifactStackWorkflow.getArtifactBucketName()
            .pipe(map(b => {
              artifactBucketName = b
            }))
            .pipe(mergeMap(() => LambdaStackWorkflow.getSkillId(artifactBucketName)))
            .pipe(map(id => {
              skillExists = id !== null
            }))
        } else {
          return of(undefined)
        }
      }))
      .pipe(map(() => {
        if (!artifactStackExists && !lambdaStackExists && !skillExists) {
          // proceed - this is a fresh deploy
          return null
        } else if (artifactStackExists && lambdaStackExists && skillExists) {
          // deployment already occurred
          return Util.exitWithError('A skill with this project name has already been deployed. ' +
            'You can run the --deploy command only once when setting up a new skill. ' +
            'If you just want to update the lambda or the web player you can run the --update --lambda or --update --web-player commands. ' +
            'Alternatively, you can create a new skill by running the --init command and reconfiguring the project with a different name ' +
            'and then run the --deploy command. Lastly you can run the --delete command to completely delete your skill and its resources and then run --deploy again.')
        } else {
          // deployment occurred but it was successfull or it's be altered.
          return Util.exitWithError('A skill with this project name has already partially deployed. ' +
            'Perhaps there was a failure in the initial deployment or the skill has been altered outside of this cli tool and is no longer compatible with this cli tool. ' +
            'To recover from this you can create a new skill by running the --init command and reconfiguring the project with a different name, ' +
            'and then you can run the --deploy command. Alternatively, you can run the --delete command to completely delete your skill and its resources and then run --deploy again.')
        }
      }))
  }
}
