import { Util } from '../../utils/util'

/**
 * This model class helps in creating search results for videos/movies, including the metadata information. Object of this
 * class is then passed to create the payload for GetPlayableItemsMetadataResponse
 */
export class SearchResultPlayable {
  /**
   * Constructor for creating search result for Videos/Movies
   *
   * @param {object} videoMetadata Video metadata
   * @param {object} webPlayerCredentials Expiring AWS credentials to enable the web player to call the AWS API Gateway
   * @param {string} customerId Account linking customer Id
   */
  constructor (videoMetadata, webPlayerCredentials, customerId) {
    this.name = videoMetadata.name
    this.contentType = videoMetadata.contentType
    this.playbackContextToken = Util.getPlaybackContextToken(videoMetadata, webPlayerCredentials, customerId)
    this.parentalControl = { pinControl: videoMetadata.parentalControl }
    this.absoluteViewingPositionMilliseconds = videoMetadata.absoluteViewingPositionMilliseconds
  }

  toJSON () {
    return {
      name: this.name,
      contentType: this.contentType,
      playbackContextToken: this.playbackContextToken,
      parentalControl: this.parentalControl,
      absoluteViewingPositionMilliseconds: this.absoluteViewingPositionMilliseconds
    }
  }
}
