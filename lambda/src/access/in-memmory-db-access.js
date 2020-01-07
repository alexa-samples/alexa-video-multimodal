import { capabilitiesDatabase, categoryDatabase, videoDatabase } from '../database/database.js'
import { Util } from '../utils/util'
import { VideoMetadata } from '../models/database-models/video-metadata'
import { CategoryMetadata } from '../models/database-models/category-metadata'
import { CapabilitiesEndpoint } from '../models/database-models/capabilities-endpoint'

/**
 * Database Access class interacts with the database directly, and does the required search/query.
 */
export class InMemoryDatabaseAccess {
  /**
   * Searches the database for given video name and returns a list of videoIds
   *
   * @param {string} videoName Video name
   * @returns {Array} Video Ids
   */
  static searchDatabaseByVideoName (videoName) {
    const videoIds = videoDatabase
      .filter(item => {
        return this._commonIdentifierMatch(item.name, videoName)
      })
      .map(video => {
        return video.id
      })

    return videoIds
  }

  /**
   * Searches the database for given genre name and returns a list of videoIds
   *
   * @param {string} genreName Genre name
   * @returns {Array} Video Ids
   */
  static searchDatabaseByGenreName (genreName) {
    const videoIds = videoDatabase
      .filter(item => {
        return item.genre
          .map(genre => genre.toLowerCase())
          .includes(genreName.toLowerCase())
      })
      .map(video => {
        return video.id
      })

    return videoIds
  }

  /**
   * Searches the database for given actor name and returns a list of videoIds
   *
   * @param {string} actorName Actor name
   * @returns {Array} Video Ids
   */
  static searchDatabaseByActorName (actorName) {
    const videoIds = videoDatabase
      .filter(item => {
        return item.actors
          .map(actor => actor.toLowerCase())
          .includes(actorName.toLowerCase())
      })
      .map(video => {
        return video.id
      })

    return videoIds
  }

  /**
   * Searches the database for a specific videoId and returns it, if it's found
   *
   * @param {string} videoId Video id
   * @returns {Array} Video Ids
   */
  static searchDatabaseByVideoId (videoId) {
    const videoIdExists = videoDatabase.some(item => {
      return item.id === videoId
    })
    return videoIdExists ? [videoId] : []
  }

  /**
   * Searches the database for a specific channelId and returns it, if it's found
   *
   * @param {string} channelCallSign Channel call sign
   * @returns {Array} Channel Ids
   */
  static searchDatabaseByChannelCallSign (channelCallSign) {
    const channelIds = videoDatabase
      .filter(item => {
        if (item.networkDetails) {
          return item.networkDetails.callSign.toLowerCase() === channelCallSign.toLowerCase()
        }
      })
      .map(channel => {
        return channel.id
      })
    return channelIds
  }

  /**
   * Searches the database for a Specific Episode by Series VideoId, Season Number and Episode number
   *
   * @param {string} videoId Video id
   * @param {string} searchSeasonNumber Season number
   * @param {string} searchEpisodeNumber Episode number
   * @returns {Array} Video Ids
   */
  static searchDatabaseBySeasonAndEpisode (videoId, searchSeasonNumber, searchEpisodeNumber) {
    const videoIds = videoDatabase
      .filter(item => {
        return (this._commonIdentifierMatch(item.id, videoId) &&
          item.seasonNumber === searchSeasonNumber &&
          item.episodeNumber === searchEpisodeNumber)
      })
      .map(video => {
        return video.id
      })
    return videoIds
  }

  /**
   * Searches the database for all episodes for a Specific Season Number
   *
   * @param {string} videoId Video name
   * @param {string} searchSeasonNumber Season number
   * @returns {Array} Video Ids
   */
  static searchDatabaseBySeason (videoId, searchSeasonNumber) {
    const videoIds = videoDatabase
      .filter(item => {
        return (this._commonIdentifierMatch(item.id, videoId) &&
          item.seasonNumber === searchSeasonNumber)
      })
      .map(video => {
        return video.id
      })
    return videoIds
  }

  /**
   * Get a list of season numbers available for a video video name in sorted order ascending
   *
   * @param {string} videoId Video Id
   * @returns {Array} Season numbers in ascending order
   */
  static getAvailableSeasons (videoId) {
    // Only Last part differs among videoIds in a series
    const commonSeriesVideoId = videoId.substring(0, videoId.length - 4)
    const searchResults = videoDatabase
      .filter(item => this._commonIdentifierMatch(item.id, commonSeriesVideoId)) // name match
      .map(item => parseInt(item.seasonNumber)) // map from string to number
      .filter((v, i, a) => a.indexOf(v) === i) // uniq the list
    searchResults.sort() // sort ascending
    return searchResults
  }

