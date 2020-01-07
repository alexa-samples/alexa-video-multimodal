import { of } from 'rxjs'
import { Util } from '../../src/util/util'
import { AccountWorkflow } from '../../src/workflows/account-workflow'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { LambdaStackWorkflow } from '../../src/workflows/lambda-stack-workflow'
import { DeleteWorkflow } from '../../src/workflows/delete-workflow'

describe('DeleteWorkflow', () => {
  describe('runDeleteResourcesWorkflow', () => {
    it('user confirmed', (done) => {
      // Arrange
      spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'y' }))
      const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
      initializeIfNeededWorkflowSpy.and.returnValue(of(undefined))
      const deleteArtifactStackWorkflowSpy = spyOn(ArtifactStackWorkflow, 'deleteWorkflow')
      deleteArtifactStackWorkflowSpy.and.returnValue(of(undefined))
      const deleteLambdaStackWorkflow = spyOn(LambdaStackWorkflow, 'deleteWorkflow')
      deleteLambdaStackWorkflow.and.returnValue(of(undefined))

      // Act
      const o = DeleteWorkflow.runDeleteResourcesWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual('Resources deleted.')
        expect(initializeIfNeededWorkflowSpy).toHaveBeenCalledWith()
        expect(deleteLambdaStackWorkflow).toHaveBeenCalledWith()
        expect(deleteLambdaStackWorkflow).toHaveBeenCalledWith()
        done()
      })
    })

    it('user declined', (done) => {
      // Arrange
      spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'n' }))
      const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
      const updateWorkflowSpy = spyOn(ArtifactStackWorkflow, 'deleteWorkflow')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      // Act
      const o = DeleteWorkflow.runDeleteResourcesWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(initializeIfNeededWorkflowSpy).not.toHaveBeenCalled()
        expect(updateWorkflowSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).toHaveBeenCalledWith()
        done()
      })
    })
  })
})