import { DisplayableItemsMetadataHandler } from '../../src/handlers/get-displayable-items-metadata-response-handler'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { VideoMetadata } from '../../src/models/database-models/video-metadata'
import { ThumbnailSource } from '../../src/models/get-displayable-items-metadata/thumbnail-source'
import { CategoryMetadata } from '../../src/models/database-models/category-metadata'
import { Util } from '../../src/utils/util'

describe('DisplayableItemsMetadataHandler', () => {
  describe('getDisplayableItemsMetadataResponseBuilder', () => {
    it('video found', done => {
      // Arrange
      const projectName = 'dummy-projcet-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifiers: [
                { id: 'sample-video-id-1' },
                { id: 'sample-category-id-1' }
              ]
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetDisplayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataByIds')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve([new VideoMetadata(
        {
          name: 'sample-video-name-1',
          contentType: 'ON_DEMAND',
          videoUrl: 'sample-url',
          parentalControl: 'NOT_REQUIRED',
          absoluteViewingPositionMilliseconds: 0,
          contentDescription: 'movie',
          thumbnailImageSources: [new ThumbnailSource('sample-url', 'SMALL', 1028, 720)]
        })]
      ))

      const getCategoryMetadataByIdsSpy = spyOn(DatabaseGateway, 'getCategoryMetadataByIds')
      getCategoryMetadataByIdsSpy.and.returnValue([new CategoryMetadata(
        {
          name: 'sample-category-name-1',
          contentType: 'ON_DEMAND',
          itemType: 'NOT_REQUIRED',
          id: 'sample-category-id-1'
        })]
      )

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const mapDatabaseResultToModelObjectSpy = spyOn(Util, 'mapDatabaseResultToModelObject')
      mapDatabaseResultToModelObjectSpy.and.returnValue(null)

      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')
      getPlaybackContextTokenSpy.and.callFake(() => {
        return JSON.stringify({ videoUrl: 'sample-url' })
      })

      const expectedResults =
        {
          payload: {
            searchResults: [
              {
                name: 'sample-video-name-1'
              },
              {
                name: 'sample-category-name-1'
              }
            ]
          }
        }

      // Act
      const p = DisplayableItemsMetadataHandler.getDisplayableItemsMetadataResponseBuilder(event, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(result.payload.searchResults[0].name).toEqual(expectedResults.payload.searchResults[0].name)
          expect(result.payload.searchResults[1].name).toEqual(expectedResults.payload.searchResults[1].name)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('series found', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifiers: [
                { id: 'sample-series-id-1' }
              ]
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetDisplayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataByIds')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve(([{
        name: 'sample-series-name-1',
        contentType: 'ON_DEMAND',
        videoUrl: 'sample-url',
        parentalControl: 'NOT_REQUIRED',
        absoluteViewingPositionMilliseconds: 0,
        contentDescription: 'series',
        thumbnailImageSources: []
      }])))

      const getCategoryMetadataByIdsSpy = spyOn(DatabaseGateway, 'getCategoryMetadataByIds')
      getCategoryMetadataByIdsSpy.and.returnValue([])

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const mapDatabaseResultToModelObjectSpy = spyOn(Util, 'mapDatabaseResultToModelObject')
      mapDatabaseResultToModelObjectSpy.and.returnValue(null)

      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')
      getPlaybackContextTokenSpy.and.callFake(() => {
        return JSON.stringify({ videoUrl: 'sample-url' })
      })

      const expectedResults =
        {
          payload: {
            searchResults: [
              {
                name: 'sample-series-name-1'
              }
            ]
          }
        }

      // Act
      const p = DisplayableItemsMetadataHandler.getDisplayableItemsMetadataResponseBuilder(event, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(result.payload.searchResults[0].name).toEqual(expectedResults.payload.searchResults[0].name)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
