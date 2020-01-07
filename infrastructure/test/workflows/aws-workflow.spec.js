import { AwsSdkUtil } from '../../src/util/aws/aws-sdk-util'
import { of } from 'rxjs'
import { TestUtils } from '../test-utils'
import { AwsWorkflow } from '../../src/workflows/aws-workflow'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'
import { S3Access } from '../../src/access/aws/s3-access'
import { LambdaStackWorkflow } from '../../src/workflows/lambda-stack-workflow'
import { CognitoAccess } from '../../src/access/aws/cognito-access'
import { readFileSpy } from '../run'

describe('AwsWorkflow', () => {
  describe('emptyBucketWorkflow', () => {
    it('perform workflow (objects in bucket)', (done) => {
      // Arrange
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValues(of(TestUtils.s3ListObjectsResponse()), of({}))

      // Act
      const o = AwsWorkflow.emptyBucketWorkflow('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('perform workflow (empty bucket)', (done) => {
      // Arrange
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(TestUtils.s3ListObjectsResponseEmpty()))

      // Act
      const o = AwsWorkflow.emptyBucketWorkflow('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('stackCreationWorkflow', () => {
    it('perform workflow (stack does not exist, creation successful)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(false))
      readFileSpy.and.returnValue(undefined)
      const cloudFormationAccessCreateCloudFormationStackSpy = spyOn(CloudFormationAccess, 'createCloudFormationStack')
      cloudFormationAccessCreateCloudFormationStackSpy.and.returnValue(of(undefined))
      const cloudFormationWaitForStackStateSpy = spyOn(CloudFormationAccess, 'waitForStackState')
      cloudFormationWaitForStackStateSpy.and.returnValue(of('success'))
      const cloudFormationAccessGetStackStatusSpy = spyOn(CloudFormationAccess, 'getStackStatus')
      const stackDeletionWorkflowSpy = spyOn(AwsWorkflow, 'stackDeletionWorkflow')

      // Act
      const o = AwsWorkflow.stackCreationWorkflow('dummy-stack-name', 'dummy-parameters', 'template-template-path')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(readFileSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationAccessCreateCloudFormationStackSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationWaitForStackStateSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationAccessGetStackStatusSpy).toHaveBeenCalledTimes(0)
        expect(stackDeletionWorkflowSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })

    it('perform workflow (stack does not exist, creation failed)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(false))
      readFileSpy.and.returnValue(undefined)
      const cloudFormationAccessCreateCloudFormationStackSpy = spyOn(CloudFormationAccess, 'createCloudFormationStack')
      cloudFormationAccessCreateCloudFormationStackSpy.and.returnValue(of(undefined))
      const cloudFormationWaitForStackStateSpy = spyOn(CloudFormationAccess, 'waitForStackState')
      cloudFormationWaitForStackStateSpy.and.returnValue(of(undefined))
      const cloudFormationAccessGetStackStatusSpy = spyOn(CloudFormationAccess, 'getStackStatus')
      cloudFormationAccessGetStackStatusSpy.and.returnValue(of('ROLLBACK_COMPLETE'))
      const stackDeletionWorkflowSpy = spyOn(AwsWorkflow, 'stackDeletionWorkflow')
      stackDeletionWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const o = AwsWorkflow.stackCreationWorkflow('dummy-stack-name', 'dummy-parameters', 'template-template-path')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(readFileSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationAccessCreateCloudFormationStackSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationWaitForStackStateSpy).toHaveBeenCalledTimes(1)
        expect(cloudFormationAccessGetStackStatusSpy).toHaveBeenCalledTimes(1)
        expect(stackDeletionWorkflowSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('perform workflow (stack exists)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(true))
      const cloudFormationAccessCreateCloudFormationStackSpy = spyOn(CloudFormationAccess, 'createCloudFormationStack')
      const cloudFormationAccessGetStackStatusSpy = spyOn(CloudFormationAccess, 'getStackStatus')
      const stackDeletionWorkflowSpy = spyOn(AwsWorkflow, 'stackDeletionWorkflow')
      const cloudFormationWaitForStackStateSpy = spyOn(CloudFormationAccess, 'waitForStackState')

      // Act
      const o = AwsWorkflow.stackCreationWorkflow('dummy-stack-name', 'dummy-parameters', 'template-template-path')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(readFileSpy).toHaveBeenCalledTimes(0)
        expect(cloudFormationAccessCreateCloudFormationStackSpy).toHaveBeenCalledTimes(0)
        expect(cloudFormationWaitForStackStateSpy).toHaveBeenCalledTimes(0)
        expect(cloudFormationAccessGetStackStatusSpy).toHaveBeenCalledTimes(0)
        expect(stackDeletionWorkflowSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })
  })

  describe('stackUpdateWorkflow', () => {
    it('perform workflow (stack exists)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(true))
      readFileSpy.and.returnValue(undefined)
      spyOn(CloudFormationAccess, 'createChangeSet').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'waitForChangeSetState').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'executeChangeSet').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'waitForStackState').and.returnValue(of(undefined))

      // Act
      const o = AwsWorkflow.stackUpdateWorkflow('dummy-stack-name', 'dummy-parameters', 'template-template-path')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('perform workflow (stack does not exist)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(false))

      // Act
      const o = AwsWorkflow.stackUpdateWorkflow('dummy-stack-name', 'dummy-parameters', 'template-template-path')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('stackDeletionWorkflow', () => {
    it('perform workflow (stack exists)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(true))
      spyOn(AwsWorkflow, 'emptyStackBucketsWorkflow').and.returnValue(of(undefined))
      spyOn(AwsWorkflow, 'emptyCognitoConfigsWorkflow').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'deleteCloudFormationStack').and.returnValue(of(undefined))
      spyOn(CloudFormationAccess, 'waitForStackState').and.returnValue(of(undefined))

      // Act
      const o = AwsWorkflow.stackDeletionWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('perform workflow (stack does not exist)', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'checkStackExists').and.returnValue(of(false))

      // Act
      const o = AwsWorkflow.stackDeletionWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('emptyStackBucketsWorkflow', () => {
    it('success', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'getResourcesOfType').and.returnValue(of(
        [
          { PhysicalResourceId: 'dummy-0' },
          { PhysicalResourceId: 'dummy-1' },
          { PhysicalResourceId: 'dummy-2' }
        ]
      ))
      spyOn(S3Access, 'checkIfBucketExists').and.returnValue(of(true))
      spyOn(AwsWorkflow, 'emptyBucketWorkflow').and.returnValue(of(undefined))

      // Act
      const o = AwsWorkflow.emptyStackBucketsWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('no buckets', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'getResourcesOfType').and.returnValue(of(
        []
      ))

      // Act
      const o = AwsWorkflow.emptyStackBucketsWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('buckets do not exist', (done) => {
      // Arrange
      spyOn(CloudFormationAccess, 'getResourcesOfType').and.returnValue(of(
        [
          { PhysicalResourceId: 'dummy-0' },
          { PhysicalResourceId: 'dummy-1' },
          { PhysicalResourceId: 'dummy-2' }
        ]
      ))
      spyOn(S3Access, 'checkIfBucketExists').and.returnValue(of(false))

      // Act
      const o = AwsWorkflow.emptyStackBucketsWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })

  describe('emptyCognitoConfigsWorkflow', () => {
    it('success', (done) => {
      // Arrange
      spyOn(LambdaStackWorkflow, 'getDomain').and.returnValue('dummy-domain')
      spyOn(LambdaStackWorkflow, 'getStackName').and.returnValue('dummy-stack-name')
      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValue(of({
        StackResourceDetail: { PhysicalResourceId: 'dummy-id' }
      }))
      spyOn(CognitoAccess, 'describeUserPool').and.returnValue(of({
        UserPool: {
          Domain: 'dummy-domain'
        }
      }))
      spyOn(CognitoAccess, 'deleteUserPoolDomain').and.returnValue(of(undefined))

      // Act
      const o = AwsWorkflow.emptyCognitoConfigsWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('not lambda stack', (done) => {
      // Arrange
      spyOn(LambdaStackWorkflow, 'getDomain').and.returnValue('dummy-domain')
      spyOn(LambdaStackWorkflow, 'getStackName').and.returnValue('dummy-stack-name')

      // Act
      const o = AwsWorkflow.emptyCognitoConfigsWorkflow('another-dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })

    it('user pool domain does not exist', (done) => {
      // Arrange
      spyOn(LambdaStackWorkflow, 'getDomain').and.returnValue('dummy-domain')
      spyOn(LambdaStackWorkflow, 'getStackName').and.returnValue('dummy-stack-name')
      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValue(of({
        StackResourceDetail: { PhysicalResourceId: 'dummy-id' }
      }))
      spyOn(CognitoAccess, 'describeUserPool').and.returnValue(of({}))

      // Act
      const o = AwsWorkflow.emptyCognitoConfigsWorkflow('dummy-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        done()
      })
    })
  })
})
