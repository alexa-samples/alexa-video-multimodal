import { S3Access } from '../../../src/access/aws/s3-access'
import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import { of } from 'rxjs'
import { TestUtils } from '../../test-utils'

describe('S3Access', () => {
  describe('getBucketLocation', () => {
    it('success', (done) => {
      // Arrange
      const expectedResults = TestUtils.s3GetBucketLocationResponse()
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = S3Access.getBucketLocation('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        done()
      })
    })
  })

  it('listObjects', (done) => {
    // Arrange
    const expectedResults = TestUtils.s3ListObjectsResponse()
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = S3Access.listObjects('dummy-bucket', '/qwertyuioiuytre')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('deleteObjects', (done) => {
    // Arrange
    const expectedResults = TestUtils.s3DeleteObjectsResponse()
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = S3Access.deleteObjects('dummy-bucket', {})

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  describe('checkIfBucketExists', () => {
    it('bucket exists', (done) => {
      // Arrange
      const expectedResults = TestUtils.s3GetBucketLocationResponse()
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = S3Access.checkIfBucketExists('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(true)
        done()
      })
    })

    it('bucket does not exist', (done) => {
      // Arrange
      const expectedResults = null
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = S3Access.checkIfBucketExists('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(false)
        done()
      })
    })
  })

  it('getBucketTagging', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = S3Access.getBucketTagging('dummy-bucket')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('putBucketTagging', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = S3Access.putBucketTagging('dummy-bucket', [])

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })
})
