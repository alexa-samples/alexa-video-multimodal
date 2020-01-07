import { of } from 'rxjs'
import { AskAccountUtil } from '../../src/util/alexa/ask-account-util'
import { AskAccountWorkflow } from '../../src/workflows/ask-account-workflow'
import { ProjectConfigUtil } from '../../src/util/project-config-util'

describe('AskAccountWorkflow', () => {
  describe('initialize', () => {
    it('success', (done) => {
      // Arrange
      const configs = {}
      spyOn(AskAccountUtil, 'promptForAskCredentials').and.returnValue(of(configs))
      spyOn(ProjectConfigUtil, 'getAskSecurityProfileClientId').and.returnValue('dummy-client-id')
      spyOn(ProjectConfigUtil, 'getAskSecurityProfileClientSecret').and.returnValue('dummy-client-secret')
      spyOn(AskAccountUtil, 'persistAskConfigs').and.returnValue(configs)
      spyOn(AskAccountUtil, 'tokenIsValid').and.returnValue(true)

      // Act
      const o = AskAccountWorkflow.initialize()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('invalid token', (done) => {
      // Arrange
      const configs = {}
      spyOn(AskAccountUtil, 'promptForAskCredentials').and.returnValue(of(configs))
      spyOn(ProjectConfigUtil, 'getAskSecurityProfileClientId').and.returnValue('dummy-client-id')
      spyOn(ProjectConfigUtil, 'getAskSecurityProfileClientSecret').and.returnValue('dummy-client-secret')
      spyOn(AskAccountUtil, 'persistAskConfigs').and.returnValue(configs)
      spyOn(AskAccountUtil, 'tokenIsValid').and.callFake(() => {
        spyOn(AskAccountWorkflow, 'initialize').and.returnValue(of('recurse'))
        return false
      })

      // Act
      const o = AskAccountWorkflow.initialize()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual('recurse')
        done()
      })
    })
  })

  describe('initializeIfNeeded', () => {
    it('not needed', (done) => {
      // Arrange
      spyOn(AskAccountUtil, 'requiresAskCredentialsPrompt').and.returnValue(false)
      spyOn(AskAccountWorkflow, 'initialize')

      // Act
      const o = AskAccountWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(AskAccountWorkflow.initialize).not.toHaveBeenCalled()
        done()
      })
    })

    it('needed', (done) => {
      // Arrange
      spyOn(AskAccountUtil, 'requiresAskCredentialsPrompt').and.returnValue(true)
      spyOn(AskAccountWorkflow, 'initialize').and.returnValue(of(undefined))

      // Act
      const o = AskAccountWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(AskAccountWorkflow.initialize).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
})
