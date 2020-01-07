/**
 * AWS Cognito access methods
 */
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider'

export class CognitoAccess {
  /**
   * Get an instance of the AWS Cognito Identity Service Provider client API
   * Mainly used for unit testing.
   *
   * @returns {CognitoIdentityServiceProvider} CognitoIdentityServiceProvider client object
   */
  static get cognitoIdentityServiceProvider () {
    return this._cognitoIdentityServiceProvider || new CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })
  }

  /**
   * Set an instance the the AWS Cognito Identity Service Provider client API
   * Mainly used for unit testing.
   *
   * @param {CognitoIdentityServiceProvider} cognitoIdentityServiceProvider client object
   *
   */
  static set cognitoIdentityServiceProvider (cognitoIdentityServiceProvider) {
    this._cognitoIdentityServiceProvider = cognitoIdentityServiceProvider
  }

  /**
   * Given an access token, look up a particular user's information
   *
   * @param {string} accessToken The Cognito access token
   * @returns {Promise<object>} A promise that resolves to the user information
   */
  static getUser (accessToken) {
    const params = {
      AccessToken: accessToken
    }

    return this.cognitoIdentityServiceProvider.getUser(params).promise()
  }
}
