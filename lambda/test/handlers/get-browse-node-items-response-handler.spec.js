import { Util } from '../../src/utils/util'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { BrowseNodeItemsHandler } from '../../src/handlers/get-browse-node-items-response-handler'

describe('BrowseNodeItemsHandler', () => {
  describe('getBrowseNodeItemsResponseBuilder', () => {
    it('videos found', () => {
      // Arrange
      const event =
        {
          directive: {
            profile: null,
            payload: {
              minResultLimit: 1,
              nextToken: 'sample-next-token',
              mediaIdentifier: {
                id: 'sample-category-id'
              }
            },
            header: {
              payloadVersion: '3',
              messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetBrowseNodeItems',
              correlationToken: null
            }
          }
        }

      const projectName = 'test-project'

      const getItemsForTokenSpy = spyOn(DatabaseGateway, 'getVideosByCategoryId')
      getItemsForTokenSpy.and.returnValue(['sample-video-id'])

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValues(null)

      const expectedResults =
        {
          payload: {
            nextToken: null,
            mediaItems: [
              {
                mediaIdentifier: {
                  id: 'sample-video-id'
                }
              }
            ]
          }
        }

      // Act
      const result = BrowseNodeItemsHandler.getBrowseNodeItemsResponseBuilder(event, projectName)
      // Assert
      expect(getItemsForTokenSpy).toHaveBeenCalledTimes(1)
      expect(result).toBeTruthy()
      expect(result.payload).toBeTruthy()
      expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
    }
    )
  })
})
