import { DynamoDbAccess } from '../../src/access/aws/dynamo-db-access'
import { PaginationTokenDbGateway } from '../../src/gateway/pagination-token-db-gateway'

describe('PaginationTokenDbGateway', () => {
  describe('getPaginationTokenItems', () => {
    it('success', done => {
      // Arrange
      const mockResponse =
        {
          Item: {
            data:
              {
                S: 'sample-video-id-0,sample-video-id-1'
              }
          }
        }
      const getItemSpy = spyOn(DynamoDbAccess, 'getItem')
      getItemSpy.and.returnValue(Promise.resolve(mockResponse))

      // Act
      const p = PaginationTokenDbGateway.getPaginationTokenItems('dummy-token', 'dummy-project-name')

      // Assert
      p.then(data => {
        expect(data).toEqual(['sample-video-id-0', 'sample-video-id-1'])
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure - bad response', done => {
      // Arrange
      const mockResponse =
        {}
      const getItemSpy = spyOn(DynamoDbAccess, 'getItem')
      getItemSpy.and.returnValue(Promise.resolve(mockResponse))

      // Act
      const p = PaginationTokenDbGateway.getPaginationTokenItems('dummy-token', 'dummy-project-name')

      // Assert
      p.then(data => {
        expect(data).toEqual([])
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure - failed request', done => {
      // Arrange
      const errorObject = new Error('dummy-error')
      const getItemSpy = spyOn(DynamoDbAccess, 'getItem')
      getItemSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const p = PaginationTokenDbGateway.getPaginationTokenItems('dummy-token', 'dummy-project-name')

      // Assert
      p.then(data => {
        expect(data).toBeUndefined()
        done()
      })
    })
  })
  describe('putPaginationTokenItem', () => {
    it('success', done => {
      // Arrange
      const mockResponse = {}
      const putItemSpy = spyOn(DynamoDbAccess, 'putItem')
      putItemSpy.and.returnValue(Promise.resolve(mockResponse))

      // Act
      const p = PaginationTokenDbGateway.putPaginationTokenItem('dummy-token', 300, ['sample-video-id-0', 'sample-video-id-1'], 'dummy-project-name')

      // Assert
      p.then(data => {
        expect(data).toEqual(mockResponse)
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })
    it('failure - failed request', done => {
      // Arrange
      const putItemSpy = spyOn(DynamoDbAccess, 'putItem')
      const errorObject = new Error('dummy-error')
      putItemSpy.and.returnValue(Promise.reject(errorObject))

      // Act
      const p = PaginationTokenDbGateway.putPaginationTokenItem('dummy-token', 300, ['sample-video-id-0', 'sample-video-id-1'], 'dummy-project-name')

      // Assert
      p.then(data => {
        expect(data).toBeUndefined()
        done()
      })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
