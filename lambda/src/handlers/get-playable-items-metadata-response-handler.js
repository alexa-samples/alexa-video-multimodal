import { Header } from '../models/header.js'
import { SearchResultPlayable } from '../models/get-playable-items-metadata/search-result-playable.js'
import { GetPlayableItemsMetadataResponsePayload } from '../models/get-playable-items-metadata/get-playable-items-metadata-response-payload.js'
import { Event } from '../models/event.js'
import { DatabaseGateway } from '../gateway/database-gateway'
import { Util } from '../utils/util.js'
import { SearchResultChannelPlayable } from '../models/get-playable-items-metadata/search-result-channel-playable'
import { Constants } from '../utils/constants'
import { SearchResultSeriesPlayable } from '../models/get-playable-items-metadata/search-result-series-playable'
import { getLogger } from 'log4js'
import { UserUtil } from '../utils/user-util'

/**
 * Handles GetPlayableItemsMetadata request directive, and constructs a response by querying database through Gateway classes
 */
export class PlayableItemsMetadataHandler {
  /**
   * This method searches the video database for the relevant video metadata
   * and builds the response to "getPlayableItemsMetadataResponse()"
   *
   * @param {object} event Alexa request directive
   * @param {object} webPlayerCredentials expiring AWS credentials to enable the web player to call the AWS API Gateway
   * @returns {Event} Response to GetPlayableItemsMetadata directive
   */
  static getPlayableItemsMetadataResponseBuilder (event, webPlayerCredentials, projectName) {
    // Extract search strings
    const requestPayload = event.directive.payload
    const videoId = requestPayload.mediaIdentifier.id
    this.logger.debug('Searching for Video Id: ', videoId)

    // Create Header
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_PLAYABLE_ITEMS_METADATA_RESPONSE, requestHeader.correlationToken,
      Util.generateMessageId(), requestHeader.namespace, requestHeader.payloadVersion)

    // Search for the video metadata and create search result
    let customerId = null
    let videoMetadata = null
    const accessToken = Util.getAccessTokenFromEvent(event)
    return DatabaseGateway.getVideoMetadataById(videoId, accessToken, projectName)
      .then(data => {
        videoMetadata = data
      })
      .then(() => UserUtil.getUserIdfromAccessToken(accessToken))
      .then(id => {
        customerId = id
      })
      .then(() => {
        const searchResults = []
        if (videoMetadata !== null) {
          let searchResult

          // Check if this is a Channel and form search results differently
          switch (videoMetadata.contentDescription) {
            case 'channel':
              searchResult = new SearchResultChannelPlayable(videoMetadata, webPlayerCredentials, customerId)
              this.logger.debug('Channel Search Result ', JSON.stringify(searchResult))
              break

            case 'series':
              searchResult = new SearchResultSeriesPlayable(videoMetadata, webPlayerCredentials, customerId)
              this.logger.debug('Series Search Result ', JSON.stringify(searchResult))
              break

            default:
              searchResult = new SearchResultPlayable(videoMetadata, webPlayerCredentials, customerId)
              this.logger.debug('VideoMetadata Search Result ', JSON.stringify(searchResult))
          }
          searchResults.push(searchResult)
        }
        // Create getPlayableItemsMetadata payload
        const payload = new GetPlayableItemsMetadataResponsePayload(searchResults)

        // Create Event
        return new Event(header, payload)
      })
  }

  static get logger () {
    return getLogger('get-playable-items-metadata-response-handler')
  }
}
