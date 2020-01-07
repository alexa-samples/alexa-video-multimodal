import * as log4js from 'log4js'
import { CliUtil } from '../util/cli-util'
import commandLineArgs from 'command-line-args'
import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import { map, mergeMap } from 'rxjs/operators'
import { Util } from '../util/util'
import { ArtifactStackWorkflow } from './artifact-stack-workflow'
import { LambdaStackWorkflow } from './lambda-stack-workflow'
import { LambdaAccess } from '../access/aws/lambda-access'
import { Constants } from '../util/constants'
import { APP_LOGGER } from '../infrastructure'
import { AccountWorkflow } from './account-workflow'
import { DeployWorkflow } from './deploy-workflow'

/**
 * Workflows relating to a deployed skill
 *
 */
export class SkillWorkflow {
  static get logger () {
    return log4js.getLogger('web-player-workflow')
  }

  /**
   * Parse command line args and take appropriate action
   *
   * @param {Array} argv The cli args
   * @returns {Observable} An observable
   */
  static run (argv) {
    const optionDefinitions = CliUtil.getSkillOptions()

    const options = commandLineArgs(optionDefinitions, { argv: argv })
    if (options['enable-web-player-logs']) {
      return AccountWorkflow.initializeIfNeededWorkflow(true)
        .pipe(mergeMap(() => this.toggleCloudWatchLogs(true)))
        .pipe(mergeMap(() => DeployWorkflow.getStackStatusTable()))
    } else if (options['disable-web-player-logs']) {
      return AccountWorkflow.initializeIfNeededWorkflow(true)
        .pipe(mergeMap(() => this.toggleCloudWatchLogs(false)))
        .pipe(mergeMap(() => DeployWorkflow.getStackStatusTable()))
    } else {
      const descriptionHeader = {
        header: 'Manage a deployed web player',
        content: 'Enable or disable cloud watch logs for a deployed web player'
      }
      CliUtil.handleHelpOption(descriptionHeader, optionDefinitions)
    }
  }

  /**
   * Toggle the environment variable for the lambda which will inform the web web-player if it should write its logs
   * to CloudWatch logs.
   *
   * @param {boolean} enable True to enable logging to CloudWatch logs
   * @returns {Observable} An observable
   */
  static toggleCloudWatchLogs (enable) {
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    const lambdaStackName = LambdaStackWorkflow.getStackName()
    let lambdaFunctionName = null
    return CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(map(exists => {
        if (!exists) {
          Util.exitWithError('The Artifact stack does not exist. Cannot deploy the lambda.')
        }
      }))
      .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(lambdaStackName)))
      .pipe(map(exists => {
        if (!exists) {
          Util.exitWithError('The Lambda stack does not exist. Cannot update the lambda.')
        }
      }))
      .pipe(mergeMap(() => {
        return LambdaStackWorkflow.getLambdaFunctionName()
      }))
      .pipe(map((name) => {
        lambdaFunctionName = name
        SkillWorkflow.logger.info('Using this lambda function name "' + lambdaFunctionName + '"')
      }))
      .pipe(mergeMap(() => {
        APP_LOGGER.info((enable ? 'Enabling' : 'Disabling') + ` web player cloud watch logging`)
        const env = {}
        env[Constants.ENABLE_WEB_PLAYER_LOGGING] = enable + ''
        return LambdaAccess.updateLambdaEnvironmentVariables(lambdaFunctionName, env)
      }))
  }
}
