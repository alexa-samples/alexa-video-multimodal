import STS from 'aws-sdk/clients/sts'
import { StsAccess } from '../../../src/access/aws/sts-access'

describe('StsAccess', () => {
  afterEach(() => {
    StsAccess.sts = undefined
  })

  describe('assumeRole', () => {
    it('success', (done) => {
      // Arrange
      const credentials = {
        AccessKeyId: 'dummy-access-key-id',
        SecretAccessKey: 'dummy-secret-access-key',
        SessionToken: 'dummy-session-token'

      }
      const sts = new STS()
      const assumeRoleSpy = spyOn(sts, 'assumeRole')
      assumeRoleSpy.and.callFake((params, callback) => {
        callback(null, {
          Credentials: credentials
        })
      })
      StsAccess.sts = sts

      // Act
      const promise = StsAccess.assumeRole()

      // Assert
      promise.then(
        result => {
          expect(assumeRoleSpy).toHaveBeenCalled()
          expect(result.Credentials).toEqual(credentials)
          done()
        }
      ).catch(done.fail)
    })

    it('error', (done) => {
      // Arrange
      const sts = new STS()
      const assumeRoleSpy = spyOn(sts, 'assumeRole')
      assumeRoleSpy.and.callFake((params, callback) => {
        callback('dummy-error', null)
      })
      StsAccess.sts = sts

      // Act
      const promise = StsAccess.assumeRole()

      // Assert
      promise.then(done.fail)
        .catch(err => {
          expect(assumeRoleSpy).toHaveBeenCalled()
          expect(err).toEqual('dummy-error')
          done()
        })
    })
  })
})
