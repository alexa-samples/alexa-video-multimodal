import intersection from 'lodash/intersection'
import { Constants } from '../utils/constants'
import { Util } from '../utils/util'
import { PaginationTokenDbGateway } from './pagination-token-db-gateway'
import { InMemoryDatabaseAccess } from '../access/in-memmory-db-access'
import { getLogger } from 'log4js'

/**
 * Gateway class acts as a bridge between the Handler classes and Database Access layer
 */
export class DatabaseGateway {
  /**
   * Gateway method to get the corresponding videoIds for particular Video name, Actor, Genre, Video Id,
   * Channel CallSign, Season Number, Episode Number
   *
   * @param {string} videoName Video name to search
   * @param {string} genreName Genre name to search
   * @param {string} actorName Actor name to search
   * @param {string} videoId Video Id to search
   * @param {string} channelCallSign Channel call sign to search
   * @param {string} seasonNumber Season number to search
   * @param {string} episodeNumber Episode number to search
   * @returns {Array} Video Ids
   */
  static getVideoIdsForMatchingVideos (videoName, genreName, actorName, videoId, channelCallSign, seasonNumber, episodeNumber) {
    let resultVideoIds = []
    const videoIdSearchResult = videoId && !seasonNumber ? InMemoryDatabaseAccess.searchDatabaseByVideoId(videoId) : []
    resultVideoIds.push(videoIdSearchResult)
    this.logger.debug('videoIDSearchResult ', JSON.stringify(videoIdSearchResult))

    const videoNameSearchResult = videoName && !seasonNumber ? InMemoryDatabaseAccess.searchDatabaseByVideoName(videoName) : []
    resultVideoIds.push(videoNameSearchResult)
    this.logger.debug('videoNameSearchResult ', JSON.stringify(videoNameSearchResult))

    const genreNameSearchResult = genreName ? InMemoryDatabaseAccess.searchDatabaseByGenreName(genreName) : []
    resultVideoIds.push(genreNameSearchResult)
    this.logger.debug('genreNameSearchResult ', JSON.stringify(genreNameSearchResult))

    const actorNameSearchResult = actorName ? InMemoryDatabaseAccess.searchDatabaseByActorName(actorName) : []
    resultVideoIds.push(actorNameSearchResult)
    this.logger.debug('actorNameSearchResult ', JSON.stringify(actorNameSearchResult))

    const channelCallSignSearchResult = channelCallSign ? InMemoryDatabaseAccess.searchDatabaseByChannelCallSign(channelCallSign) : []
    resultVideoIds.push(channelCallSignSearchResult)
    this.logger.debug('channelCallSignSearchResult ', JSON.stringify(channelCallSignSearchResult))

    if (videoId && seasonNumber) {
      const seriesAndEpisodeSearchResult = episodeNumber
        ? InMemoryDatabaseAccess.searchDatabaseBySeasonAndEpisode(videoId, seasonNumber, episodeNumber)
        : InMemoryDatabaseAccess.searchDatabaseBySeason(videoId, seasonNumber)
      resultVideoIds.push(seriesAndEpisodeSearchResult)
      this.logger.debug('seriesAndEpisodeSearchResult ', JSON.stringify(seriesAndEpisodeSearchResult))
    }

    // Filter out the empty Arrays
    resultVideoIds = resultVideoIds.filter(array => array.length > 0)

    // Find common video Ids
    resultVideoIds = intersection(...resultVideoIds)
    this.logger.debug('Aggregate Search Result ', JSON.stringify(resultVideoIds))

    return resultVideoIds
  }

  /**
   * Gateway method to get the corresponding video metadata for particular videoId
   *
   * @param {string} videoId Video Id
   * @param {string} accessToken User access token
   * @param {string} projectName Project name
   * @returns {Promise<object>} Promise that resolves to videoMetadata associated with that Id
   */
  static getVideoMetadataById (videoId, accessToken, projectName) {
    let videoMetadata = InMemoryDatabaseAccess.searchDatabaseByIdForVideoMetadata(videoId)
    if (videoMetadata !== null) {
      videoMetadata = Util.signVideoMetadataUrls([videoMetadata])[0]
      return Util.setVideoProgressTime(accessToken, projectName, [videoMetadata])
        .then(videoMetadataList => videoMetadataList[0])
    } else {
      return Promise.resolve(videoMetadata)
    }
  }

  /**
   * Gateway method to get the corresponding video metadata for videoIds
   *
   * @param {Array} videoIds Video Ids
   * @param {string} accessToken User access token
   * @param {string} projectName Project name
   * @returns {Promise<Array>} A promise resolving to an array of VideoMetadata objects
   */
  static getVideoMetadataByIds (videoIds, accessToken, projectName) {
    const videoMetadataList = Util.signVideoMetadataUrls(InMemoryDatabaseAccess.searchDatabaseByIdsForVideoMetadata(videoIds))
    return Util.setVideoProgressTime(accessToken, projectName, videoMetadataList)
  }

