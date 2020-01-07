import { BuildWorkflow } from '../../src/workflows/build-workflow'
import { NpmUtil } from '../../src/util/npm-util'
import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { FilesystemAccess } from '../../src/access/filesystem-access'
import { listFilesSpy } from '../run'
import { of } from 'rxjs'

describe('BuildWorkflow', () => {
  it('runBuildWebPlayerWorkflow', () => {
    // Arrange
    const buildWebPlayerSpy = spyOn(NpmUtil, 'buildWebPlayer')
    buildWebPlayerSpy.and.returnValue(of(undefined))

    const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
    getProjectRootSpy.and.returnValue(FilesystemAccess.constructPath(['tmp']))

    // Act
    const o = BuildWorkflow.runBuildWebPlayerWorkflow()

    // Assert
    o.subscribe(result => {
      expect(result).toEqual(FilesystemAccess.constructPath(['tmp', 'web-player', 'dist', 'web-player']))
    })
  })

  it('runBuildLambdaWorkflow', () => {
    // Arrange
    const buildLambdaSpy = spyOn(NpmUtil, 'buildLambda')
    buildLambdaSpy.and.returnValue(of(undefined))

    const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
    getProjectRootSpy.and.returnValue(FilesystemAccess.constructPath(['tmp']))

    listFilesSpy.and.returnValue(['lambda.123.zip'])

    // Act
    const o = BuildWorkflow.runBuildLambdaWorkflow()

    // Assert
    o.subscribe(result => {
      expect(result).toEqual(FilesystemAccess.constructPath(['tmp', 'lambda', 'dist', 'lambda', 'lambda.123.zip']))
    })
  })
})
