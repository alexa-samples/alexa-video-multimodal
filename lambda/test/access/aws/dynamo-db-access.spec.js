import { DynamoDbAccess } from '../../../src/access/aws/dynamo-db-access'
import DynamoDB from 'aws-sdk/clients/dynamodb'

describe('DynamoDbAccess', () => {
  beforeEach(() => {
    DynamoDbAccess.ddb = new DynamoDB()
  })

  describe('getItem', () => {
    it('getItem Success', done => {
      // Arrange
      const tableName = 'dummy-table-name'
      const key = {
        dummyItemKey: { S: 'dummy-item-value' }
      }

      const mockResponse =
        {
          Item: {
            data:
              {
                S: 'sample-video-id-0,sample-video-id-1'
              }
          }
        }

      const getItemSpy = spyOn(DynamoDbAccess.ddb, 'getItem')
      getItemSpy.and.returnValue({
        promise: () => {
          return Promise.resolve(mockResponse)
        }
      })

      // Act
      const p = DynamoDbAccess.getItem(key, tableName)

      // Assert
      p
        .then(data => {
          expect(data).toEqual(mockResponse)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('batchGetItem', () => {
    it('batchGetItem Success', done => {
      // Arrange
      const tableName = 'dummy-table-name'
      const keys = [{
        userId: { S: 'dummy-user-name' },
        videoId: { S: 'dummy-video-id' }
      }]

      const mockResponse = {}
      const batchGetItemSpy = spyOn(DynamoDbAccess.ddb, 'batchGetItem')
      batchGetItemSpy.and.returnValue({
        promise: () => {
          return Promise.resolve(mockResponse)
        }
      })

      // Act
      const p = DynamoDbAccess.batchGetItem(keys, tableName)

      // Assert
      p
        .then(data => {
          expect(data).toEqual(mockResponse)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })

  describe('putItem', () => {
    it('putItem Success', done => {
      // Arrange
      const tableName = 'dummy-table-name'
      const item = {
        token: { S: 'dummy-token' },
        ttl: { N: 123 + '' },
        data: { S: 'dummy-data' }
      }

      const mockResponse = {}

      const putItemSpy = spyOn(DynamoDbAccess.ddb, 'putItem')
      putItemSpy.and.returnValue({
        promise: () => {
          return Promise.resolve(mockResponse)
        }
      })

      // Act
      const p = DynamoDbAccess.putItem(item, tableName)

      // Assert
      p
        .then(data => {
          expect(data).toEqual(mockResponse)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
