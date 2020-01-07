import * as log4js from 'log4js'
import { from, of } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import oauth2 from 'simple-oauth2'
import { FilesystemAccess } from '../../access/filesystem-access'
import { Util } from '../util'
import { AwsAccountUtil } from '../aws/aws-account-util'
import { APP_LOGGER } from '../../infrastructure'
import findIndex from 'lodash/findIndex'

/**
 * Utility class for Alexa Skill Kit (ASK) account
 */
export class AskAccountUtil {
  /**
   * Read the ~/.ask/cli_config config file
   *
   * @returns {object} ASK configs
   */
  static readAskConfigs () {
    const askProfile = this.getAskUserProfile()
    const logger = log4js.getLogger('ask-util')
    const askConfigs = {
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      expiresIn: null,
      expiresAt: null,
      vendorId: null,
      awsProfile: null
    }

    if (!this._hasAskDirectory()) {
      logger.info('Directory ~/.ask is not present')
      return askConfigs
    }

    logger.debug('Read the ~/.ask/cli_config file')
    if (this._hasAskConfigFile()) {
      const configFile = FilesystemAccess.readJsonFile(this.getAskConfigFileName())
      if (configFile.profiles) {
        if (configFile.profiles[askProfile]) {
          const profileConfig = configFile.profiles[askProfile]
          if (profileConfig.vendor_id) {
            askConfigs.vendorId = profileConfig.vendor_id
          }
          if (profileConfig.aws_profile) {
            askConfigs.awsProfile = profileConfig.aws_profile
          }
          if (profileConfig.token) {
            const token = profileConfig.token
            if (token.access_token) {
              askConfigs.accessToken = token.access_token
            }
            if (token.refresh_token) {
              askConfigs.refreshToken = token.refresh_token
            }
            if (token.token_type) {
              askConfigs.tokenType = token.token_type
            }
            if (token.expires_in) {
              askConfigs.expiresIn = token.expires_in
            }
            if (token.expires_at) {
              askConfigs.expiresAt = token.expires_at
            }
          }
        }
      }
    }

    return askConfigs
  }

  /**
   * Write the ASK configs to disk
   *
   * @param {object} askConfigs ASK configs
   * @returns {object} ASK configs
   */
  static persistAskConfigs (askConfigs) {
    const logger = log4js.getLogger('ask-account-util')
    const askProfile = this.getAskUserProfile()
    logger.debug('Ensure ~/.ask directory and relevant files exist.')
    if (!this._hasAskDirectory()) {
      FilesystemAccess.mkdir(this.getAskConfigDirectoryName())
    }
    if (!this._hasAskConfigFile()) {
      FilesystemAccess.touch(this.getAskConfigFileName())
    }

    logger.debug('Write the ~/.ask/config file')
    let configFile = FilesystemAccess.readJsonFile(this.getAskConfigFileName(), true)
    if (!configFile) {
      configFile = {}
    }
    if (!configFile.profiles) {
      configFile.profiles = {}
    }
    if (!configFile.profiles[askProfile]) {
      configFile.profiles[askProfile] = {}
    }
    if (!configFile.profiles[askProfile].token) {
      configFile.profiles[askProfile].token = {}
    }

    if (askConfigs.vendorId) {
      configFile.profiles[askProfile].vendor_id = askConfigs.vendorId
    }
    if (askConfigs.awsProfile) {
      configFile.profiles[askProfile].aws_profile = askConfigs.awsProfile
    }
    if (askConfigs.accessToken) {
      configFile.profiles[askProfile].token.access_token = askConfigs.accessToken
    }
    if (askConfigs.refreshToken) {
      configFile.profiles[askProfile].token.refresh_token = askConfigs.refreshToken
    }
    if (askConfigs.tokenType) {
      configFile.profiles[askProfile].token.token_type = askConfigs.tokenType
    }
    if (askConfigs.expiresIn) {
      configFile.profiles[askProfile].token.expires_in = askConfigs.expiresIn
    }
    if (askConfigs.expiresAt) {
      configFile.profiles[askProfile].token.expires_at = askConfigs.expiresAt
    }

    FilesystemAccess.writeJsonFile(this.getAskConfigFileName(), configFile)
    return askConfigs
  }

