import { Util } from '../../src/utils/util'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { DisplayableItemsHandler } from '../../src/handlers/get-displayable-items-response-handler'

describe('DisplayableItemsHandler', () => {
  describe('getDisplayableItemsResponseBuilder', () => {
    it('video id found', () => {
      // Arrange
      const event =
        {
          directive: {
            profile: null,
            payload: {
              minResultLimit: 1,
              entities: [
                {
                  externalIds: {
                    ontv: 'sample-id'
                  },
                  type: 'Video',
                  value: 'sample-video-name',
                  entityMetadata: null,
                  mergedGroupId: 1
                }
              ]
            },
            header: {
              payloadVersion: '3',
              messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetDisplayableItems',
              correlationToken: null
            }
          }
        }

      const projectName = 'test-project'

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
      getVideoIdsForMatchingVideosSpy.and.callFake((a, b, c, videoId) => {
        return [videoId]
      })

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.callFake(() => {
        return null
      })

      const expectedResults =
        {
          payload: {
            nextToken: null,
            mediaItems: [
              {
                mediaIdentifier: {
                  id: 'sample-id'
                }
              }
            ]
          }
        }

      // Act
      const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

      // Assert
      expect(result).toBeTruthy()
      expect(result.payload).toBeTruthy()
      expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
    })
  })

  it('actor and genre found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            entities: [
              {
                externalIds: null,
                type: 'Actor',
                value: 'sample-actor-name',
                entityMetadata: null,
                mergedGroupId: 0
              },
              {
                externalIds: null,
                type: 'Genre',
                value: 'sample-genre-name',
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-id']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-id'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('season and episode found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            entities: [
              {
                externalIds: null,
                type: 'Season',
                value: '1',
                entityMetadata: null,
                mergedGroupId: 0
              },
              {
                externalIds: null,
                type: 'Episode',
                value: '1',
                entityMetadata: null,
                mergedGroupId: 0
              },
              {
                externalIds: null,
                type: 'Video',
                value: 'sample-video-name',
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-id']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-id'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('channel found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            entities: [
              {
                externalIds: null,
                type: 'Channel',
                value: 'sample-channel-name',
                entityMetadata: { channelCallSign: 'sample-channel-call-sign' },
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-id']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-id'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('franchise found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            entities: [
              {
                externalIds: null,
                type: 'Franchise',
                value: 'sample-franchise-name',
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-id']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-id'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('recommended video found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            itemType: 'VIDEO',
            entities: [
              {
                externalIds: null,
                type: 'SortType',
                value: null,
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getRecommendedVideoSpy = spyOn(DatabaseGateway, 'getRecommendedVideo')
    getRecommendedVideoSpy.and.callFake(() => {
      return ['sample-id']
    })

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-id']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-id'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('categories found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            itemType: 'CATEGORY',
            entities: [
              {
                externalIds: null,
                type: 'SortType',
                value: 'sample-category-name',
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getRecommendedVideoSpy = spyOn(DatabaseGateway, 'getCategoryIds')
    getRecommendedVideoSpy.and.callFake(() => {
      return ['sample-category-id-0']
    })

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return ['sample-category-id-0']
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.returnValues(null)

    const expectedResults =
      {
        payload: {
          nextToken: null,
          mediaItems: [
            {
              mediaIdentifier: {
                id: 'sample-category-id-0'
              }
            }
          ]
        }
      }

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
  })

  it('no match found', () => {
    // Arrange
    const event =
      {
        directive: {
          profile: null,
          payload: {
            minResultLimit: 1,
            entities: [
              {
                externalIds: null,
                type: 'Franchise',
                value: 'sample-franchise-name',
                entityMetadata: null,
                mergedGroupId: 0
              }
            ]
          },
          header: {
            payloadVersion: '3',
            messageId: 'b303cc3c-570f-434d-b870-7f5096bb1fa5',
            namespace: 'Alexa.VideoContentProvider',
            name: 'GetDisplayableItems',
            correlationToken: null
          }
        }
      }

    const projectName = 'test-project'

    const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoIdsForMatchingVideos')
    getVideoIdsForMatchingVideosSpy.and.callFake(() => {
      return []
    })

    const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
    generateNextTokenSpy.and.callFake(() => {
      return null
    })

    // Act
    const result = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)

    // Assert
    expect(result).toBeTruthy()
    expect(result.payload).toBeTruthy()
    expect((result.payload.type)).toEqual('CONTENT_NOT_FOUND')
  })
})
