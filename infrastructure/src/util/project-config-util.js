import { FilesystemAccess } from '../access/filesystem-access'
import * as log4js from 'log4js'
import { Util } from './util'
import path from 'path'
import { of } from 'rxjs'
import { map } from 'rxjs/operators'
import { Constants } from './constants'
import forEach from 'lodash/forEach'
import findIndex from 'lodash/findIndex'
import sortBy from 'lodash/sortBy'
import includes from 'lodash/includes'

/**
 * Project configuration utility functions
 */
export class ProjectConfigUtil {
  static get logger () {
    return log4js.getLogger('project-config-util')
  }

  /**
   * Reads .project-config.json from disk
   *
   * @returns {{}} Project config
   */
  static readProjectConfig () {
    let projectConfig = {
      projectName: null,
      projectRoot: null,
      country: null,
      locales: [],
      askSecurityProfileClientId: null,
      askSecurityProfileClientSecret: null,
      skillName: null

    }
    this.logger.debug('Read the ./.project-config.json file')
    if (this._hasProjectConfigFile()) {
      projectConfig = FilesystemAccess.readJsonFile(this._getProjectConfigFileName())
    }
    return projectConfig
  }

  /**
   * Write the project configs to disk
   *
   * @param {object} projectConfig Project config
   * @returns {object} Project Config
   */
  static persistProjectConfig (projectConfig) {
    this.logger.debug('Ensure ~/.project-config.json exists')
    if (!this._hasProjectConfigFile()) {
      FilesystemAccess.touch(this._getProjectConfigFileName())
    }
    this.logger.debug('Write the .project-config.json file')
    FilesystemAccess.writeJsonFile(this._getProjectConfigFileName(), projectConfig)
    FilesystemAccess.chmod(this._getProjectConfigFileName(), 0o600)

    return projectConfig
  }

  /**
   * Prompt for project configs - projectName,  Git repo directory, etc.
   *
   * @returns {Observable<object>} The user response
   */
  static promptForProjectConfigs () {
    const projectConfig = this.getProjectConfig()
    const projectNamePrompt = {
      type: 'text',
      name: 'projectName',
      message: 'Please enter a project name',
      validate: value => {
        const regExp = new RegExp(/^[a-z][a-z0-9\\-]+$/)
        if (!regExp.test(value)) {
          return 'Project name must be at least 2 characters, start with a letter, and contain only lower case letters, numbers, and hyphens'
        } else {
          return true
        }
      },
      initial: projectConfig.projectName ? projectConfig.projectName : ''
    }

    const skillNamePrompt = {
      type: 'text',
      name: 'skillName',
      message: 'Please enter a skill name',
      validate: value => {
        if (value.trim() === '') {
          return 'You must specify a skill name'
        } else if (value.length >= 150) {
          return 'Skill names must be fewer than 150 characters'
        } else {
          return true
        }
      },
      initial: projectConfig.skillName ? projectConfig.skillName : ''
    }
    let countries = []
    forEach(Constants.SUPPORTED_COUNTRIES, (value, key) => {
      countries.push({
        title: value,
        value: key
      })
    })
    countries = sortBy(countries, c => c.title)
    const defaultCountryValue = projectConfig.country || 'US'
    const defaultCountyIndex = findIndex(countries, c => {
      return c.value === defaultCountryValue
    })
    const countryPrompt = {
      type: 'select',
      name: 'country',
      message: 'Pick a distribution country for your skill',
      choices: countries,
      initial: defaultCountyIndex,
      optionsPerPage: 100
    }

    let locales = []
    const defaultLocales = projectConfig.locales && projectConfig.locales.length > 0 ? projectConfig.locales : ['en-US']
    forEach(Constants.SUPPORTED_LOCALES, (value, key) => {
      const selected = includes(defaultLocales, key)
      locales.push({
        title: value,
        value: key,
        selected: selected

      })
    })
    locales = sortBy(locales, c => c.title)

    const localePrompt = {
      type: 'multiselect',
      name: 'locales',
      message: 'Select locales for your skill',
      choices: locales,
      min: 1,
      hint: '- Space to select / Return to submit',
      optionsPerPage: 100
    }

    const p = FilesystemAccess.constructPath([FilesystemAccess.getCurrentWorkingDirectory()])
    const parts = p.split(path.sep)
    parts.pop()
    const defaultProjectRoot = FilesystemAccess.constructPath(parts)
    const projectRootPrompt = {
      type: 'text',
      name: 'projectRoot',
      message: 'Enter the path to project root',
      initial: projectConfig.projectRoot ? projectConfig.projectRoot : defaultProjectRoot
    }

    const askSecurityProfileClientId = {
      type: 'text',
      name: 'askSecurityProfileClientId',
      message: 'Enter your ASK security profile client id',
      initial: projectConfig.askSecurityProfileClientId ? projectConfig.askSecurityProfileClientId : '',
      validate: value => value && value.trim().length > 0 ? true : 'You must specify a value'
    }

    const askSecurityProfileClientSecret = {
      type: 'password',
      name: 'askSecurityProfileClientSecret',
      message: 'Enter your ASK security profile client secret',
      initial: projectConfig.askSecurityProfileClientSecret ? projectConfig.askSecurityProfileClientSecret : '',
      validate: value => value && value.trim().length > 0 ? true : 'You must specify a value'
    }
    const promptList = [
      projectNamePrompt,
      skillNamePrompt,
      countryPrompt,
      localePrompt,
      projectRootPrompt,
      askSecurityProfileClientId,
      askSecurityProfileClientSecret
    ]
    return Util.doPrompt(promptList)
  }

