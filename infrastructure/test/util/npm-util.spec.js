import { NpmUtil } from '../../src/util/npm-util'
import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { CliUtil } from '../../src/util/cli-util'
import { of } from 'rxjs'
import { checkIfFileOrDirectoryExistsSpy, listFilesSpy } from '../run'
import { Util } from '../../src/util/util'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'

describe('NpmUtil', () => {
  describe('buildWebPlayer', () => {
    it('success', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      listFilesSpy.and.returnValue(['dummy-file'])

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)

      // Act
      const o = NpmUtil.buildWebPlayer()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failed no dist directory', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(false)
      listFilesSpy.and.returnValue(['dummy-file'])

      // Act
      const o = NpmUtil.buildWebPlayer()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).toHaveBeenCalled()
        expect(listFilesSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failed empty dist directory', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      listFilesSpy.and.returnValue([])

      // Act
      const o = NpmUtil.buildWebPlayer()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).toHaveBeenCalled()
        expect(listFilesSpy).toHaveBeenCalled()
        done()
      })
    })
  })
  describe('buildLambda', () => {
    it('success', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      listFilesSpy.and.returnValue(['dummy-file'])

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)

      // Act
      const o = NpmUtil.buildLambda()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failed no dist directory', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(false)
      listFilesSpy.and.returnValue(['dummy-file'])

      // Act
      const o = NpmUtil.buildLambda()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).toHaveBeenCalled()
        expect(listFilesSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failed empty dist directory', done => {
      // Arrange
      spyOn(CliUtil, 'runCommand').and.returnValue(of({}))

      const getProjectRootSpy = spyOn(ProjectConfigUtil, 'getProjectRoot')
      getProjectRootSpy.and.returnValues('dummy-project-root', 'dummy-project-root')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      listFilesSpy.and.returnValue([])

      // Act
      const o = NpmUtil.buildLambda()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getProjectRootSpy).toHaveBeenCalledTimes(2)
        expect(exitWithErrorSpy).toHaveBeenCalled()
        expect(listFilesSpy).toHaveBeenCalled()
        done()
      })
    })
  })
})
