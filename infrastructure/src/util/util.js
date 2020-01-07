import * as log4js from 'log4js'
import prompts from 'prompts'
import { from, Observable } from 'rxjs'
import { catchError, map, timeout } from 'rxjs/operators'
import * as ramda from 'ramda'
import request from 'request'
import * as _ from 'lodash'
import wget from 'node-wget'
import { ProjectConfigUtil } from './project-config-util'
import { Constants } from './constants'

/**
 * Miscellaneous utility functions
 */
export class Util {
  /**
   * Exit the entire process with an error message
   *
   * @param {string|null} errorMsg Error message
   * @param {any} err An error
   */
  static exitWithError (errorMsg = null, err = null) {
    const logger = log4js.getLogger('util')
    if (errorMsg) {
      logger.error(errorMsg, err || '', (err && err['stack']) ? err['stack'] : '')
    }
    process.exit()
  }

  /**
   * Given a list of prompt configs, perform prompt and return observable with the response
   *
   * @param {object} promptList A map of prompt configurations
   * @returns {Observable<object>} User response
   */
  static doPrompt (promptList) {
    const onCancel = () => {
      Util.exitWithError()
    }
    const prompt = async () => {
      return prompts.prompt(promptList, { onCancel })
    }
    return from(prompt())
      .pipe(map(responses => {
        _.forEach(responses, (value, key) => {
          if (typeof value === 'string') {
            responses[key] = value.trim()
          } else {
            responses[key] = value
          }
        })
        return responses
      }))
  }

  /**
   * Perform a yes/no prompt with a custom prompt message
   *
   * @param {string} promptMessage Prompt message
   * @returns {Observable<object>} User response
   */
  static yesNoPrompt (promptMessage) {
    const yesNoPromp = {
      type: 'text',
      name: 'yesOrNo',
      message: promptMessage + ' (y/n)',
      validate: value => {
        if (value && (value.trim() === 'y' || value.trim() === 'n')) {
          return true
        } else {
          return 'Enter either \'y\' or \'n\' '
        }
      }
    }
    return this.doPrompt(yesNoPromp)
  }

  /**
   * Check is a string is empty
   *
   * @param {string} str String to test
   * @returns {boolean} True if empty string
   */
  static isNonBlankString (str) {
    return ramda.is(String, str) && !ramda.isEmpty(str)
  }

  /**
   * Check if a map is empty
   *
   * @param {object} o Map to test
   * @returns {boolean} True if empty map
   */
  static isEmptyMap (o) {
    return Object.keys(o).length === 0
  }

  /**
   * This is to help with unit tests since one cannot spy on an imported method without a root object
   *
   * @returns {request} A reference to the request function
   */
  static getRequestFunction () {
    return request
  }

  /**
   * Wrapper around request library to submit rest requests and return an observable
   *
   * @param {string} url Request URL
   * @param {object} headers Request headers
   * @param {string} method Request method
   * @param {object} json Request payload as JSON
   * @param {number} timeoutMs The timeout in milliseconds for the request
   * @returns {Observable<string>} Response body
   */
  static submitHttpRequest (url, headers, method = 'GET', json = null, timeoutMs = 20000) {
    const logger = log4js.getLogger('util')
    const options = {
      url: url,
      headers: headers,
      method: method
    }
    if (json) {
      options['json'] = json
    }
    return new Observable(observer => {
      this.getRequestFunction()(options, (err, res, body) => {
        if (err) {
          return Util.exitWithError('There was an error with the request to url "' + url + '"', err)
        }
        observer.next(body)
        observer.complete()
      })
    })
      .pipe(
        timeout(timeoutMs)
      )
      .pipe(
        catchError(err => {
          logger.error(`Error with rest request to this url: ${url}`, err)
          return Util.exitWithError(`There was an error executing the rest call to ${url}: ${err}`)
        })
      )
  }

  /**
   * Perform a wget request to download content using a HTTP request
   *
   * @param {string} url The source URL of the content
   * @param {string} dest The absolute path where the downloaded content should be saved
   * @returns {Observable<undefined>} An empty promise
   */
  static wget (url, dest) {
    const logger = log4js.getLogger('util')
    return new Observable(observer => {
      logger.info(`wget: downloading ${url} to ${dest}`)
      const start = new Date()
      wget({ url: url, dest: dest }, (error, response) => {
        if (error) {
          this.logger.error(`There was an error downloading ${url} to ${dest}`, error)
          observer.error(error)
        } else {
          const end = new Date()
          const duration = end.getTime() - start.getTime()
          logger.info(`wget: finished downloading ${url} to ${dest} (duration: ${duration} ms)`)
          observer.next(undefined)
          observer.complete()
        }
      })
    })
  }

  /**
   * Get the region to which the AWS resources should be deployed, given a distribution country
   *
   * @return {string} the AWS region
   */
  static getAwsDeploymentRegion () {
    const distributionCountry = ProjectConfigUtil.getCountry()
    return Constants.COUNTRY_TO_REALM_MAP[distributionCountry]
  }
}
