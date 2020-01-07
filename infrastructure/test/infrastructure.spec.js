import { of } from 'rxjs'
import { Infrastructure } from '../src/infrastructure'
import { CliUtil } from '../src/util/cli-util'
import { DeployWorkflow } from '../src/workflows/deploy-workflow'
import { AccountWorkflow } from '../src/workflows/account-workflow'
import { DeleteWorkflow } from '../src/workflows/delete-workflow'
import { SkillWorkflow } from '../src/workflows/skill-workflow'

describe('Infrastructure', () => {
  describe('run', () => {
    it('--version', () => {
      // Arrange
      const argv = ['--version']
      const cliUtilSpy = spyOn(CliUtil, 'handleVersionOption')
      cliUtilSpy.and.returnValue(undefined)

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(cliUtilSpy).toHaveBeenCalledWith()
    })

    it('--init', (done) => {
      // Arrange
      const argv = ['--init']
      const infrastructureSpy = spyOn(AccountWorkflow, 'runInitializeWorkflow')
      infrastructureSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(infrastructureSpy).toHaveBeenCalledWith()
      done()
    })

    it('--update', (done) => {
      // Arrange
      const argv = ['--update']
      const runUpdateResourceWorkflowSpy = spyOn(DeployWorkflow, 'runUpdateResourceWorkflow')
      runUpdateResourceWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(runUpdateResourceWorkflowSpy).toHaveBeenCalledTimes(1)
      done()
    })

    it('--delete', (done) => {
      // Arrange
      const argv = ['--delete']
      const runDeleteResourcesWorkflowSpy = spyOn(DeleteWorkflow, 'runDeleteResourcesWorkflow')
      runDeleteResourcesWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(runDeleteResourcesWorkflowSpy).toHaveBeenCalledTimes(1)
      done()
    })

    it('--deploy', (done) => {
      // Arrange
      const argv = ['--deploy']
      const runDeployWorkflowSpy = spyOn(DeployWorkflow, 'runDeployWorkflow')
      runDeployWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(runDeployWorkflowSpy).toHaveBeenCalledTimes(1)
      done()
    })

    it('--status', (done) => {
      // Arrange
      const argv = ['--status']

      const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
      getStackStatusTableSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(getStackStatusTableSpy).toHaveBeenCalledWith()
      done()
    })

    it('--skill', (done) => {
      // Arrange
      const argv = ['--skill', '--enable-web-player-logs']

      const runSpy = spyOn(SkillWorkflow, 'run')
      runSpy.and.returnValue(of(undefined))

      // Act
      const results = Infrastructure.run(argv)

      // Assert
      expect(results).toBeUndefined()
      expect(runSpy).toHaveBeenCalledWith(['--enable-web-player-logs'])
      done()
    })

    describe('--help', () => {
      it('explicit', () => {
        // Arrange
        const argv = ['--help']
        const helpSpy = spyOn(CliUtil, 'handleHelpOption')
        helpSpy.and.returnValue(undefined)

        // Act
        const results = Infrastructure.run(argv)

        // Assert
        expect(results).toBeUndefined()
        expect(helpSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object))
      })

      it('implicit', () => {
        // Arrange
        const argv = []
        const helpSpy = spyOn(CliUtil, 'handleHelpOption')
        helpSpy.and.returnValue(undefined)

        // Act
        const results = Infrastructure.run(argv)

        // Assert
        expect(results).toBeUndefined()
        expect(helpSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object))
      })
    })
  })
})
