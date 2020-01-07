import { of } from 'rxjs'
import { AskAccountWorkflow } from '../../src/workflows/ask-account-workflow'
import { ProjectConfigWorkflow } from '../../src/workflows/project-config-workflow'
import { AwsAccountWorkflow } from '../../src/workflows/aws-account-workflow'
import { AccountWorkflow } from '../../src/workflows/account-workflow'

describe('AccountWorkflow', () => {
  it('initializeWorkflow', (done) => {
    // Arrange
    const projectInitializeSpy = spyOn(ProjectConfigWorkflow, 'initialize')
    projectInitializeSpy.and.returnValue(of(undefined))
    const awsInitializeSpy = spyOn(AwsAccountWorkflow, 'initialize')
    awsInitializeSpy.and.returnValue(of(undefined))
    const askInitializeSpy = spyOn(AskAccountWorkflow, 'initialize')
    askInitializeSpy.and.returnValue(of(undefined))

    // Act
    const o = AccountWorkflow.runInitializeWorkflow()

    // Assert
    o.subscribe(results => {
      expect(results).toBeUndefined()
      expect(projectInitializeSpy).toHaveBeenCalledWith()
      expect(awsInitializeSpy).toHaveBeenCalledWith()
      expect(askInitializeSpy).toHaveBeenCalledWith()
      done()
    })
  })

  describe('initializeIfNeededWorkflow', () => {
    it('skipAskInitialization = false', (done) => {
      // Arrange
      const projectInitializeIfNeededSpy = spyOn(ProjectConfigWorkflow, 'initializeIfNeeded')
      projectInitializeIfNeededSpy.and.returnValue(of(undefined))

      const awsInitializeIfNeededSpy = spyOn(AwsAccountWorkflow, 'initializeIfNeeded')
      awsInitializeIfNeededSpy.and.returnValue(of(undefined))

      const askInitializeIfNeededSpy = spyOn(AskAccountWorkflow, 'initializeIfNeeded')
      askInitializeIfNeededSpy.and.returnValue(of(undefined))

      // Act
      const o = AccountWorkflow.initializeIfNeededWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(projectInitializeIfNeededSpy).toHaveBeenCalledWith()
        expect(awsInitializeIfNeededSpy).toHaveBeenCalledWith()
        expect(askInitializeIfNeededSpy).toHaveBeenCalledWith()
        done()
      })
    })

    it('skipAskInitialization = true', (done) => {
      // Arrange
      const projectInitializeIfNeededSpy = spyOn(ProjectConfigWorkflow, 'initializeIfNeeded')
      projectInitializeIfNeededSpy.and.returnValue(of(undefined))

      const awsInitializeIfNeededSpy = spyOn(AwsAccountWorkflow, 'initializeIfNeeded')
      awsInitializeIfNeededSpy.and.returnValue(of(undefined))

      const askInitializeIfNeededSpy = spyOn(AskAccountWorkflow, 'initializeIfNeeded')
      askInitializeIfNeededSpy.and.returnValue(of(undefined))

      // Act
      const o = AccountWorkflow.initializeIfNeededWorkflow(true)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(projectInitializeIfNeededSpy).toHaveBeenCalledWith()
        expect(awsInitializeIfNeededSpy).toHaveBeenCalledWith()
        expect(askInitializeIfNeededSpy).not.toHaveBeenCalledWith()
        done()
      })
    })
  })
})
