import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { Util } from '../../src/utils/util'
import { InMemoryDatabaseAccess } from '../../src/access/in-memmory-db-access'
import { PaginationTokenDbGateway } from '../../src/gateway/pagination-token-db-gateway'

describe('DatabaseGateway', () => {
  it('putItemsForToken', () => {
    // Arrange
    const token = 'dummy-token'
    const data = {}
    const projectName = 'dummy-project-name'

    const putPaginationTokenItemSpy = spyOn(PaginationTokenDbGateway, 'putPaginationTokenItem')
    putPaginationTokenItemSpy.and.returnValue(undefined)

    // Act
    const result = DatabaseGateway.putItemsForToken(token, data, projectName)

    // Assert
    expect(result).toBeUndefined()
    expect(putPaginationTokenItemSpy).toHaveBeenCalledWith(token, jasmine.any(Number), data, projectName)
  })

  it('getItemsForToken', () => {
    // Arrange
    const token = 'dummy-token'
    const projectName = 'dummy-project-name'

    const getPaginationTokenItemsSpy = spyOn(PaginationTokenDbGateway, 'getPaginationTokenItems')
    getPaginationTokenItemsSpy.and.returnValue(undefined)

    // Act
    const result = DatabaseGateway.getItemsForToken(token, projectName)

    // Assert
    expect(result).toBeUndefined()
    expect(getPaginationTokenItemsSpy).toHaveBeenCalledWith(token, projectName)
  })

  it('getRecommendedVideo', () => {
    // Arrange
    const searchDatabaseByGenreNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByGenreName')
    searchDatabaseByGenreNameSpy.and.returnValue(['dummy-video-metadata'])

    // Act
    const result = DatabaseGateway.getRecommendedVideo()

    // Assert
    expect(result).toEqual('dummy-video-metadata')
    expect(searchDatabaseByGenreNameSpy).toHaveBeenCalledWith('comedy')
  })

  it('getVideosByCategoryId', () => {
    // Arrange
    const searchDatabaseForVideoIdsByCategorySpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseForVideoIdsByCategory')
    searchDatabaseForVideoIdsByCategorySpy.and.returnValue('dummy-result')

    // Act
    const result = DatabaseGateway.getVideosByCategoryId('dummy-category-id')

    // Assert
    expect(result).toEqual('dummy-result')
    expect(searchDatabaseForVideoIdsByCategorySpy).toHaveBeenCalledWith('dummy-category-id')
  })

  it('getCategoryIds', () => {
    // Arrange
    const searchDatabaseForAllCategoryIdsSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseForAllCategoryIds')
    searchDatabaseForAllCategoryIdsSpy.and.returnValue(['dummy-result'])

    // Act
    const result = DatabaseGateway.getCategoryIds()

    // Assert
    expect(result).toEqual(['dummy-result'])
    expect(searchDatabaseForAllCategoryIdsSpy).toHaveBeenCalledWith()
  })

  it('getCategoryMetadataByIds', () => {
    // Arrange
    const searchDatabaseByCategorySpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByCategory')
    searchDatabaseByCategorySpy.and.returnValue(['dummy-result'])

    // Act
    const result = DatabaseGateway.getCategoryMetadataByIds(['dummy-id'])

    // Assert
    expect(result).toEqual(['dummy-result'])
    expect(searchDatabaseByCategorySpy).toHaveBeenCalledWith(['dummy-id'])
  })

  it('getVideoMetadataByIds', done => {
    // Arrange
    const searchDatabaseByIdForMetadataSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByIdsForVideoMetadata')
    searchDatabaseByIdForMetadataSpy.and.returnValue(['dummy-result'])

    const signVideoMetadataUrlsSpy = spyOn(Util, 'signVideoMetadataUrls')
    signVideoMetadataUrlsSpy.and.returnValue(['dummy-result'])

    const setVideoProgressTimeSpy = spyOn(Util, 'setVideoProgressTime')
    setVideoProgressTimeSpy.and.returnValue(Promise.resolve(['dummy-result']))

    // Act
    const p = DatabaseGateway.getVideoMetadataByIds(['dummy-id'], 'dummy-access-token', 'dummy-projectname')

    // Assert
    p
      .then(result => {
        expect(result).toEqual(['dummy-result'])
        expect(searchDatabaseByIdForMetadataSpy).toHaveBeenCalledWith(['dummy-id'])
        expect(signVideoMetadataUrlsSpy).toHaveBeenCalledWith(['dummy-result'])
        expect(setVideoProgressTimeSpy).toHaveBeenCalledTimes(1)
        done()
      })
      .catch(done.fail)
  })

  describe('getVideoMetadataById', () => {
    it('match', done => {
      // Arrange
      const searchDatabaseByIdForVideoMetadataSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByIdForVideoMetadata')
      searchDatabaseByIdForVideoMetadataSpy.and.returnValue('dummy-result')

      const signVideoMetadataUrlsSpy = spyOn(Util, 'signVideoMetadataUrls')
      signVideoMetadataUrlsSpy.and.returnValue(['dummy-result'])

      const setVideoProgressTimeSpy = spyOn(Util, 'setVideoProgressTime')
      setVideoProgressTimeSpy.and.returnValue(Promise.resolve(['dummy-result']))

      // Act
      const p = DatabaseGateway.getVideoMetadataById('dummy-id', 'dummy-access-token', 'dummy-project-name')

      // Assert
      p
        .then(result => {
          expect(result).toEqual('dummy-result')
          expect(searchDatabaseByIdForVideoMetadataSpy).toHaveBeenCalledWith('dummy-id')
          expect(signVideoMetadataUrlsSpy).toHaveBeenCalledWith(['dummy-result'])
          expect(setVideoProgressTimeSpy).toHaveBeenCalledTimes(1)
          done()
        })
    })

    it('no match', done => {
      // Arrange
      const searchDatabaseByIdForVideoMetadataSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByIdForVideoMetadata')
      searchDatabaseByIdForVideoMetadataSpy.and.returnValue(null)

      const signVideoMetadataUrlsSpy = spyOn(Util, 'signVideoMetadataUrls')
      const setVideoProgressTimeSpy = spyOn(Util, 'setVideoProgressTime')

      // Act
      const p = DatabaseGateway.getVideoMetadataById('dummy-id', 'dummy-access-token', 'dummy-project-name')

      // Assert
      p
        .then(result => {
          expect(result).toEqual(null)
          expect(searchDatabaseByIdForVideoMetadataSpy).toHaveBeenCalledWith('dummy-id')
          expect(signVideoMetadataUrlsSpy).not.toHaveBeenCalled()
          expect(setVideoProgressTimeSpy).not.toHaveBeenCalled()
          done()
        })
    })
  })

  describe('getVideoIdsForMatchingVideos', () => {
    it('movie search', () => {
      // Arrange
      const videoName = 'dummy-video-name'
      const genreName = 'dummy-genre-name'
      const actorName = 'dummy-actor-name'
      const videoId = 'dummy-video-id'
      const channelCallSign = 'dummy-channel-call-sign'
      const seasonNumber = undefined
      const episodeNumber = undefined

      const searchDatabaseByVideoIdSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoId')
      searchDatabaseByVideoIdSpy.and.returnValue(['dummy-result-0', 'dummy-result-1'])

      const searchDatabaseByVideoNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoName')
      searchDatabaseByVideoNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-2'])

      const searchDatabaseByGenreNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByGenreName')
      searchDatabaseByGenreNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-3'])

      const searchDatabaseByActorNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByActorName')
      searchDatabaseByActorNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseByChannelCallSignSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByChannelCallSign')
      searchDatabaseByChannelCallSignSpy.and.returnValue(['dummy-result-0', 'dummy-result-5'])

      const searchDatabaseBySeasonAndEpisodeSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeasonAndEpisode')
      searchDatabaseBySeasonAndEpisodeSpy.and.returnValue(['dummy-result-0', 'dummy-result-6'])

      const searchDatabaseBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeason')
      searchDatabaseBySeasonSpy.and.returnValue(['dummy-result-0', 'dummy-result-7'])

      // Act
      const result = DatabaseGateway.getVideoIdsForMatchingVideos(videoName, genreName, actorName, videoId, channelCallSign, seasonNumber, episodeNumber)

      // Assert
      expect(result).toEqual(['dummy-result-0'])
      expect(searchDatabaseByVideoIdSpy).toHaveBeenCalledWith(videoId)
      expect(searchDatabaseByVideoNameSpy).toHaveBeenCalledWith(videoName)
      expect(searchDatabaseByGenreNameSpy).toHaveBeenCalledWith(genreName)
      expect(searchDatabaseByActorNameSpy).toHaveBeenCalledWith(actorName)
      expect(searchDatabaseByChannelCallSignSpy).toHaveBeenCalledWith(channelCallSign)
      expect(searchDatabaseBySeasonAndEpisodeSpy).not.toHaveBeenCalled()
      expect(searchDatabaseBySeasonSpy).not.toHaveBeenCalled()
    })

    it('season + episode search ', () => {
      // Arrange
      const videoName = 'dummy-video-name'
      const genreName = 'dummy-genre-name'
      const actorName = 'dummy-actor-name'
      const videoId = 'dummy-video-id'
      const channelCallSign = 'dummy-channel-call-sign'
      const seasonNumber = 'dummy-season-number'
      const episodeNumber = 'dummy-episode-number'

      const searchDatabaseByVideoIdSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoId')
      searchDatabaseByVideoIdSpy.and.returnValue(['dummy-result-0', 'dummy-result-1'])

      const searchDatabaseByVideoNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoName')
      searchDatabaseByVideoNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-2'])

      const searchDatabaseByGenreNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByGenreName')
      searchDatabaseByGenreNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-3'])

      const searchDatabaseByActorNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByActorName')
      searchDatabaseByActorNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseByChannelCallSignSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByChannelCallSign')
      searchDatabaseByChannelCallSignSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseBySeasonAndEpisodeSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeasonAndEpisode')
      searchDatabaseBySeasonAndEpisodeSpy.and.returnValue(['dummy-result-0', 'dummy-result-6'])

      const searchDatabaseBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeason')
      searchDatabaseBySeasonSpy.and.returnValue(['dummy-result-0', 'dummy-result-7'])

      // Act
      const result = DatabaseGateway.getVideoIdsForMatchingVideos(videoName, genreName, actorName, videoId, channelCallSign, seasonNumber, episodeNumber)

      // Assert
      expect(result).toEqual(['dummy-result-0'])
      expect(searchDatabaseByVideoIdSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByVideoNameSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByGenreNameSpy).toHaveBeenCalledWith(genreName)
      expect(searchDatabaseByActorNameSpy).toHaveBeenCalledWith(actorName)
      expect(searchDatabaseByChannelCallSignSpy).toHaveBeenCalledWith(channelCallSign)
      expect(searchDatabaseBySeasonAndEpisodeSpy).toHaveBeenCalledWith(videoId, seasonNumber, episodeNumber)
      expect(searchDatabaseBySeasonSpy).not.toHaveBeenCalled()
    })

    it('season only search ', () => {
      // Arrange
      const videoName = 'dummy-video-name'
      const genreName = 'dummy-genre-name'
      const actorName = 'dummy-actor-name'
      const videoId = 'dummy-video-id'
      const channelCallSign = 'dummy-channel-call-sign'
      const seasonNumber = 'dummy-season-number'
      const episodeNumber = undefined

      const searchDatabaseByVideoIdSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoId')
      searchDatabaseByVideoIdSpy.and.returnValue(['dummy-result-0', 'dummy-result-1'])

      const searchDatabaseByVideoNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoName')
      searchDatabaseByVideoNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-2'])

      const searchDatabaseByGenreNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByGenreName')
      searchDatabaseByGenreNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-3'])

      const searchDatabaseByActorNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByActorName')
      searchDatabaseByActorNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseByChannelCallSignSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByChannelCallSign')
      searchDatabaseByChannelCallSignSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseBySeasonAndEpisodeSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeasonAndEpisode')
      searchDatabaseBySeasonAndEpisodeSpy.and.returnValue(['dummy-result-0', 'dummy-result-6'])

      const searchDatabaseBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeason')
      searchDatabaseBySeasonSpy.and.returnValue(['dummy-result-0', 'dummy-result-7'])

      // Act
      const result = DatabaseGateway.getVideoIdsForMatchingVideos(videoName, genreName, actorName, videoId, channelCallSign, seasonNumber, episodeNumber)

      // Assert
      expect(result).toEqual(['dummy-result-0'])
      expect(searchDatabaseByVideoIdSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByVideoNameSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByGenreNameSpy).toHaveBeenCalledWith(genreName)
      expect(searchDatabaseByActorNameSpy).toHaveBeenCalledWith(actorName)
      expect(searchDatabaseByChannelCallSignSpy).toHaveBeenCalledWith(channelCallSign)
      expect(searchDatabaseBySeasonAndEpisodeSpy).not.toHaveBeenCalled()
      expect(searchDatabaseBySeasonSpy).toHaveBeenCalledWith(videoId, seasonNumber)
    })

    it('video id only search ', () => {
      // Arrange
      const videoName = undefined
      const genreName = undefined
      const actorName = undefined
      const videoId = 'dummy-video-id'
      const channelCallSign = undefined
      const seasonNumber = undefined
      const episodeNumber = undefined

      const searchDatabaseByVideoIdSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoId')
      searchDatabaseByVideoIdSpy.and.returnValue(['dummy-result-0', 'dummy-result-1'])

      const searchDatabaseByVideoNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByVideoName')
      searchDatabaseByVideoNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-2'])

      const searchDatabaseByGenreNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByGenreName')
      searchDatabaseByGenreNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-3'])

      const searchDatabaseByActorNameSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByActorName')
      searchDatabaseByActorNameSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseByChannelCallSignSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseByChannelCallSign')
      searchDatabaseByChannelCallSignSpy.and.returnValue(['dummy-result-0', 'dummy-result-4'])

      const searchDatabaseBySeasonAndEpisodeSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeasonAndEpisode')
      searchDatabaseBySeasonAndEpisodeSpy.and.returnValue(['dummy-result-0', 'dummy-result-6'])

      const searchDatabaseBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'searchDatabaseBySeason')
      searchDatabaseBySeasonSpy.and.returnValue(['dummy-result-0', 'dummy-result-7'])

      // Act
      const result = DatabaseGateway.getVideoIdsForMatchingVideos(videoName, genreName, actorName, videoId, channelCallSign, seasonNumber, episodeNumber)

      // Assert
      expect(result).toEqual(['dummy-result-0', 'dummy-result-1'])
      expect(searchDatabaseByVideoIdSpy).toHaveBeenCalledWith(videoId)
      expect(searchDatabaseByVideoNameSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByGenreNameSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByActorNameSpy).not.toHaveBeenCalled()
      expect(searchDatabaseByChannelCallSignSpy).not.toHaveBeenCalled()
      expect(searchDatabaseBySeasonAndEpisodeSpy).not.toHaveBeenCalled()
      expect(searchDatabaseBySeasonSpy).not.toHaveBeenCalled()
    })
  })

  describe('getPreviousEpisodeVideoMetadata', () => {
    let getAvailableSeasonsSpy
    beforeEach(() => {
      getAvailableSeasonsSpy = spyOn(InMemoryDatabaseAccess, 'getAvailableSeasons')
      getAvailableSeasonsSpy.and.returnValue([0, 1])
    })

    it('found episode in season', () => {
      // Arrange
      const getPreviousEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getPreviousEpisodeVideoMetadataBySeason')
      getPreviousEpisodeVideoMetadataBySeasonSpy.and.returnValue('dummy-result')

      // Act
      const result = DatabaseGateway.getPreviousEpisodeVideoMetadata('dummy-video-name', 0, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getPreviousEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('dummy-result')
    })

    it('found episode in previous season', () => {
      // Arrange
      const getPreviousEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getPreviousEpisodeVideoMetadataBySeason')
      getPreviousEpisodeVideoMetadataBySeasonSpy.and.returnValues(null, 'dummy-result')

      // Act
      const result = DatabaseGateway.getPreviousEpisodeVideoMetadata('dummy-video-name', 1, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getPreviousEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(2)
      expect(result).toEqual('dummy-result')
    })

    it('no videos found - no more seasons', () => {
      // Arrange
      const getPreviousEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getPreviousEpisodeVideoMetadataBySeason')
      getPreviousEpisodeVideoMetadataBySeasonSpy.and.returnValue(null)

      // Act
      const result = DatabaseGateway.getPreviousEpisodeVideoMetadata('dummy-video-name', 0, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getPreviousEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(null)
    })
  })

  describe('getNextEpisodeVideoMetadata', () => {
    let getAvailableSeasonsSpy
    beforeEach(() => {
      getAvailableSeasonsSpy = spyOn(InMemoryDatabaseAccess, 'getAvailableSeasons')
      getAvailableSeasonsSpy.and.returnValue([0, 1])
    })

    it('found episode in season', () => {
      // Arrange
      const getNextEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getNextEpisodeVideoMetadataBySeason')
      getNextEpisodeVideoMetadataBySeasonSpy.and.returnValue('dummy-result')

      // Act
      const result = DatabaseGateway.getNextEpisodeVideoMetadata('dummy-video-name', 0, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getNextEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('dummy-result')
    })

    it('found episode in next season', () => {
      // Arrange
      const getNextEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getNextEpisodeVideoMetadataBySeason')
      getNextEpisodeVideoMetadataBySeasonSpy.and.returnValues(null, 'dummy-result')

      // Act
      const result = DatabaseGateway.getNextEpisodeVideoMetadata('dummy-video-name', 0, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getNextEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(2)
      expect(result).toEqual('dummy-result')
    })

    it('no videos found - no more seasons', () => {
      // Arrange
      const getNextEpisodeVideoMetadataBySeasonSpy = spyOn(InMemoryDatabaseAccess, 'getNextEpisodeVideoMetadataBySeason')
      getNextEpisodeVideoMetadataBySeasonSpy.and.returnValue(null)

      // Act
      const result = DatabaseGateway.getNextEpisodeVideoMetadata('dummy-video-name', 1, 1)

      // Assert
      expect(getAvailableSeasonsSpy).toHaveBeenCalledTimes(1)
      expect(getNextEpisodeVideoMetadataBySeasonSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(null)
    })
  })
})
