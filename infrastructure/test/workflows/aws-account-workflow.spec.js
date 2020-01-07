import { of } from 'rxjs'
import { AwsAccountUtil } from '../../src/util/aws/aws-account-util'
import { AwsAccountWorkflow } from '../../src/workflows/aws-account-workflow'
import { AwsSdkUtil } from '../../src/util/aws/aws-sdk-util'

describe('AwsAccountWorkflow', () => {
  describe('initialize', () => {
    it('success', (done) => {
      // Arrange
      const configs = {}
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(of(configs))
      spyOn(AwsAccountUtil, 'promptForAwsCredentials').and.returnValue(of(configs))
      spyOn(AwsAccountUtil, 'persistAwsConfigs').and.returnValue(configs)
      spyOn(AwsAccountUtil, 'validateCredentials').and.returnValue(of(true))
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)

      // Act
      const o = AwsAccountWorkflow.initialize()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('invalid credentials', (done) => {
      // Arrange
      const configs = {}
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(of(configs))
      spyOn(AwsAccountUtil, 'promptForAwsCredentials').and.returnValue(of(configs))
      spyOn(AwsAccountUtil, 'persistAwsConfigs').and.returnValue(configs)
      spyOn(AwsAccountUtil, 'validateCredentials').and.callFake(() => {
        spyOn(AwsAccountWorkflow, 'initialize').and.returnValue(of(undefined))
        return of(false)
      })
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)

      // Act
      const o = AwsAccountWorkflow.initialize()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('initializeIfNeeded', () => {
    it('not needed', (done) => {
      // Arrange
      spyOn(AwsAccountUtil, 'requiresAwsCredentialsPrompt').and.returnValue(of(false))
      spyOn(AwsAccountWorkflow, 'initialize')
      spyOn(AwsAccountUtil, 'getAwsAccessKeyId').and.returnValue('dummy-access-key-id')
      spyOn(AwsAccountUtil, 'getAwsSecretAccessKey').and.returnValue('dummy-secret-access-key')
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)

      // Act
      const o = AwsAccountWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(AwsAccountWorkflow.initialize).not.toHaveBeenCalled()
        done()
      })
    })

    it('needed', (done) => {
      // Arrange
      spyOn(AwsAccountUtil, 'requiresAwsCredentialsPrompt').and.returnValue(of(true))
      spyOn(AwsAccountWorkflow, 'initialize').and.returnValue(of(undefined))
      spyOn(AwsAccountUtil, 'getAwsAccessKeyId').and.returnValue('dummy-access-key-id')
      spyOn(AwsAccountUtil, 'getAwsSecretAccessKey').and.returnValue('dummy-secret-access-key')
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)

      // Act
      const o = AwsAccountWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(AwsAccountWorkflow.initialize).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
})
