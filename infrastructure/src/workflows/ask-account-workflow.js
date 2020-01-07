import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import * as log4js from 'log4js'
import { AskAccountUtil } from '../util/alexa/ask-account-util'
import { ProjectConfigUtil } from '../util/project-config-util'

/**
 * ASK account workflow definitions
 */
export class AskAccountWorkflow {
  static get logger () {
    return log4js.getLogger('ask-account-workflow')
  }

  /**
   * Run the ASK account initialization workflow
   *
   * @returns {Observable} An observable
   */
  static initialize () {
    this.logger.info('Prompt for ask configs')
    const clientId = ProjectConfigUtil.getAskSecurityProfileClientId()
    const clientSecret = ProjectConfigUtil.getAskSecurityProfileClientSecret()
    return AskAccountUtil.promptForAskCredentials(clientId, clientSecret)
      .pipe(map(askConfigs => {
        this.logger.info('Save the ask configs')
        askConfigs = AskAccountUtil.persistAskConfigs(askConfigs)
        this.logger.info('Validate the ask configs')
        return AskAccountUtil.tokenIsValid(askConfigs.expiresAt)
      }))
      .pipe(mergeMap(validCredentials => {
        if (validCredentials) {
          this.logger.info('Credentials are valid')
          return of(undefined)
        } else {
          this.logger.error('Ask credentials were invalid, please re-enter them')
          return this.initialize()
        }
      }))
  }

  /**
   * Run the ASK setup steps only if required
   *
   * @returns {Observable} An observable
   */
  static initializeIfNeeded () {
    const isRequired = AskAccountUtil.requiresAskCredentialsPrompt()
    if (isRequired) {
      return this.initialize()
    } else {
      this.logger.info('Using existing ask credentials')
      return of(undefined)
    }
  }
}
