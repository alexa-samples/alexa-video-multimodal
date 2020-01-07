import * as log4js from 'log4js'
import { AwsSdkUtil } from '../../util/aws/aws-sdk-util'
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { map } from 'rxjs/operators'
import { Util } from '../../util/util'

/**
 * AWS Cognito access functions
 */
export class CognitoAccess {
  /**
   * Describe a Cognito user pool client
   *
   * @param {string} userPoolId AWS Cognito user pool Id
   * @param {string} clientId Client Id
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<{}>} An observable with the user pool client description
   */
  static describeUserPoolClient (userPoolId, clientId, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    const params = {
      UserPoolId: userPoolId,
      ClientId: clientId
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.describeUserPoolClient,
      [params],
      logger,
      logMessage || 'describe Cognito user pool client "' + clientId + '" in pool Id "' + userPoolId + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Describe a Cognito user pool
   *
   * @param {string} userPoolId AWS Cognito user pool Id
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string|null} logMessage A log message for the API call
   * @returns {Observable<{}>} An observable with the user pool description
   */
  static describeUserPool (userPoolId, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    const params = {
      UserPoolId: userPoolId
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.describeUserPool,
      [params],
      logger,
      logMessage || 'describe Cognito user pool with id "' + userPoolId + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Create a user pool domain
   *
   * @param {string} userPoolId AWS Cognito user pool Id
   * @param {string} domain User pool domain
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable} An observable
   */
  static createUserPoolDomain (userPoolId, domain, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    const params = {
      UserPoolId: userPoolId,
      Domain: domain
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.createUserPoolDomain,
      [params],
      logger,
      logMessage || 'create user pool domain "' + domain + '" in pool id "' + userPoolId + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Delete a user pool domain
   *
   * @param {string} userPoolId Aws Cognito user pool Id
   * @param {string} domain User pool domain
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable} An observable
   */
  static deleteUserPoolDomain (userPoolId, domain, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    const params = {
      UserPoolId: userPoolId,
      Domain: domain
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.deleteUserPoolDomain,
      [params],
      logger,
      logMessage || 'delete user pool domain "' + domain + '" in pool id "' + userPoolId + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Describe a user pool domain
   *
   * @param {string} domain User pool domain
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<{}>} An observable with the user pool domain description
   */
  static describeUserPoolDomain (domain, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    const params = {
      Domain: domain
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.describeUserPoolDomain,
      [params],
      logger,
      logMessage || 'describe user pool domain"' + domain + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Update user pool client
   *
   * @param {string} clientId Client Id
   * @param {string} userPoolId AWS Cognito user pool Id
   * @param {Array} callbackURLs An array of callback URLs
   * @param {Array} logoutUrls An array log logout URLs
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable} An observable
   */
  static updateUserPoolClient (clientId, userPoolId, callbackURLs, logoutUrls, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cognito-util')
    var params = {
      ClientId: clientId,
      UserPoolId: userPoolId,
      AllowedOAuthFlows: [
        'code'
      ],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: [
        'phone', 'email', 'openid', 'aws.cognito.signin.user.admin', 'profile'
      ],
      CallbackURLs: callbackURLs,
      ExplicitAuthFlows: [],
      LogoutURLs: logoutUrls,
      SupportedIdentityProviders: [
        'COGNITO'
      ]
    }
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    return AwsSdkUtil.makeRequest(
      cognitoIdentityServiceProvider,
      cognitoIdentityServiceProvider.updateUserPoolClient,
      [params],
      logger,
      logMessage || 'update user pool client"' + clientId + '" in pool id "' + userPoolId + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Check if a user pool domain exists
   *
   * @param {string} domain User pool domain
   * @returns {Observable<boolean>} An observable - true if the domain exists
   */
  static checkIfUserPoolDomainExists (domain) {
    const logger = log4js.getLogger('cognito-util')
    return CognitoAccess.describeUserPoolDomain(
      domain,
      false,
      true,
      'check if user pool domain exists "' + domain + '"')
      .pipe(map(data => {
        if (!!data && !!data.DomainDescription && !Util.isEmptyMap(data.DomainDescription)) {
          logger.info('User pool domain "' + domain + '" exists')
          return true
        } else {
          logger.info('User pool domain "' + domain + '" does not exist')
          return false
        }
      }))
  }
}
