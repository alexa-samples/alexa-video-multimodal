import S3 from 'aws-sdk/clients/s3'
import { S3Access } from '../../../src/access/aws/s3-access'

describe('S3Access', () => {
  afterEach(() => {
    S3Access.s3 = undefined
  })

  describe('getSignedUrl', () => {
    it('success', () => {
      const dummySignedUrl = 'dummy-signed-url'
      const s3 = new S3()
      const getSignedUrlSpy = spyOn(s3, 'getSignedUrl')
      getSignedUrlSpy.and.returnValue(dummySignedUrl)
      S3Access.s3 = s3

      // Act
      const result = S3Access.getSignedUrl('dummy-bucket', 'dummy-key')

      // Assert
      expect(result).toEqual(dummySignedUrl)
    })
  })
})
