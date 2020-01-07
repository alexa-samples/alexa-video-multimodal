import * as log4js from 'log4js'
import { CliUtil } from './util/cli-util'
import commandLineArgs from 'command-line-args'
import { AccountWorkflow } from './workflows/account-workflow'
import { DeployWorkflow } from './workflows/deploy-workflow'
import { DeleteWorkflow } from './workflows/delete-workflow'
import { SkillWorkflow } from './workflows/skill-workflow'

export const APP_LOGGER = log4js.getLogger('app')

/**
 * The main runner class for the project
 */
export class Infrastructure {
  /**
   * Run the CLI tool. Parse the arguments and configure the proper workflow.
   *
   * @param {Array} argv arguments passed through the command line
   */
  static run (argv) {
    // Workflows are chains of rxjs observables. The last observable for any workflow is saved in this variable.
    let finalObservable = null

    Infrastructure.logger.info('Parse the CLI args')
    const optionDefinitions = CliUtil.getMainOptionDefinitions()
    const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true, argv: argv })
    argv = options._unknown || []
    if (options.init) { // top level init option
      finalObservable = AccountWorkflow.runInitializeWorkflow()
    } else if (options.update) { // top level update option
      finalObservable = DeployWorkflow.runUpdateResourceWorkflow(argv)
    } else if (options.delete) { // top level delete option
      finalObservable = DeleteWorkflow.runDeleteResourcesWorkflow()
    } else if (options.status) { // top level status option
      finalObservable = DeployWorkflow.getStackStatusTable()
    } else if (options.deploy) { // top level deploy option
      finalObservable = DeployWorkflow.runDeployWorkflow()
    } else if (options.skill) { // top level skill option
      finalObservable = SkillWorkflow.run(argv)
    } else if (options.version) { // top level version option
      CliUtil.handleVersionOption()
    } else { // default to help option
      const descriptionHeader = {
        header: 'Alexa Video Multi Modal Reference Software Helper',
        content: 'This cli tool is meant to help build and deploy an Alexa Multi Modal skill with a web player and lambda.'
      }
      CliUtil.handleHelpOption(descriptionHeader, optionDefinitions)
    }

    // execute the workflow
    if (finalObservable !== null) {
      finalObservable.subscribe((result) => {
        console.log(result)
        console.log('Complete.')
      })
    }
  }

  static get logger () {
    return log4js.getLogger('infrastructure')
  }
}
