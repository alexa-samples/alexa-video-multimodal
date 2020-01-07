import { DeployWorkflow } from '../../src/workflows/deploy-workflow'
import { of } from 'rxjs'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'
import { LambdaStackWorkflow } from '../../src/workflows/lambda-stack-workflow'
import { AccountWorkflow } from '../../src/workflows/account-workflow'
import { MigrateContentWorkflow } from '../../src/workflows/migrate-content-workflow'
import { BuildWorkflow } from '../../src/workflows/build-workflow'
import { Util } from '../../src/util/util'
import { AwsWorkflow } from '../../src/workflows/aws-workflow'
import { S3Access } from '../../src/access/aws/s3-access'
import { LambdaAccess } from '../../src/access/aws/lambda-access'
import { CliUtil } from '../../src/util/cli-util'
import { ProjectConfigUtil } from '../../src/util/project-config-util'

describe('DeployWorkflow', () => {
  it('runDeployWorkflow', (done) => {
    // Arrange
    const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
    initializeIfNeededSpy.and.returnValue(of(undefined))

    const isDeployRerunSpy = spyOn(DeployWorkflow, 'isDeployRerun')
    isDeployRerunSpy.and.returnValue(of(null))

    const artifactStackRunCreateWorkflowSpy = spyOn(ArtifactStackWorkflow, 'runCreateWorkflow')
    artifactStackRunCreateWorkflowSpy.and.returnValue(of(undefined))

    const migrateContentWorkflowSpy = spyOn(MigrateContentWorkflow, 'runMigrateContentWorkflow')
    migrateContentWorkflowSpy.and.returnValue(of(undefined))

    const runBuildLambdaWorkflowSpy = spyOn(DeployWorkflow, 'runDeployLambdaCodeWorkflow')
    runBuildLambdaWorkflowSpy.and.returnValue(of(undefined))

    const runBuildWebPlayerWorkflowSpy = spyOn(DeployWorkflow, 'runDeployWebPlayerCodeWorkflow')
    runBuildWebPlayerWorkflowSpy.and.returnValue(of(undefined))

    const lambdaRunCreateWorkflowSpy = spyOn(LambdaStackWorkflow, 'runCreateWorkflow')
    lambdaRunCreateWorkflowSpy.and.returnValue(of(undefined))

    const waitForVideoContentSyncSpy = spyOn(MigrateContentWorkflow, 'waitForVideoContentSync')
    waitForVideoContentSyncSpy.and.returnValue(of(undefined))

    const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
    getStackStatusTableSpy.and.returnValue(of(undefined))

    // Act
    const o = DeployWorkflow.runDeployWorkflow()

    o.subscribe(results => {
      // Assert
      expect(results).toBeUndefined()
      expect(initializeIfNeededSpy).toHaveBeenCalledTimes(1)
      expect(isDeployRerunSpy).toHaveBeenCalledTimes(1)
      expect(artifactStackRunCreateWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(migrateContentWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(runBuildLambdaWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(runBuildWebPlayerWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(lambdaRunCreateWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(waitForVideoContentSyncSpy).toHaveBeenCalledTimes(1)
      expect(getStackStatusTableSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  describe('runDeployWebPlayerWorkflow', () => {
    it('success', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const artifactStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      artifactStackExistsSpy.and.returnValue(of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const buildWebPlayerSpy = spyOn(BuildWorkflow, 'runBuildWebPlayerWorkflow')
      buildWebPlayerSpy.and.returnValue(of(undefined))

      const uploadDirectoryToS3Spy = spyOn(AwsWorkflow, 'uploadDirectoryToS3')
      uploadDirectoryToS3Spy.and.returnValue(of(undefined))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployWebPlayerCodeWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(artifactStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(buildWebPlayerSpy).toHaveBeenCalledTimes(1)
        expect(uploadDirectoryToS3Spy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('fail - artifact stack does not exist', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const artifactStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      artifactStackExistsSpy.and.returnValue(of(false))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const buildWebPlayerSpy = spyOn(BuildWorkflow, 'runBuildWebPlayerWorkflow')
      buildWebPlayerSpy.and.returnValue(of(undefined))

      const uploadDirectoryToS3Spy = spyOn(AwsWorkflow, 'uploadDirectoryToS3')
      uploadDirectoryToS3Spy.and.returnValue(of(undefined))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployWebPlayerCodeWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(artifactStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(buildWebPlayerSpy).toHaveBeenCalledTimes(1)
        expect(uploadDirectoryToS3Spy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('runDeployLambdaCodeWorkflow', () => {
    it('success - updateExistingSkill = false', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const runBuildLambdaWorkflowSpy = spyOn(BuildWorkflow, 'runBuildLambdaWorkflow')
      runBuildLambdaWorkflowSpy.and.returnValue(of('lambda.123.zip'))

      const uploadFileSpy = spyOn(S3Access, 'uploadFile')
      uploadFileSpy.and.returnValue(of(undefined))

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const getLambdaFunctionNameSpy = spyOn(LambdaStackWorkflow, 'getLambdaFunctionName')
      getLambdaFunctionNameSpy.and.returnValue(of(undefined))

      const updateFunctionCodeSpy = spyOn(LambdaAccess, 'updateFunctionCode')
      updateFunctionCodeSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployLambdaCodeWorkflow(false)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(0)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(runBuildLambdaWorkflowSpy).toHaveBeenCalledTimes(1)
        expect(uploadFileSpy).toHaveBeenCalledTimes(1)
        expect(getLambdaFunctionNameSpy).not.toHaveBeenCalled()
        expect(updateFunctionCodeSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('success - updateExistingSkill = true', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const runBuildLambdaWorkflowSpy = spyOn(BuildWorkflow, 'runBuildLambdaWorkflow')
      runBuildLambdaWorkflowSpy.and.returnValue(of('lambda.123.zip'))

      const uploadFileSpy = spyOn(S3Access, 'uploadFile')
      uploadFileSpy.and.returnValue(of(undefined))

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const getLambdaFunctionNameSpy = spyOn(LambdaStackWorkflow, 'getLambdaFunctionName')
      getLambdaFunctionNameSpy.and.returnValue(of(undefined))

      const updateFunctionCodeSpy = spyOn(LambdaAccess, 'updateFunctionCode')
      updateFunctionCodeSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployLambdaCodeWorkflow(true)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(runBuildLambdaWorkflowSpy).toHaveBeenCalledTimes(1)
        expect(uploadFileSpy).toHaveBeenCalledTimes(1)
        expect(getLambdaFunctionNameSpy).toHaveBeenCalledTimes(1)
        expect(updateFunctionCodeSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failure - no artifact stack', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(false), of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const runBuildLambdaWorkflowSpy = spyOn(BuildWorkflow, 'runBuildLambdaWorkflow')
      runBuildLambdaWorkflowSpy.and.returnValue(of('lambda.123.zip'))

      const uploadFileSpy = spyOn(S3Access, 'uploadFile')
      uploadFileSpy.and.returnValue(of(undefined))

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const getLambdaFunctionNameSpy = spyOn(LambdaStackWorkflow, 'getLambdaFunctionName')
      getLambdaFunctionNameSpy.and.returnValue(of(undefined))

      const updateFunctionCodeSpy = spyOn(LambdaAccess, 'updateFunctionCode')
      updateFunctionCodeSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployLambdaCodeWorkflow(false)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(0)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(runBuildLambdaWorkflowSpy).toHaveBeenCalledTimes(1)
        expect(uploadFileSpy).toHaveBeenCalledTimes(1)
        expect(getLambdaFunctionNameSpy).not.toHaveBeenCalled()
        expect(updateFunctionCodeSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
    it('failure - no lambda stack', done => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(false))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of(undefined))

      const runBuildLambdaWorkflowSpy = spyOn(BuildWorkflow, 'runBuildLambdaWorkflow')
      runBuildLambdaWorkflowSpy.and.returnValue(of('lambda.123.zip'))

      const uploadFileSpy = spyOn(S3Access, 'uploadFile')
      uploadFileSpy.and.returnValue(of(undefined))

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-artifact-stack-name')

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const getLambdaFunctionNameSpy = spyOn(LambdaStackWorkflow, 'getLambdaFunctionName')
      getLambdaFunctionNameSpy.and.returnValue(of(undefined))

      const updateFunctionCodeSpy = spyOn(LambdaAccess, 'updateFunctionCode')
      updateFunctionCodeSpy.and.returnValue(of(undefined))

      // Act
      const o = DeployWorkflow.runDeployLambdaCodeWorkflow(true)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(runBuildLambdaWorkflowSpy).toHaveBeenCalledTimes(1)
        expect(uploadFileSpy).toHaveBeenCalledTimes(1)
        expect(getLambdaFunctionNameSpy).toHaveBeenCalledTimes(1)
        expect(updateFunctionCodeSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('getStackStatusTable', () => {
    it('stacks do not exist', (done) => {
      // Arrange
      const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
      initializeIfNeededSpy.and.returnValue(of(undefined))

      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('artifact-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('video-skill-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(false), of(false))

      const describeStackResourcesSpy = spyOn(CloudFormationAccess, 'describeStackResources')

      // Act
      const o = DeployWorkflow.getStackStatusTable()

      // Assert
      o.subscribe(result => {
        expect(initializeIfNeededSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(describeStackResourcesSpy).not.toHaveBeenCalled()
        expect(result).toEqual('\nStack artifact-stack-name does not exist' + '\nStack video-skill-stack-name does not exist\n')
        done()
      })
    })

    it('stacks exist', (done) => {
      // Arrange
      const initializeIfNeededSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
      initializeIfNeededSpy.and.returnValue(of(undefined))

      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('artifact-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('video-skill-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(true))

      const describeStackResourcesSpy = spyOn(CloudFormationAccess, 'describeStackResources')
      const description0 = {
        StackResources:
          [{
            PhysicalResourceId: 'dummy-physical-resource-id-0',
            ResourceType: 'dummy-resource-type-0',
            ResourceStatus: 'dummy-status-0'
          }]
      }
      const description1 = {
        StackResources:
          [{
            PhysicalResourceId: 'dummy-physical-resource-id-1',
            ResourceType: 'dummy-resource-type-1',
            ResourceStatus: 'dummy-status-1'
          }]
      }
      describeStackResourcesSpy.and.returnValues(of(description0), of(description1))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const getSkillIdSpy = spyOn(LambdaStackWorkflow, 'getSkillId')
      getSkillIdSpy.and.returnValue(of('dummy-skill-id'))

      const getProjectNameSpy = spyOn(ProjectConfigUtil, 'getProjectName')
      getProjectNameSpy.and.returnValue('dummy-project-name')

      const getSkillNameSpy = spyOn(ProjectConfigUtil, 'getSkillName')
      getSkillNameSpy.and.returnValue('dummy-skill-name')

      const getAwsDeploymentRegionSpy = spyOn(Util, 'getAwsDeploymentRegion')
      getAwsDeploymentRegionSpy.and.returnValue('dummy-region')

      // Act
      const o = DeployWorkflow.getStackStatusTable()

      // Assert
      o.subscribe(result => {
        expect(initializeIfNeededSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(describeStackResourcesSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(getSkillIdSpy).toHaveBeenCalledTimes(1)
        expect(getProjectNameSpy).toHaveBeenCalledTimes(1)
        expect(getSkillNameSpy).toHaveBeenCalledTimes(1)
        expect(getAwsDeploymentRegionSpy).toHaveBeenCalledTimes(1)

        expect(result).toEqual('\n' +
          '.----------------------------------------------------------.\n' +
          '|                         Overview                         |\n' +
          '|----------------------------------------------------------|\n' +
          '| Project Name                        | dummy-project-name |\n' +
          '| Skill Name                          | dummy-skill-name   |\n' +
          '| Skill Id                            | dummy-skill-id     |\n' +
          '| AWS Region Containing AWS Resources | dummy-region       |\n' +
          '\'----------------------------------------------------------\'\n' +
          '.------------------------------------------------------------------------.\n' +
          '|                          artifact-stack-name                           |\n' +
          '|------------------------------------------------------------------------|\n' +
          '|     Resource Type     |         Resource Id          | Resource Status |\n' +
          '|-----------------------|------------------------------|-----------------|\n' +
          '| dummy-resource-type-0 | dummy-physical-resource-id-0 | dummy-status-0  |\n' +
          '\'------------------------------------------------------------------------\'\n' +
          '.------------------------------------------------------------------------.\n' +
          '|                         video-skill-stack-name                         |\n' +
          '|------------------------------------------------------------------------|\n' +
          '|     Resource Type     |         Resource Id          | Resource Status |\n' +
          '|-----------------------|------------------------------|-----------------|\n' +
          '| dummy-resource-type-1 | dummy-physical-resource-id-1 | dummy-status-1  |\n' +
          '\'------------------------------------------------------------------------\'')
        done()
      })
    })
  })
  describe('runUpdateResourceWorkflow', () => {
    describe('update lambda', () => {
      it('user confirmed', done => {
        // Arrange
        const argv = ['--lambda']
        spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'y' }))

        const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
        initializeIfNeededWorkflowSpy.and.returnValue(of(undefined))

        const runDeployWebPlayerWorkflowSpy = spyOn(DeployWorkflow, 'runDeployLambdaCodeWorkflow')
        runDeployWebPlayerWorkflowSpy.and.returnValue(of(undefined))

        const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
        getStackStatusTableSpy.and.returnValue(of(undefined))

        // Act
        const o = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        o.subscribe(results => {
          expect(results).toBeUndefined()
          expect(initializeIfNeededWorkflowSpy).toHaveBeenCalledWith(false)
          expect(runDeployWebPlayerWorkflowSpy).toHaveBeenCalledWith(true)
          expect(getStackStatusTableSpy).toHaveBeenCalledTimes(1)
          done()
        })
      })

      it('user declined', (done) => {
        // Arrange
        const argv = ['--lambda']
        spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'n' }))
        const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
        initializeIfNeededWorkflowSpy.and.returnValue(of(undefined))

        const runDeployWebPlayerWorkflowSpy = spyOn(DeployWorkflow, 'runDeployLambdaCodeWorkflow')
        runDeployWebPlayerWorkflowSpy.and.returnValue(of(undefined))

        const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
        getStackStatusTableSpy.and.returnValue(of(undefined))

        const exitWithErrorSpy = spyOn(Util, 'exitWithError')
        exitWithErrorSpy.and.returnValue(of(undefined))

        // Act
        const o = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        o.subscribe(results => {
          expect(results).toBeUndefined()
          expect(initializeIfNeededWorkflowSpy).not.toHaveBeenCalled()
          expect(runDeployWebPlayerWorkflowSpy).not.toHaveBeenCalled()
          expect(getStackStatusTableSpy).not.toHaveBeenCalled()
          expect(exitWithErrorSpy).toHaveBeenCalledWith()
          done()
        })
      })
    })
    describe('update web-player', () => {
      it('user confirmed', done => {
        // Arrange
        const argv = ['--web-player']
        spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'y' }))

        const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
        initializeIfNeededWorkflowSpy.and.returnValue(of(undefined))

        const runDeployWebPlayerCodeWorkflowSpy = spyOn(DeployWorkflow, 'runDeployWebPlayerCodeWorkflow')
        runDeployWebPlayerCodeWorkflowSpy.and.returnValue(of(undefined))

        const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
        getStackStatusTableSpy.and.returnValue(of(undefined))

        // Act
        const o = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        o.subscribe(results => {
          expect(results).toBeUndefined()
          expect(initializeIfNeededWorkflowSpy).toHaveBeenCalledWith(false)
          expect(runDeployWebPlayerCodeWorkflowSpy).toHaveBeenCalledWith()
          expect(getStackStatusTableSpy).toHaveBeenCalledTimes(1)
          done()
        })
      })

      it('user declined', (done) => {
        // Arrange
        const argv = ['--web-player']
        spyOn(Util, 'yesNoPrompt').and.returnValue(of({ yesOrNo: 'n' }))
        const initializeIfNeededWorkflowSpy = spyOn(AccountWorkflow, 'initializeIfNeededWorkflow')
        initializeIfNeededWorkflowSpy.and.returnValue(of(undefined))

        const runDeployWebPlayerCodeWorkflowSpy = spyOn(DeployWorkflow, 'runDeployWebPlayerCodeWorkflow')
        runDeployWebPlayerCodeWorkflowSpy.and.returnValue(of(undefined))

        const getStackStatusTableSpy = spyOn(DeployWorkflow, 'getStackStatusTable')
        getStackStatusTableSpy.and.returnValue(of(undefined))

        const exitWithErrorSpy = spyOn(Util, 'exitWithError')
        exitWithErrorSpy.and.returnValue(of(undefined))

        // Act
        const o = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        o.subscribe(results => {
          expect(results).toBeUndefined()
          expect(initializeIfNeededWorkflowSpy).not.toHaveBeenCalled()
          expect(runDeployWebPlayerCodeWorkflowSpy).not.toHaveBeenCalled()
          expect(getStackStatusTableSpy).not.toHaveBeenCalled()
          expect(exitWithErrorSpy).toHaveBeenCalledWith()
          done()
        })
      })
    })
    describe('runUpdateResourceWorkflow --help', () => {
      it('explicitly called', () => {
        // Arrange
        const argv = ['--help']
        const helpSpy = spyOn(CliUtil, 'handleHelpOption')
        spyOn(Util, 'exitWithError').and.returnValue(undefined)

        // Act
        const results = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        expect(results).toBeUndefined()
        expect(helpSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object))
      })

      it('implicitly called', () => {
        // Arrange
        const argv = []
        const helpSpy = spyOn(CliUtil, 'handleHelpOption')
        spyOn(Util, 'exitWithError').and.returnValue(undefined)

        // Act
        const results = DeployWorkflow.runUpdateResourceWorkflow(argv)

        // Assert
        expect(results).toBeUndefined()
        expect(helpSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object))
      })
    })
  })
  describe('isDeployRerun', () => {
    it('is not a deploy re-run', () => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('dummy-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(false), of(false))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const getSkillIdSpy = spyOn(LambdaStackWorkflow, 'getSkillId')
      getSkillIdSpy.and.returnValue(of(null))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of('undefined'))

      // Act
      const o = DeployWorkflow.isDeployRerun()

      // Assert
      o.subscribe(result => {
        expect(result).toBeNull()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(0)
        expect(getSkillIdSpy).toHaveBeenCalledTimes(0)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
      })
    })
    it('is a re-run - artifact stack exists', () => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('dummy-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(false))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const getSkillIdSpy = spyOn(LambdaStackWorkflow, 'getSkillId')
      getSkillIdSpy.and.returnValue(of(null))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      // Act
      const o = DeployWorkflow.isDeployRerun()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(getSkillIdSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
      })
    })
    it('is a re-run - lambda stack exists', () => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('dummy-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(false), of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const getSkillIdSpy = spyOn(LambdaStackWorkflow, 'getSkillId')
      getSkillIdSpy.and.returnValue(of(null))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      // Act
      const o = DeployWorkflow.isDeployRerun()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(0)
        expect(getSkillIdSpy).toHaveBeenCalledTimes(0)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
      })
    })
    it('is a re-run - everything exists', () => {
      // Arrange
      const artifactGetStackNameSpy = spyOn(ArtifactStackWorkflow, 'getStackName')
      artifactGetStackNameSpy.and.returnValue('dummy-stack-name')

      const lambdaGetStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      lambdaGetStackNameSpy.and.returnValue('dummy-stack-name')

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValues(of(true), of(true))

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const getSkillIdSpy = spyOn(LambdaStackWorkflow, 'getSkillId')
      getSkillIdSpy.and.returnValue(of('dummy-skill-id'))

      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(undefined)

      // Act
      const o = DeployWorkflow.isDeployRerun()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(artifactGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(lambdaGetStackNameSpy).toHaveBeenCalledTimes(1)
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(2)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(getSkillIdSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
})