  /**
   * This prompts the user to visit a URL to obtain an Authorization Code from LWA
   *
   * @param {string} askSecurityProfileClientId ASK security profile client Id
   * @param {string} askSecurityProfileClientSecret ASK security profile client secret
   * @returns {Observable<object>} askConfig An observable with the ASK config
   */
  static promptForAskCredentials (askSecurityProfileClientId, askSecurityProfileClientSecret) {
    const scopes = ['alexa::ask:skills:readwrite',
      'alexa::ask:models:readwrite',
      'alexa::ask:skills:test',
      'alexa::ask:catalogs:read',
      'alexa::ask:catalogs:readwrite'].join(' ')
    const state = 'Ask-SkillModel-ReadWrite'
    const clientId = askSecurityProfileClientId
    const clientSecret = askSecurityProfileClientSecret
    const authorizeHost = 'https://www.amazon.com'
    const authorizePath = '/ap/oa'
    const tokenHost = 'https://api.amazon.com'
    const tokenPath = '/auth/o2/token'
    const redirectUri = 'https://s3.amazonaws.com/ask-cli/response_parser.html'

    const oa = oauth2.create({
      client: { id: clientId, secret: clientSecret },
      auth: { authorizeHost, authorizePath, tokenHost, tokenPath }
    })

    // prepare URL for the user to call LWA
    const authorizeUrl = oa.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: scopes,
      state
    })

    console.log(`\nPaste the following url to your browser and get an Authorization Code:\n\n${authorizeUrl}\n`)
    const promptList = [{
      type: 'password',
      name: 'authorizationCode',
      message: 'Please enter the Authorization Code',
      validate: value => value && value.trim().length > 0 ? true : 'You must specify a value'
    }]
    let token = null
    let vendorIdsArray = []
    return Util.doPrompt(promptList)
      .pipe(mergeMap(response => {
        return this.requestTokens(oa, response.authorizationCode, redirectUri)
      }))
      .pipe(mergeMap(t => {
        token = t
        return this.getVendorIdsFromToken(token)
      }))
      .pipe(mergeMap(vendorIds => {
        if (vendorIds.length === 1) {
          return of(vendorIds[0])
        }
        vendorIdsArray = vendorIds
        const defaultVendorIdIndex = findIndex(vendorIdsArray, vId => {
          return vId === this.getVendorId()
        })
        const vendorIdPrompt = {
          type: 'select',
          name: 'vendorId',
          message: 'Please select your vendor Id. If you do not know which one to select, please refer here: https://developer.amazon.com/settings/console/mycid',
          choices: vendorIds,
          initial: defaultVendorIdIndex !== -1 ? defaultVendorIdIndex : 0,
          optionsPerPage: 50
        }
        return Util.doPrompt([vendorIdPrompt])
          .pipe(map(response => vendorIdsArray[response.vendorId]))
      }))
      .pipe(map(vendorId => {
        const askConfig = {
          tokenType: token ? token.token_type : null,
          refreshToken: token ? token.refresh_token : null,
          accessToken: token ? token.access_token : null,
          expiresIn: token ? token.expires_in : null,
          expiresAt: token ? token.expires_at : null
        }
        askConfig.vendorId = vendorId
        askConfig.awsProfile = AwsAccountUtil.getAwsUserProfile()
        return askConfig
      }))
  }

  /**
   * Check whether the ASK credentials are set up
   *
   * @returns {boolean} True if required
   */
  static requiresAskCredentialsPrompt () {
    const askConfigs = this.readAskConfigs()
    return !askConfigs.accessToken ||
      !askConfigs.refreshToken ||
      !askConfigs.tokenType ||
      !askConfigs.expiresIn ||
      !askConfigs.expiresAt ||
      !askConfigs.vendorId ||
      !askConfigs.awsProfile ||
      !this.tokenIsValid(askConfigs.expiresAt)
  }

  /**
   * Check if ~/.ask directory exists
   *
   * @returns {boolean} True if it exists
   * @private
   */
  static _hasAskDirectory () {
    return FilesystemAccess.checkIfFileOrDirectoryExists(this.getAskConfigDirectoryName())
  }

  /**
   * Check if ~/.ask/cli_config file exists
   *
   * @returns {boolean} True if exists
   * @private
   */
  static _hasAskConfigFile () {
    return FilesystemAccess.checkIfFileOrDirectoryExists(this.getAskConfigFileName())
  }

  /**
   * Return ~/.ask
   *
   * @returns {string} ASK config directory absolute path
   */
  static getAskConfigDirectoryName () {
    const cwd = FilesystemAccess.getHomeDirectory()
    return FilesystemAccess.constructPath([cwd, '.ask'])
  }

  /**
   * Return ~/.ask/cli_config
   *
   * @returns {string} ASK config file absolute path
   */
  static getAskConfigFileName () {
    return FilesystemAccess.constructPath([this.getAskConfigDirectoryName(), 'cli_config'])
  }

  /**
   * Request an OAuth token
   *
   * @param {object} oa A simple-oauth client
   * @param {string} authCode Authorization code
   * @param {string} redirectUri Redirect URI
   * @returns {Observable<any>} An observable
   */
  static requestTokens (oa, authCode, redirectUri) {
    const logger = log4js.getLogger('ask-account-util')
    const tokenConfig = {
      code: authCode,
      redirect_uri: redirectUri
    }
    return from(oa.authorizationCode.getToken(tokenConfig))
      .pipe(catchError(() => {
        logger.error('There was an error getting the token.  Please try again or double check your ASK client Id and ASK client secret.')
        return of(undefined)
      }))
      .pipe(map(result => result ? oa.accessToken.create(result).token : result))
  }

  /**
   * Given a token, get the vendor Id of the user
   *
   * @param {object|null} token Token
   * @returns {Observable<string>} Observable with the vendor Id
   */
  static getVendorIdsFromToken (token) {
    if (!token) {
      return of(null)
    }
    const url = 'https://api.amazonalexa.com/v0/vendors'
    // refresh_token
    const headers = {
      Authorization: 'Bearer ' + token['access_token']
    }

    return Util.submitHttpRequest(url, headers, 'GET')
      .pipe(map(body => {
        try {
          const vendorData = JSON.parse(body)
          if (vendorData.vendors && vendorData.vendors.length > 0) {
            return vendorData.vendors.map(vendor => vendor.id)
          } else {
            Util.exitWithError('There was an error getting the vendor id - no vendor ids returned')
          }
        } catch (e) {
          Util.exitWithError('There was an error getting the vendor id - could not parse the response', e)
        }
      }))
  }

  /**
   * Get the ask-cli user profile
   *
   * @returns {string} ASK user profile
   */
  static getAskUserProfile () {
    return 'alexa-video-multimodal-reference-software-user-profile'
  }

  /**
   * Check token expiry
   *
   * @param {string} tokenExpiry Token expiration as an ISO 8601 date
   * @returns {boolean} true if token is not expired
   */
  static tokenIsValid (tokenExpiry) {
    APP_LOGGER.info('Checking if ASK token is expired')
    const expiryDate = new Date(tokenExpiry)
    const now = new Date()
    const timeLeftMillis = expiryDate - now
    const isValid = timeLeftMillis > 0
    APP_LOGGER.info('ASK token is ' + (isValid ? 'not' : '') + ' expired')
    return isValid
  }

  /**
   * Get the ASK security profile refresh token
   *
   * @returns {string} Refresh token
   */
  static getRefreshToken () {
    return this.readAskConfigs().refreshToken
  }

  /**
   * Get the ASK security profile vendor Id
   *
   * @returns {string} Vendor Id
   */
  static getVendorId () {
    return this.readAskConfigs().vendorId
  }

  /**
   * Get the ASK security profile access token
   *
   * @returns {string} Access token
   */
  static getAccessToken () {
    return this.readAskConfigs().accessToken
  }
}
