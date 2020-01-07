import { Util } from '../../utils/util'

/**
 * This model class helps in creating search results for Channels, including the metadata information. Object of this
 * class is then passed to create the payload for GetPlayableItemsMetadataResponse.
 */
export class SearchResultChannelPlayable {
  /**
   * Constructor for creating search result for Channels
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
    this.networkDetails = [{
      channel: {
        callSign: videoMetadata.networkDetails.callSign,
        affiliateCallSign: videoMetadata.networkDetails.affiliateCallSign
      },
      channelMetadata: {
        name: videoMetadata.networkDetails.channelName
      },
      airingDetails: [
        {
          isLiveBroadcast: videoMetadata.networkDetails.isLiveBroadcast,
          end: videoMetadata.networkDetails.end,
          start: videoMetadata.networkDetails.start
        }
      ]
    }]
  }

  toJSON () {
    return {
      name: this.name,
      contentType: this.contentType,
      playbackContextToken: this.playbackContextToken,
      parentalControl: this.parentalControl,
      networkDetails: this.networkDetails
    }
  }
}
