import { Util } from '../../util/util'
import { filter, map, mergeMap, take } from 'rxjs/operators'
import * as log4js from 'log4js'
import { timer } from 'rxjs'

/**
 * SMAPI access functions
 */
export class SmapiAccess {
  /**
   * Configure the skill for account linking
   *
   * @param {string} skillId  Skill Id
   * @param {string} skillStage Skill stage
   * @param {string} authorizationUri Authorization URI
   * @param {string} accessTokenUri Access token URI
   * @param {string} clientId Client Id
   * @param {string} clientSecret Client secret
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<string>} An observable
   */
  static configureSkillAccountLinking (skillId, skillStage, authorizationUri, accessTokenUri, clientId, clientSecret, accessToken) {
    const payload = {
      accountLinkingRequest: {
        skipOnEnablement: 'true',
        type: 'AUTH_CODE',
        authorizationUrl: authorizationUri,
        domains: [],
        clientId: clientId,
        scopes: [
          'phone', 'email', 'openid', 'aws.cognito.signin.user.admin', 'profile'
        ],
        accessTokenUrl: accessTokenUri,
        clientSecret: clientSecret,
        accessTokenScheme: 'HTTP_BASIC',
        defaultTokenExpirationInSeconds: 20
      }
    }

    const url = 'https://api.amazonalexa.com/v1/skills/' + skillId + '/stages/' + skillStage + '/accountLinkingClient'
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }

    return Util.submitHttpRequest(url, headers, 'PUT', payload)
  }

  /**
   * Get the stage of a skill
   *
   * @param {string} vendorId Vendor Id
   * @param {string} skillId Skill Id
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<any>} An observable
   */
  static getSkillStage (vendorId, skillId, accessToken) {
    const url = 'https://api.amazonalexa.com/v1/skills?vendorId=' + vendorId + '&skillId=' + skillId
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }

    return Util.submitHttpRequest(url, headers, 'GET')
      .pipe(map(body => {
        try {
          const response = JSON.parse(body)
          if (response.skills && response.skills.length === 1) {
            const skill = response.skills[0]
            return skill.stage
          } else {
            Util.exitWithError('There was an error getting the skill stage -skill not found for skill id "' + skillId + '"')
          }
        } catch (e) {
          Util.exitWithError('There was an error getting the skill stage - could not parse the response "' + skillId + '"', e)
        }
      }))
  }

  /**
   * Get a skill manifest
   *
   * @param {string} skillId Skill Id
   * @param {string} skillStage Skill stage
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<object>} Observable with the skill manifest
   */
  static getSkillManifest (skillId, skillStage, accessToken) {
    const url = 'https://api.amazonalexa.com/v1/skills/' + skillId + '/stages/' + skillStage + '/manifest'
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }
    return Util.submitHttpRequest(url, headers, 'GET')
      .pipe(map(body => {
        try {
          return JSON.parse(body)
        } catch (e) {
          Util.exitWithError('There was an error getting the skill manifest - could not parse the response', e)
        }
      }))
  }

  /**
   * Update a skill manifest
   *
   * @param {string} skillId Skill Id
   * @param {string} skillStage Skill Stage
   * @param {object} manifest Skill manifest
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<any>} An observable
   */
  static updateSkillManifest (skillId, skillStage, manifest, accessToken) {
    const url = 'https://api.amazonalexa.com/v1/skills/' + skillId + '/stages/' + skillStage + '/manifest'
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }
    return Util.submitHttpRequest(url, headers, 'PUT', manifest)
  }

  /**
   * Create a skill
   *
   * @param {string} vendorId Vendor Id
   * @param {object} manifest Skill manifest
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<string>} An observable with the skill Id
   */
  static createSkill (vendorId, manifest, accessToken) {
    const logger = log4js.getLogger('smapi-access')
    logger.info(`Creating a new skill`)
    const payload = JSON.parse(JSON.stringify(manifest)) // clone
    payload.vendorId = vendorId
    const url = 'https://api.amazonalexa.com/v1/skills'
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }
    return Util.submitHttpRequest(url, headers, 'POST', payload)
      .pipe(map(response => response.skillId))
  }

  /**
   * Check the status of a newly created skill
   *
   * @param {string} skillId Skill Id
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<string>} An observable with the status as a string (e.g. SUCCEEDED, IN_PROGRESS, etc.)
   */
  static checkSkillStatus (skillId, accessToken) {
    const logger = log4js.getLogger('smapi-access')
    logger.info(`Getting skill status for skill id ${skillId}`)
    const url = `https://api.amazonalexa.com/v1/skills/${skillId}/status`
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }
    return Util.submitHttpRequest(url, headers, 'GET')
      .pipe(map(response => JSON.parse(response).manifest.lastUpdateRequest.status))
  }

  /**
   * Create a skill and wait for it to have status `SUCCEEDED`
   *
   * @param {string} vendorId Vendor Id
   * @param {object} manifest Skill manifest
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable<string>} An observable with the newly created skill Id
   */
  static createSkillAndWait (vendorId, manifest, accessToken) {
    const logger = log4js.getLogger('smapi-access')
    let skillId = null

    return this.createSkill(vendorId, manifest, accessToken)
      .pipe(map(id => {
        skillId = id
      }))
      .pipe(mergeMap(() => timer(0, 1000)))
      .pipe(mergeMap(() => this.checkSkillStatus(skillId, accessToken)))
      .pipe(filter(status => {
        logger.debug(`The skill status is "${status}"`)
        if (status === 'SUCCEEDED') {
          logger.debug(`Stopping skill status poll`)
          return true
        } else if (status === 'IN_PROGRESS') {
          logger.debug(`continuing skill status poll`)
          return false
        } else {
          Util.exitWithError('There was an error creating the skill. The skill status is "' + status + '"')
        }
      }))
      .pipe(take(1))
      .pipe(map(() => skillId))
  }

  /**
   * Update a skill manifest and wait for it to have status `SUCCEEDED`
   *
   * @param {string} skillId Skill Id
   * @param {object} manifest Skill manifest
   * @param {string} accessToken Access token for ASK authentication
   * @returns {Observable} An observable
   */
  static updateSkillAndWait (skillId, manifest, accessToken) {
    const logger = log4js.getLogger('smapi-access')
    const stage = 'development'
    return this.updateSkillManifest(skillId, stage, manifest, accessToken)
      .pipe(mergeMap(() => timer(0, 1000)))
      .pipe(mergeMap(() => this.checkSkillStatus(skillId, accessToken)))
      .pipe(filter(status => {
        logger.debug(`The skill status is "${status}"`)
        if (status === 'SUCCEEDED') {
          logger.debug(`Stopping skill status poll`)
          return true
        } else if (status === 'IN_PROGRESS') {
          logger.debug(`continuing skill status poll`)
          return false
        } else {
          Util.exitWithError('There was an error updating the skill. The skill status is "' + status + '"')
        }
      }))
      .pipe(take(1))
  }

  /**
   * Delete a skill
   *
   * @param {string} skillId The Id of the skill to delete
   * @param {string} accessToken The access token for authentication
   * @returns {Observable<string>} An observable
   */
  static deleteSkill (skillId, accessToken) {
    const logger = log4js.getLogger('smapi-access')
    logger.info(`Deleting skill with id ${skillId}`)
    const url = `https://api.amazonalexa.com/v1/skills/${skillId}`
    const headers = {
      Authorization: 'Bearer ' + accessToken
    }
    return Util.submitHttpRequest(url, headers, 'DELETE')
  }
}
