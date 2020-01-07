import * as log4js from 'log4js'
import { mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ProjectConfigUtil } from '../util/project-config-util'

/**
 * Project config workflow definitions
 */
export class ProjectConfigWorkflow {
  static get logger () {
    return log4js.getLogger('project-config-workflow')
  }

  /**
   * Prompt for project configs like projectName, git repo path, etc.
   *
   * @returns {Observable} An observable
   */
  static initialize () {
    this.logger.info('Starting initialize project config workflow')
    return ProjectConfigUtil.promptForProjectConfigs()
      .pipe(mergeMap(projectConfigs => {
        this.logger.info('Save the project configs')
        ProjectConfigUtil.persistProjectConfig(projectConfigs)
        this.logger.info('Validate the aws configs')
        return ProjectConfigUtil.validateProjectConfig()
      }))
      .pipe(mergeMap(validConfig => {
        if (validConfig) {
          this.logger.info('Configs are valid')
          this.logger.info('Project config workflow is complete')
          return of(undefined)
        } else {
          this.logger.error('Config is invalid, please re-enter them')
          return this.initialize()
        }
      }))
  }

  /**
   * Run the project setup steps only if required
   *
   * @returns {Observable} An observable
   */
  static initializeIfNeeded () {
    this.logger.info('Starting initialize project config workflow if needed')
    return ProjectConfigUtil.requiresProjectConfigPrompts()
      .pipe(mergeMap(isRequired => {
        if (isRequired) {
          return this.initialize()
        } else {
          this.logger.info('Using existing project configs with project name "' + ProjectConfigUtil.getProjectName() + '"')
          this.logger.info('Initialize projects configs workflow if needed complete')
          return of(undefined)
        }
      }))
  }
}
