import { Util } from './util'
import commandLineUsage from 'command-line-usage'
import { version } from '../../package.json'
import * as log4js from 'log4js'
import { Observable } from 'rxjs'
import { exec } from 'child_process'
import _ from 'lodash'

/**
 * Utility class to configure command line arguments
 */
export class CliUtil {
  /**
   * Get top level option definitions (init, deploy, update, etc.)
   *
   * @returns {Array} Top level option definitions
   */
  static getMainOptionDefinitions () {
    return [
      {
        name: 'init',
        type: Boolean,
        description: 'Initialize the project'
      },
      {
        name: 'deploy',
        type: Boolean,
        description: 'Deploy the skill'
      },
      {
        name: 'update',
        type: Boolean,
        description: 'Update the web player or the lambda'
      },
      {
        name: 'delete',
        type: Boolean,
        description: 'Delete your skill'
      },
      {
        name: 'status',
        type: Boolean,
        description: 'Get the status of your deployed resources'
      },
      {
        name: 'skill',
        type: Boolean,
        description: 'Options for changing the behavior of a deployed skill'
      },
      {
        name: 'version',
        type: Boolean,
        description: 'Show the project version'
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide'
      }
    ]
  }

  /**
   * Get resource option definitions (lambda, etc.)
   *
   * @returns {Array} Resource option definitions
   */
  static getResourceOptionDefinitions () {
    return [
      {
        name: 'lambda',
        type: Boolean,
        description: 'Update only the lambda'
      },
      {
        name: 'web-player',
        type: Boolean,
        description: 'Update only the web-player'
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide.'
      }
    ]
  }

  /**
   * Get update resource option definitions for --update --lambda
   *
   * @returns {Array} Resource option definitions
   */
  static getSkillOptions () {
    return [
      {
        name: 'enable-web-player-logs',
        type: Boolean,
        description: 'Enable the web player to write it\'s logs to cloud watch logs'
      },
      {
        name: 'disable-web-player-logs',
        type: Boolean,
        description: 'Disable logging web player logs to cloud watch logs'
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide'
      }
    ]
  }

  /**
   * Handle displaying the help menu
   *
   * @param {object} descriptionHeader A header for the description
   * @param {object} optionDefinitions Option definitions
   */
  static handleHelpOption (descriptionHeader, optionDefinitions) {
    const usage = commandLineUsage([
      descriptionHeader,
      {
        header: 'Options',
        optionList: optionDefinitions
      }
    ])
    console.log(usage)
    Util.exitWithError()
  }

  /**
   * Handle displaying the version
   */
  static handleVersionOption () {
    console.info('Alexa Video Multi Modal Reference Software Helper')
    console.info('Version: ' + version)
    Util.exitWithError()
  }

  /**
   * Run a cli command
   * (e.g `ls -R`, or `npm run build`)
   *
   * @param {string} cmd Command to run
   * @param {string} logMsg Log message
   * @param {object} env Environment variables
   * @returns {Observable} An observable
   */
  static runCommand (cmd, logMsg, env = {}) {
    const logger = log4js.getLogger('cli-util')
    env = _.merge(process.env, env)
    return new Observable(observer => {
      logger.info('running ' + logMsg)
      logger.info('command: ' + cmd)
      const child = exec(cmd, { env })
      child.addListener('error', (err) => {
        logger.error('Error with ' + logMsg)
        Util.exitWithError(err)
      })
      child.addListener('exit', code => {
        if (code !== 0) {
          return Util.exitWithError('The ' + logMsg + ' process exited with a non-zero exit code.')
        }
        logger.info('Success with ' + logMsg)
        observer.next(true)
        observer.complete()
      })

      child.stdout.on('data', function (data) {
        console.log(data)
      })
      child.stderr.on('data', function (data) {
        console.error(data)
      })
    })
  }
}
