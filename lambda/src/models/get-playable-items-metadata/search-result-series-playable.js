import { Util } from '../../utils/util'
import { DatabaseGateway } from '../../gateway/database-gateway'

/**
 * This model class helps in creating search results for Episodic content, including the metadata information. Object
 * of this class is then passed to create the payload for GetPlayableItemsMetadataResponse
 */
export class SearchResultSeriesPlayable {
  /**
   * Constructor for creating search result for Episodic content
   *
   * @param {object} videoMetadata Video metadata
   * @param {object} webPlayerCredentials Expiring AWS credentials to enable the web player to call the AWS API Gateway
   * @param {string} customerId Account linking customer Id
   */
  constructor (videoMetadata, webPlayerCredentials, customerId) {
    this.name = videoMetadata.name
    this.contentType = videoMetadata.contentType

    this.series = {
      seasonNumber: videoMetadata.seasonNumber,
      episodeNumber: videoMetadata.episodeNumber,
      seriesName: videoMetadata.name,
      episodeName: videoMetadata.episodeName
    }
    const previousEpisodeVideoMetadata = DatabaseGateway.getPreviousEpisodeVideoMetadata(videoMetadata.id, parseInt(videoMetadata.seasonNumber), parseInt(videoMetadata.episodeNumber))
    const nextEpisodeVideoMetadata = DatabaseGateway.getNextEpisodeVideoMetadata(videoMetadata.id, parseInt(videoMetadata.seasonNumber), parseInt(videoMetadata.episodeNumber))

    videoMetadata.previousEpisode = previousEpisodeVideoMetadata === null ? null : {
      id: previousEpisodeVideoMetadata.id,
      name: previousEpisodeVideoMetadata.name,
      seasonNumber: previousEpisodeVideoMetadata.seasonNumber,
      episodeNumber: previousEpisodeVideoMetadata.episodeNumber,
      episodeName: previousEpisodeVideoMetadata.episodeName
    }

    videoMetadata.nextEpisode = nextEpisodeVideoMetadata === null ? null : {
      id: nextEpisodeVideoMetadata.id,
      name: nextEpisodeVideoMetadata.name,
      seasonNumber: nextEpisodeVideoMetadata.seasonNumber,
      episodeNumber: nextEpisodeVideoMetadata.episodeNumber,
      episodeName: nextEpisodeVideoMetadata.episodeName
    }

    this.playbackContextToken = Util.getPlaybackContextToken(videoMetadata, webPlayerCredentials, customerId)
    this.parentalControl = { pinControl: videoMetadata.parentalControl }
    this.absoluteViewingPositionMilliseconds = videoMetadata.absoluteViewingPositionMilliseconds
  }

  toJSON () {
    return {
      name: this.name,
      contentType: this.contentType,
      series: this.series,
      playbackContextToken: this.playbackContextToken,
      parentalControl: this.parentalControl,
      absoluteViewingPositionMilliseconds: this.absoluteViewingPositionMilliseconds
    }
  }
}
