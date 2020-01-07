import { SkillWorkflow } from '../../src/workflows/skill-workflow'
import { AccountWorkflow } from '../../src/workflows/account-workflow'
import { of } from 'rxjs'
import { CliUtil } from '../../src/util/cli-util'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { LambdaStackWorkflow } from '../../src/workflows/lambda-stack-workflow'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'
import { LambdaAccess } from '../../src/access/aws/lambda-access'
import { Util } from '../../src/util/util'
import { DeployWorkflow } from '../../src/workflows/deploy-workflow'

describe('SkillWorkflow', () => {
  it('run (--enable-web-player-logs)', done => {
    // Arrange
    const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
    initializeIfNeededSpy.and.returnValue(of(undefined))

    const toggleCloudWatchLogsSpy = spyOn(SkillWorkflow, 'toggleCloudWatchLogs')
    toggleCloudWatchLogsSpy.and.returnValue(of(undefined))
    //
    const handleHelpOptionSpy = spyOn(CliUtil, 'handleHelpOption')
    handleHelpOptionSpy.and.returnValue(of(undefined))

    const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
    getStackStatusTableSpy.and.returnValue(of(undefined))

    // Act
    const o = SkillWorkflow.run(['--enable-web-player-logs'])

    o.subscribe(results => {
      // Assert
      expect(results).toBeUndefined()
      expect(initializeIfNeededSpy).toHaveBeenCalledTimes(1)
      expect(toggleCloudWatchLogsSpy).toHaveBeenCalledWith(true)
      expect(handleHelpOptionSpy).not.toHaveBeenCalled()
      expect(getStackStatusTableSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('run (--disable-web-player-logs)', done => {
    // Arrange
    const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
    initializeIfNeededSpy.and.returnValue(of(undefined))

    const toggleCloudWatchLogsSpy = spyOn(SkillWorkflow, 'toggleCloudWatchLogs')
    toggleCloudWatchLogsSpy.and.returnValue(of(undefined))
    //
    const handleHelpOptionSpy = spyOn(CliUtil, 'handleHelpOption')
    handleHelpOptionSpy.and.returnValue(of(undefined))

    const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
    getStackStatusTableSpy.and.returnValue(of(undefined))

    // Act
    const o = SkillWorkflow.run(['--disable-web-player-logs'])

    o.subscribe(results => {
      // Assert
      expect(results).toBeUndefined()
      expect(initializeIfNeededSpy).toHaveBeenCalledTimes(1)
      expect(toggleCloudWatchLogsSpy).toHaveBeenCalledWith(false)
      expect(handleHelpOptionSpy).not.toHaveBeenCalled()
      expect(getStackStatusTableSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('run (help explicit)', () => {
    // Arrange
    const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
    initializeIfNeededSpy.and.returnValue(of(undefined))

    const toggleCloudWatchLogsSpy = spyOn(SkillWorkflow, 'toggleCloudWatchLogs')
    toggleCloudWatchLogsSpy.and.returnValue(of(undefined))
    //
    const handleHelpOptionSpy = spyOn(CliUtil, 'handleHelpOption')
    handleHelpOptionSpy.and.returnValue(of(undefined))

    const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
    getStackStatusTableSpy.and.returnValue(of(undefined))

    // Act
    const result = SkillWorkflow.run(['--help'])

    // Assert
    expect(result).toBeUndefined()
    expect(initializeIfNeededSpy).not.toHaveBeenCalled()
    expect(toggleCloudWatchLogsSpy).not.toHaveBeenCalled()
    expect(handleHelpOptionSpy).toHaveBeenCalledTimes(1)
    expect(getStackStatusTableSpy).not.toHaveBeenCalled()
  })

  it('run (help implicit)', () => {
    // Arrange
    const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
    initializeIfNeededSpy.and.returnValue(of(undefined))

    const toggleCloudWatchLogsSpy = spyOn(SkillWorkflow, 'toggleCloudWatchLogs')
    toggleCloudWatchLogsSpy.and.returnValue(of(undefined))
    //
    const handleHelpOptionSpy = spyOn(CliUtil, 'handleHelpOption')
    handleHelpOptionSpy.and.returnValue(of(undefined))

    const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
    getStackStatusTableSpy.and.returnValue(of(undefined))

    // Act
    const result = SkillWorkflow.run([])

    // Assert
    expect(result).toBeUndefined()
    expect(initializeIfNeededSpy).not.toHaveBeenCalled()
    expect(toggleCloudWatchLogsSpy).not.toHaveBeenCalled()
    expect(handleHelpOptionSpy).toHaveBeenCalledTimes(1)
    expect(getStackStatusTableSpy).not.toHaveBeenCalled()
  })

  describe('toggleCloudWatchLogs', () => {
    it('success', done => {
      // Arrange
      const getStackNameSpy0 = spyOn(ArtifactStackWorkflow, 'getStackName')
      getStackNameSpy0.and.returnValue(undefined)

      const getStackNameSpy1 = spyOn(LambdaStackWorkflow, 'getStackName')
      getStackNameSpy1.and.returnValue(undefined)

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(true))

      const getLambdaFunctionNameSpy = spyOn(LambdaStackWorkflow, 'getLambdaFunctionName')
      getLambdaFunctionNameSpy.and.returnValue(of(undefined))
      //
      const updateLambdaEnvironmentVariablesSpy = spyOn(LambdaAccess, 'updateLambdaEnvironmentVariables')
      updateLambdaEnvironmentVariablesSpy.and.returnValue(of(undefined))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.throwError(of(new Error('dummy-error')))

      // Act
      const o = SkillWorkflow.toggleCloudWatchLogs(true)

      o.subscribe(results => {
        // Assert
        expect(results).toBeUndefined()
        expect(getStackNameSpy0).toHaveBeenCalledTimes(1)
        expect(getStackNameSpy1).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getLambdaFunctionNameSpy).toHaveBeenCalledTimes(1)
        expect(updateLambdaEnvironmentVariablesSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })
})