  /**
   * Searches the database for the previous episode within a given season. If referenceEpisodeNumber is null, it will return the last episode in the season.
   *
   * @param {string} videoId Video Id
   * @param {number} searchSeasonNumber Season number
   * @param {number|null} referenceEpisodeNumber The next episode number
   * @returns {object} Video metadata for the previous episode in the season
   */
  static getPreviousEpisodeVideoMetadataBySeason (videoId, searchSeasonNumber, referenceEpisodeNumber) {
    const commonSeriesVideoId = videoId.substring(0, videoId.length - 4)
    const searchResults = videoDatabase
      .filter(item => {
        const nameMatches = this._commonIdentifierMatch(item.id, commonSeriesVideoId)
        const seasonNumberMatches = parseInt(item.seasonNumber) === searchSeasonNumber
        const episodeIsBefore = referenceEpisodeNumber === null || parseInt(item.episodeNumber) < referenceEpisodeNumber
        return nameMatches && seasonNumberMatches && episodeIsBefore
      })
    searchResults.sort((a, b) => b.episodeNumber - a.episodeNumber)
    return searchResults.length > 0 ? searchResults[0] : null
  }

  /**
   * Searches the database for the next episode within a given season. If referenceEpisodeNumber is null, it will return the first episode in the season.
   *
   * @param {string} videoId Video Id
   * @param {number} searchSeasonNumber Season number
   * @param {number|null} referenceEpisodeNumber The next episode number
   * @returns {object} Video metadata for the previous episode in the season
   */
  static getNextEpisodeVideoMetadataBySeason (videoId, searchSeasonNumber, referenceEpisodeNumber) {
    const commonSeriesVideoId = videoId.substring(0, videoId.length - 4)
    const searchResults = videoDatabase
      .filter(item => {
        const nameMatches = this._commonIdentifierMatch(item.id, commonSeriesVideoId)
        const seasonNumberMatches = parseInt(item.seasonNumber) === searchSeasonNumber
        const episodeIsAfter = referenceEpisodeNumber === null || parseInt(item.episodeNumber) > referenceEpisodeNumber
        return nameMatches && seasonNumberMatches && episodeIsAfter
      })
    searchResults.sort((a, b) => a.episodeNumber - b.episodeNumber)
    return searchResults.length > 0 ? searchResults[0] : null
  }

  /**
   * Searches the database for a given videoId and returns the video metadata Object for the corresponding video Id
   *
   * @param {string} videoId Video Id
   * @returns {VideoMetadata} VideoMetadata object
   */
  static searchDatabaseByIdForVideoMetadata (videoId) {
    const videoMetadataObjects = videoDatabase
      .filter(item => videoId === item.id)
      .map(video => Util.mapDatabaseResultToModelObject(video, VideoMetadata.prototype))
    return videoMetadataObjects.length > 0 ? videoMetadataObjects[0] : null
  }

  /**
   * Searches the database for given videoIds and returns the video metadata Objects for the corresponding video Ids
   *
   * @param {Array} videoIds Video Ids
   * @returns {Array} VideoMetadata objects
   */
  static searchDatabaseByIdsForVideoMetadata (videoIds) {
    const videoMetadataObjects = videoDatabase
      .filter(item => {
        return videoIds.find(id => id === item.id)
      })
      .map(video => Util.mapDatabaseResultToModelObject(video, VideoMetadata.prototype))

    return videoMetadataObjects
  }

  /**
   * Searches the category database for given category Ids and returns category metadata objects
   *
   * @param {Array} categoryIds Category Ids
   * @returns {Array} CategoryMetadata objects
   */
  static searchDatabaseByCategory (categoryIds) {
    const categoryMetadataObjects = categoryDatabase
      .filter(item => {
        return categoryIds.find(id => id === item.id)
      })
      .map(category => {
        return Util.mapDatabaseResultToModelObject(category, CategoryMetadata.prototype)
      })

    return categoryMetadataObjects
  }

  /**
   * Searches the database for all available category Ids
   *
   * @returns {Array} Category ids
   */
  static searchDatabaseForAllCategoryIds () {
    const categoryIds = categoryDatabase
      .map(category => {
        return category.id
      })

    return categoryIds
  }

  /**
   * Searches the database for all video Ids for a particular category
   *
   * @param {string} categoryId Category Id
   * @returns {Array} Video Ids
   */
  static searchDatabaseForVideoIdsByCategory (categoryId) {
    const category = categoryDatabase
      .find(item => {
        return item.id === categoryId
      })

    if (!category || !category.name) {
      return []
    }

    const videoIds = videoDatabase
      .filter(item => {
        return item.genre
          .map(genre => genre.toLowerCase())
          .includes(category.name.toLowerCase())
      })
      .map(video => {
        return video.id
      })

    return videoIds
  }

  /**
   * Searches the capabilities database for all Capability Endpoints
   *
   * @returns {Array} CapabilitiesEndpoint objects
   */
  static searchDatabaseForCapabilityEndpoints () {
    const capabilities = capabilitiesDatabase
      .map(capability => {
        return Util.mapDatabaseResultToModelObject(capability, CapabilitiesEndpoint.prototype)
      })
    return capabilities
  }

  static _commonIdentifierMatch (a, b) {
    return a.toLowerCase().startsWith(b.toLowerCase())
  }
}
