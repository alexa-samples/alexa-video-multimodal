import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import { of } from 'rxjs'
import { CognitoAccess } from '../../../src/access/aws/cognito-access'
import { TestUtils } from '../../test-utils'

describe('CognitoAccess', () => {
  it('describeUserPoolClient', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.describeUserPoolClient('dummy-user-pool-id', 'dummy-client-id')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('describeUserPool', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.describeUserPool('dummy-user-pool-id')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('createUserPoolDomain', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.createUserPoolDomain('dummy-user-pool-id', 'dummy-domain')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('deleteUserPoolDomain', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.deleteUserPoolDomain('dummy-user-pool-id', 'dummy-domain')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('describeUserPoolDomain', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.describeUserPoolDomain('dummy-domain')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('updateUserPoolClient', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CognitoAccess.updateUserPoolClient(
      'dummy-client-id',
      'dummy-user-pool-id',
      ['dummy-callback-url-0'],
      ['dummy-logout-url-0'])

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  describe('checkIfUserPoolDomainExists', () => {
    it('checkIfUserPoolDomainExists exists', (done) => {
      // Arrange
      const expectedResults = TestUtils.cognitoUtilDescribeUserPoolDomainResponse()
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CognitoAccess.checkIfUserPoolDomainExists('waffles')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(true)
        done()
      })
    })

    it('checkIfUserPoolDomainExists does not exist', (done) => {
      // Arrange
      const expectedResults = null
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CognitoAccess.checkIfUserPoolDomainExists('junk-domain')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(false)
        done()
      })
    })
  })
})
