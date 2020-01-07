import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { Util } from '../../src/utils/util'
import { PlayableItemsMetadataHandler } from '../../src/handlers/get-playable-items-metadata-response-handler'
import { UserUtil } from '../../src/utils/user-util'
import { of } from 'rxjs'

describe('PlayableItemsMetadataHandler', () => {
  describe('getPlayableItemsMetadataResponseBuilder', () => {
    it('video id found', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifier: {
                id: 'sample-video-id-1'
              }
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetPlayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataById')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve({
        name: 'sample-video-name-1',
        contentType: 'ON_DEMAND',
        videoUrl: 'sample-url',
        parentalControl: 'NOT_REQUIRED',
        absoluteViewingPositionMilliseconds: 0,
        contentDescription: 'movie'
      }))

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')
      getPlaybackContextTokenSpy.and.callFake(() => {
        return JSON.stringify({ videoUrl: 'sample-url' })
      })

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(of('dummy-customer-id'))

      const expectedResults =
        {
          payload: {
            searchResults: [
              {
                name: 'sample-video-name-1',
                contentType: 'ON_DEMAND',
                playbackContextToken: JSON.stringify({ videoUrl: 'sample-url' }),
                parentalControl: {
                  pinControl: 'NOT_REQUIRED'
                },
                absoluteViewingPositionMilliseconds: 0
              }
            ]
          }
        }

      // Act
      const p = PlayableItemsMetadataHandler.getPlayableItemsMetadataResponseBuilder(event, {}, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('series id found', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifier: {
                id: 'sample-video-id-1'
              }
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetPlayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getPreviousEpisodeSpy = spyOn(DatabaseGateway, 'getPreviousEpisodeVideoMetadata')
      getPreviousEpisodeSpy.and.returnValue(null)

      const getNextEpisodeSpy = spyOn(DatabaseGateway, 'getNextEpisodeVideoMetadata')
      getNextEpisodeSpy.and.returnValue(null)

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataById')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve({
        name: 'sample-series-name-1',
        contentType: 'ON_DEMAND',
        videoUrl: 'sample-url',
        parentalControl: 'NOT_REQUIRED',
        absoluteViewingPositionMilliseconds: 0,
        contentDescription: 'series',
        seasonNumber: '1',
        episodeNumber: '1',
        episodeName: 'sample-episode-name-1'
      }))

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')
      getPlaybackContextTokenSpy.and.callFake(() => {
        return JSON.stringify({ videoUrl: 'sample-url' })
      })

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(of('dummy-customer-id'))

      const expectedResults =
        {
          payload: {
            searchResults: [
              {
                name: 'sample-series-name-1',
                contentType: 'ON_DEMAND',
                series: {
                  seasonNumber: '1',
                  episodeNumber: '1',
                  seriesName: 'sample-series-name-1',
                  episodeName: 'sample-episode-name-1'
                },
                playbackContextToken: JSON.stringify({ videoUrl: 'sample-url' }),
                parentalControl: {
                  pinControl: 'NOT_REQUIRED'
                },
                absoluteViewingPositionMilliseconds: 0
              }
            ]
          }
        }

      // Act
      const p = PlayableItemsMetadataHandler.getPlayableItemsMetadataResponseBuilder(event, {}, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
          expect(getPreviousEpisodeSpy).toHaveBeenCalledTimes(1)
          expect(getNextEpisodeSpy).toHaveBeenCalledTimes(1)
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('channel id found', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifier: {
                id: 'sample-channel-id-1'
              }
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetPlayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataById')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve({
        name: 'sample-channel-name-1',
        contentType: 'ON_DEMAND',
        videoUrl: 'sample-url',
        parentalControl: 'NOT_REQUIRED',
        absoluteViewingPositionMilliseconds: 0,
        contentDescription: 'channel',
        networkDetails: {
          callSign: 'sample-channel-call-sign'
        }
      }))

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')
      getPlaybackContextTokenSpy.and.callFake(() => {
        return JSON.stringify({ videoUrl: 'sample-url' })
      })

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(of('dummy-customer-id'))

      const expectedResults =
        {
          channel: {
            callSign: 'sample-channel-call-sign'
          }
        }

      // Act
      const p = PlayableItemsMetadataHandler.getPlayableItemsMetadataResponseBuilder(event, {}, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload.searchResults[0].networkDetails[0]).toBeTruthy()
          expect(result.payload.searchResults[0].networkDetails[0].channel.callSign).toEqual(expectedResults.channel.callSign)
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })

    it('id not found', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event =
        {
          directive: {
            profile: null,
            payload: {
              locale: 'en-US',
              mediaIdentifier: {
                id: 'sample-video-id-1'
              }
            },
            header: {
              payloadVersion: '3',
              messageId: 'e1af16a8-38db-46a7-b247-0da2d594c5ef',
              namespace: 'Alexa.VideoContentProvider',
              name: 'GetPlayableItemsMetadata',
              correlationToken: null
            }
          }
        }

      const getVideoIdsForMatchingVideosSpy = spyOn(DatabaseGateway, 'getVideoMetadataById')
      getVideoIdsForMatchingVideosSpy.and.returnValue(Promise.resolve(null))

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      const getPlaybackContextTokenSpy = spyOn(Util, 'getPlaybackContextToken')

      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(of('dummy-customer-id'))

      const expectedResults =
        {
          payload: {
            searchResults: []
          }
        }

      // Act
      const p = PlayableItemsMetadataHandler.getPlayableItemsMetadataResponseBuilder(event, {}, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeTruthy()
          expect(result.payload).toBeTruthy()
          expect(JSON.stringify(result.payload)).toEqual(JSON.stringify(expectedResults.payload))
          expect(generateNextTokenSpy).not.toHaveBeenCalled()
          expect(getPlaybackContextTokenSpy).not.toHaveBeenCalled()
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
