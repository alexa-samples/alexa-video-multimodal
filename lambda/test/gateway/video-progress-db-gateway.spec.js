import { DynamoDbAccess } from '../../src/access/aws/dynamo-db-access'
import { VideoProgressDbGateway } from '../../src/gateway/video-progress-db-gateway'

describe('VideoProgressDbGateway', () => {
  describe('updateVideoProgress', () => {
    it('success', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const userId = 'dummy-user-id'
      const videoId = 'dummy-video-id'
      const positionInMilliseconds = 123456

      const putItemSpy = spyOn(DynamoDbAccess, 'putItem')
      putItemSpy.and.returnValue(Promise.resolve({}))

      // Act
      const p = VideoProgressDbGateway.updateVideoProgress(projectName, userId, videoId, positionInMilliseconds)

      p
        .then(result => {
          expect(result).toEqual({})
          expect(putItemSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('fail', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const userId = 'dummy-user-id'
      const videoId = 'dummy-video-id'
      const positionInMilliseconds = 123456

      const putItemSpy = spyOn(DynamoDbAccess, 'putItem')
      putItemSpy.and.returnValue(Promise.reject(new Error('dummy-error')))

      // Act
      const p = VideoProgressDbGateway.updateVideoProgress(projectName, userId, videoId, positionInMilliseconds)

      p
        .then(result => {
          expect(result).toBeUndefined()
          expect(putItemSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
  it('getProgressForVideos', done => {
    // Arrange
    const projectName = 'dummy-project-name'
    const userId = 'dummy-user-id'
    const videoIds = ['dummy-video-id-0', 'dummy-video-id-1']

    const batchGetItemSpy = spyOn(DynamoDbAccess, 'batchGetItem')
    batchGetItemSpy.and.returnValue(Promise.resolve({
      Responses: {
        'dummy-project-name-video-progress-table': [
          {
            videoId: {
              S: 'dummy-video-id-0'
            },
            positionInMilliseconds: {
              N: 123456
            }
          }
        ]
      }
    }))

    // Act
    const p = VideoProgressDbGateway.getProgressForVideos(projectName, userId, videoIds)

    p
      .then(result => {
        expect(result).toEqual({
          'dummy-video-id-0': 123456
        })
        expect(batchGetItemSpy).toHaveBeenCalledTimes(1)
        done()
      })
      .catch(err => {
        done.fail(err)
      })
  })
})
