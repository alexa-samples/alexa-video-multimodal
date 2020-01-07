import * as log4js from 'log4js'
import { ProjectConfigWorkflow } from './project-config-workflow'
import { mergeMap } from 'rxjs/operators'
import { AwsAccountWorkflow } from './aws-account-workflow'
import { AskAccountWorkflow } from './ask-account-workflow'
import { of } from 'rxjs'

/**
 * Utility class for account related workflows
 */
export class AccountWorkflow {
  /**
   * Initialize the entire project with prompts for project name, AWS credentials, etc.
   *
   * @returns {Observable<any>} An observable
   */
  static runInitializeWorkflow () {
    return ProjectConfigWorkflow.initialize()
      .pipe(mergeMap(() => AwsAccountWorkflow.initialize()))
      .pipe(mergeMap(() => AskAccountWorkflow.initialize()))
  }

  /**
   * Prompts for user AWS credentials, project configs, and ASK configs only if needed
   *
   * @param {boolean} skipAskInitialization Do not go through the ASK config initialization
   * @returns {Observable} An observable
   *
   */
  static initializeIfNeededWorkflow (skipAskInitialization = false) {
    return ProjectConfigWorkflow.initializeIfNeeded()
      .pipe(mergeMap(() => AwsAccountWorkflow.initializeIfNeeded()))
      .pipe(mergeMap(() => {
        if (skipAskInitialization) {
          this.logger.info('Skipping ASK config initialization as it is not needed for this workflow')
          return of(undefined)
        }
        return AskAccountWorkflow.initializeIfNeeded()
      }))
  }

  static get logger () {
    return log4js.getLogger('aws-workflow')
  }
}
