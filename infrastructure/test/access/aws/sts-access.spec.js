import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import { of } from 'rxjs'
import { StsAccess } from '../../../src/access/aws/sts-access'

describe('StsAccess', () => {
  it('getCallerIdentity', (done) => {
    // Arrange
    const expectedResults = { Account: 'dummy-account-id' }
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = StsAccess.getCallerIdentity()

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('getAccountNumber', (done) => {
    // Arrange
    const expectedResults = 'dummy-account-id'
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of({ Account: expectedResults }))

    // Act
    const o = StsAccess.getAccountNumber()

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })
})
