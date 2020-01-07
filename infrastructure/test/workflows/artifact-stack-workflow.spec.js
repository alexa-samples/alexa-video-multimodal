import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { of } from 'rxjs'
import { AwsWorkflow } from '../../src/workflows/aws-workflow'
import { S3Access } from '../../src/access/aws/s3-access'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'
import { Util } from '../../src/util/util'

describe('ArtifactStackWorkflow', () => {
  describe('runCreateWorkflow', () => {
    it('success', done => {
      // Arrange
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      spyOn(ArtifactStackWorkflow, 'getTemplateFilePath').and.returnValue('dummy-path')
      spyOn(AwsWorkflow, 'stackCreationWorkflow').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(false))
      // Act
      const o = ArtifactStackWorkflow.runCreateWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('updateWorkflow', () => {
    it('success', (done) => {
      // Arrange
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      spyOn(ArtifactStackWorkflow, 'getTemplateFilePath').and.returnValue('dummy-path')
      spyOn(AwsWorkflow, 'stackUpdateWorkflow').and.returnValue(of(undefined))
      spyOn(ArtifactStackWorkflow, 'getArtifactBucketName').and.returnValue(of('dummy-artifact-bucket-name'))

      // Act
      const o = ArtifactStackWorkflow.updateWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('deleteWorkflow', () => {
    it('success', (done) => {
      // Arrange
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      spyOn(AwsWorkflow, 'stackDeletionWorkflow').and.returnValue(of(undefined))

      // Act
      const o = ArtifactStackWorkflow.deleteWorkflow()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('getArtifactBucketName', () => {
    it('success', (done) => {
      // Arrange
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValue(of({
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-bucket-name'
        }
      }))
      spyOn(S3Access, 'checkIfBucketExists').and.returnValue(of(true))

      // Act
      const o = ArtifactStackWorkflow.getArtifactBucketName()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual('dummy-bucket-name')
        done()
      })
    })

    it('bucket does not exist', (done) => {
      // Arrange
      spyOn(ProjectConfigUtil, 'getProjectName').and.returnValue('dummy-project-name')
      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValue(of({
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-bucket-name'
        }
      }))
      spyOn(S3Access, 'checkIfBucketExists').and.returnValue(of(false))
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const o = ArtifactStackWorkflow.getArtifactBucketName()

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  it('getTemplateFilePath', () => {
    // Arrange
    // Nothing to arrange

    // Act
    const result = ArtifactStackWorkflow.getTemplateFilePath()

    // Assert
    expect(result).toBeDefined()
  })
})
