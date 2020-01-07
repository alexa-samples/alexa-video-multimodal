import { of } from 'rxjs'
import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { ProjectConfigWorkflow } from '../../src/workflows/project-config-workflow'

describe('ProjectConfigWorkflow', () => {
  describe('initialize', () => {
    it('success', (done) => {
      // Arrange
      const configs = {}
      spyOn(ProjectConfigUtil, 'promptForProjectConfigs').and.returnValue(of(configs))
      spyOn(ProjectConfigUtil, 'persistProjectConfig').and.returnValue(configs)
      spyOn(ProjectConfigUtil, 'validateProjectConfig').and.returnValue(of(true))

      // Act
      const o = ProjectConfigWorkflow.initialize()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('invalid token', (done) => {
      // Arrange
      const configs = {}
      spyOn(ProjectConfigUtil, 'promptForProjectConfigs').and.returnValue(of(configs))
      spyOn(ProjectConfigUtil, 'persistProjectConfig').and.returnValue(configs)
      spyOn(ProjectConfigUtil, 'validateProjectConfig').and.callFake(() => {
        spyOn(ProjectConfigWorkflow, 'initialize').and.returnValue(of('recurse'))
        return of(false)
      })

      // Act
      const o = ProjectConfigWorkflow.initialize()

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
      spyOn(ProjectConfigUtil, 'requiresProjectConfigPrompts').and.returnValue(of(false))
      spyOn(ProjectConfigWorkflow, 'initialize')
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      // Act
      const o = ProjectConfigWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(ProjectConfigWorkflow.initialize).not.toHaveBeenCalled()
        done()
      })
    })

    it('needed', (done) => {
      // Arrange
      spyOn(ProjectConfigUtil, 'requiresProjectConfigPrompts').and.returnValue(of(true))
      spyOn(ProjectConfigWorkflow, 'initialize').and.returnValue(of(undefined))

      // Act
      const o = ProjectConfigWorkflow.initializeIfNeeded()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(ProjectConfigWorkflow.initialize).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
})
