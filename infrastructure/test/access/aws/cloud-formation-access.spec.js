import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import { CloudFormationAccess } from '../../../src/access/aws/cloud-formation-access'
import { TestUtils } from '../../test-utils'
import { of } from 'rxjs'

describe('CloudFormationAccess', () => {
  describe('describeStackResource', () => {
    it('success', (done) => {
      // Arrange
      const expectedResults = {}
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CloudFormationAccess.describeStackResource('dummy-stack-name', 'dummy-logical-resource-id')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        done()
      })
    })
  })

  it('executeChangeSet', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.executeChangeSet('dummy-stack-name', 'dummy-change-set-name')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('waitForChangeSetState', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.waitForChangeSetState('dummy-stack-name', 'dummy-change-set-name', 'dummy-state')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('createChangeSet', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.createChangeSet('dummy-stack-name', 'dummy-parameters', 'dummy-template-contents', 'dummy-change-set-name')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('describeStackResources', (done) => {
    // Arrange
    const expectedResults = TestUtils.cloudFormationDescribeStackResourcesResponse()
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.describeStackResources('dummy-stack-name')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('getResourcesOfType', (done) => {
    // Arrange
    const expectedResults = TestUtils.cloudFormationDescribeStackResourcesResponse()
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.getResourcesOfType('dummy-stack-name', 'AWS::Cognito::UserPool')

    // Assert
    o.subscribe(results => {
      expect(results.length).toEqual(1)
      done()
    })
  })

  it('waitForStackState', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.waitForStackState('dummy-stack-name', 'dummy-state')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('listStacks', (done) => {
    // Arrange
    const expectedResults = TestUtils.cloudFormationListStacksResponse()
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.listStacks()

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('deleteCloudFormationStack', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.deleteCloudFormationStack('dummy-stack-name')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('createCloudFormationStack', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = CloudFormationAccess.createCloudFormationStack('dummy-stack-name', {}, 'dummy-template-contents')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  describe('checkStackExists', () => {
    it('checkStackExists exists', (done) => {
      // Arrange
      const expectedResults = {}
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CloudFormationAccess.checkStackExists('test-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(true)
        done()
      })
    })

    it('checkStackExists does not exist', (done) => {
      // Arrange
      const expectedResults = null
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CloudFormationAccess.checkStackExists('test-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(false)
        done()
      })
    })
  })

  describe('getStackStatus', () => {
    it('getStackStatus stack exists', (done) => {
      // Arrange
      const expectedResults = { Stacks: [{ StackStatus: `ROLLBACK_COMPLETE` }] }
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CloudFormationAccess.getStackStatus('test-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual('ROLLBACK_COMPLETE')
        done()
      })
    })

    it('getStackStatus stack does not exist', (done) => {
      // Arrange
      const expectedResults = { Stacks: [] }
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = CloudFormationAccess.getStackStatus('test-stack-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(undefined)
        done()
      })
    })
  })
})
