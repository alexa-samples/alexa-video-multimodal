import { Util } from '../../src/utils/util'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { NextPageHandler } from '../../src/handlers/get-next-page-response-handler'

describe('NextPageHandler', () => {
  describe('getNextPageResponseBuilder', () => {
    it('next page found', () => {
      // Arrange
      const event =
        {
          directive: {
            profile: null,
            payload: {
              minResultLimit: 1,
              nextToken: 'sample-next-token',
              entities: null
            },
            header: {
              payloadVersion: '3',
              messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetNextPage',
              correlationToken: null
            }
          }
        }

      const projectName = 'test-project'

      const getItemsForTokenSpy = spyOn(DatabaseGateway, 'getItemsForToken')
      getItemsForTokenSpy.and.returnValue(Promise.resolve(['sample-video-id']))

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
      NextPageHandler.getNextPageResponseBuilder(event, projectName).then(
        (result) => {
          // Assert
          expect(getItemsForTokenSpy).toHaveBeenCalledTimes(1)
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
        }
      )
    })
  })
})