  /**
   * Gateway method to get category metadata by category Ids
   *
   * @param {Array} categoryIds Category Ids
   * @returns {Array} Array of CategoryMetadata objects
   */
  static getCategoryMetadataByIds (categoryIds) {
    return InMemoryDatabaseAccess.searchDatabaseByCategory(categoryIds)
  }

  /**
   * Gateway method to get all category Ids
   *
   * @returns {Array} Category Ids
   */
  static getCategoryIds () {
    return InMemoryDatabaseAccess.searchDatabaseForAllCategoryIds()
  }

  /**
   * Gateway method to get all videos corresponding to particular category Id
   *
   * @param {string} categoryId Category Id
   * @returns {Array} Video Ids
   */
  static getVideosByCategoryId (categoryId) {
    // Implement your own logic for getting videos for different categories
    return InMemoryDatabaseAccess.searchDatabaseForVideoIdsByCategory(categoryId)
  }

  /**
   * Gateway method to get recommended video for landing page
   *
   * @returns {string} Video Id
   */
  static getRecommendedVideo () {
    // Implement your own logic to get the recommended Videos for the User.
    const recommendedVideos = InMemoryDatabaseAccess.searchDatabaseByGenreName('comedy')
    return recommendedVideos[Math.floor(Math.random() * recommendedVideos.length)]
  }

  /**
   * Gateway method to get pagination Items by key 'token' from DynamoDB
   *
   * @param {string} token Key to get paginated items
   * @param {string} projectName Lambda name
   * @returns {Promise<Array>} Paginated items
   */
  static getItemsForToken (token, projectName) {
    return PaginationTokenDbGateway.getPaginationTokenItems(token, projectName)
  }

  /**
   * Gateway method to save pagination Items for key 'token' in DynamoDB
   *
   * @param {string} token Key for paginated items
   * @param {Array} data Data items to put in database
   * @param {string} projectName Lambda name
   * @returns {Promise<object>} A promise
   */
  static putItemsForToken (token, data, projectName) {
    return PaginationTokenDbGateway.putPaginationTokenItem(token, Math.floor(Date.now() / 1000) + Constants.NEXT_TOKEN_TTL, data, projectName)
  }

  /**
   * Gateway method to search for skill capability endpoints
   *
   * @returns {Array} CapabilitiesEndpoint objects
   */
  static getSkillCapabilities () {
    return InMemoryDatabaseAccess.searchDatabaseForCapabilityEndpoints()
  }

  /**
   * Given a video name, season number, and episode number, get the the previous episode.
   *
   * @param {string} videoId Video Id
   * @param {number} seasonNumber Season Number
   * @param {number} episodeNumber Episode Number
   * @returns {Array} Video Metadata for the previous episode
   */
  static getPreviousEpisodeVideoMetadata (videoId, seasonNumber, episodeNumber) {
    const availableSeasons = InMemoryDatabaseAccess.getAvailableSeasons(videoId)
    let previousEpisode = InMemoryDatabaseAccess.getPreviousEpisodeVideoMetadataBySeason(videoId, seasonNumber, episodeNumber)
    if (previousEpisode == null) {
      const previousSeasons = availableSeasons.filter(s => s < seasonNumber)
      if (previousSeasons.length > 0) {
        previousEpisode = InMemoryDatabaseAccess.getPreviousEpisodeVideoMetadataBySeason(videoId, previousSeasons[0], null)
      }
    }
    return previousEpisode
  }

  /**
   * Given a video name, season number, and episode number, get the the next episode.
   *
   * @param {string} videoId Video Id
   * @param {number} seasonNumber Season Number
   * @param {number} episodeNumber Episode Number
   * @returns {Array} Video Metadata for the next episode
   */
  static getNextEpisodeVideoMetadata (videoId, seasonNumber, episodeNumber) {
    const availableSeasons = InMemoryDatabaseAccess.getAvailableSeasons(videoId)
    let nextEpisode = InMemoryDatabaseAccess.getNextEpisodeVideoMetadataBySeason(videoId, seasonNumber, episodeNumber)
    if (nextEpisode == null) {
      const laterSeasons = availableSeasons.filter(s => parseInt(s) > seasonNumber)
      if (laterSeasons.length > 0) {
        nextEpisode = InMemoryDatabaseAccess.getNextEpisodeVideoMetadataBySeason(videoId, laterSeasons[0], null)
      }
    }
    return nextEpisode
  }

  static get logger () {
    return getLogger('database-gateway')
  }
}