  /**
   * Check whether the project configs are set up
   *
   * @returns {Observable<boolean>} True if required
   */
  static requiresProjectConfigPrompts () {
    const projectConfigs = this.readProjectConfig()
    if (
      !projectConfigs.projectName ||
      !projectConfigs.projectRoot ||
      !projectConfigs.country ||
      !projectConfigs.locales ||
      projectConfigs.locales.length === 0 ||
      !projectConfigs.askSecurityProfileClientId ||
      !projectConfigs.askSecurityProfileClientSecret ||
      !projectConfigs.skillName
    ) {
      return of(true)
    }
    return this.validateProjectConfig()
      .pipe(map(isValid => {
        return !isValid
      }))
  }

  /**
   * Validate project-config.json
   *
   * @returns {Observable<boolean>} True if valid
   */
  static validateProjectConfig () {
    // TODO: validate project config
    return of(true)
  }

  /**
   * Getter for the project name
   *
   * @returns {string} Project name
   */
  static getProjectName () {
    return ProjectConfigUtil.readProjectConfig().projectName
  }

  /**
   * Getter for the project root
   *
   * @returns {string} Project root
   */
  static getProjectRoot () {
    return ProjectConfigUtil.readProjectConfig().projectRoot
  }

  /**
   * Getter for the ASK security profile client Id
   *
   * @returns {string} ASK security profile client Id
   */
  static getAskSecurityProfileClientId () {
    return ProjectConfigUtil.readProjectConfig().askSecurityProfileClientId
  }

  /**
   * Getter for the ASK security profile client secret
   *
   * @returns {string} ASK security profile client secret
   */
  static getAskSecurityProfileClientSecret () {
    return ProjectConfigUtil.readProjectConfig().askSecurityProfileClientSecret
  }

  /**
   * Getter for the skill name
   *
   * @returns {string} Skill name
   */
  static getSkillName () {
    return ProjectConfigUtil.readProjectConfig().skillName
  }

  /**
   * Getter for the skill distribution country
   *
   * @returns {string} Skill name
   */
  static getCountry () {
    return ProjectConfigUtil.readProjectConfig().country
  }

  /**
   * Getter for the skill locales
   *
   * @returns {Array} A list of locales
   */
  static getLocales () {
    return ProjectConfigUtil.readProjectConfig().locales || []
  }

  /**
   * Getter the project config
   *
   * @returns {object} Project config
   */
  static getProjectConfig () {
    return ProjectConfigUtil.readProjectConfig()
  }

  /**
   * Check if ./.project-config.json file exists
   *
   * @returns {boolean} True if exists
   * @private
   */
  static _hasProjectConfigFile () {
    return FilesystemAccess.checkIfFileOrDirectoryExists(this._getProjectConfigFileName())
  }

  /**
   * Return ./.project-config.json
   *
   * @returns {string} The absolute path to the project config file
   * @private
   */
  static _getProjectConfigFileName () {
    return FilesystemAccess.constructPath([FilesystemAccess.getCurrentWorkingDirectory(), '.project-config.json'])
  }
}
