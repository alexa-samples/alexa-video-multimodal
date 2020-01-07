import { CognitoAccess } from '../../../src/access/aws/cognito-access'
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider'

describe('CognitoAccess', () => {
  afterEach(() => {
    CognitoAccess.cognitoIdentityServiceProvider = undefined
  })

  it('getUser', done => {
    // Arrange
    const attributes = {
      UserName: 'dummy-user-name'
    }
    const accessKey = 'dummy-access-key'
    const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()
    const getUserSpy = spyOn(cognitoIdentityServiceProvider, 'getUser')
    getUserSpy.and.returnValue({
      promise: () => {
        return Promise.resolve(attributes)
      }
    })
    CognitoAccess.cognitoIdentityServiceProvider = cognitoIdentityServiceProvider

    // Act
    const promise = CognitoAccess.getUser(accessKey)

    // Assert
    promise.then(
      result => {
        expect(getUserSpy).toHaveBeenCalled()
        expect(result).toEqual(attributes)
        done()
      }
    ).catch(done.fail)
  })
})
