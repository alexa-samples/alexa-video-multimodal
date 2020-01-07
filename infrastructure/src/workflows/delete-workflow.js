import { map, mergeMap } from 'rxjs/operators'
import { ArtifactStackWorkflow } from './artifact-stack-workflow'
import { LambdaStackWorkflow } from './lambda-stack-workflow'
import { Util } from '../util/util'
import { AccountWorkflow } from './account-workflow'

/**
 * Workflow definitions for deleting the multimodal skill
 */
export class DeleteWorkflow {
  /**
   * Delete resource workflow
   *
   * @returns {Observable} An observable
   */
  static runDeleteResourcesWorkflow () {
    const areYouSureMessage = 'Are you sure you want to delete your skill? All data and resources will be permanently deleted.'
    return Util.yesNoPrompt(areYouSureMessage)
      .pipe(map((response) => {
        return response.yesOrNo === 'n'
      }))
      .pipe(mergeMap(declined => {
        if (declined) {
          return Util.exitWithError()
        } else {
          return AccountWorkflow.initializeIfNeededWorkflow()
            .pipe(mergeMap(() => LambdaStackWorkflow.deleteWorkflow()))
            .pipe(mergeMap(() => ArtifactStackWorkflow.deleteWorkflow()))
            .pipe(map(() => 'Resources deleted.'))
        }
      }))
  }
}
