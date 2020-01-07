import { Header } from '../models/header'
import { DatabaseGateway } from '../gateway/database-gateway'
import { Util } from '../utils/util'
import { Event } from '../models/event'
import { GetPlayableItemsResponsePayload } from '../models/get-playable-items/get-playable-items-response-payload'
import { Constants } from '../utils/constants'
import { getLogger } from 'log4js'

/**
 * Handles GetBrowseNodeItems request directive, and constructs a response by querying database through Gateway classes
 */
export class BrowseNodeItemsHandler {
  /**
   * This method searches videos corresponding to different categories on landing page
   *
   * @param {object} event Alexa request directive
   * @param {string} projectName Lambda Name
   * @returns {Event} Response to GetBrowseNodeItems directive
   */
  static getBrowseNodeItemsResponseBuilder (event, projectName) {
    // Extract Search Strings
    const requestPayload = event.directive.payload
    const categoryId = requestPayload.mediaIdentifier.id
    const minResultLimit = requestPayload['minResultLimit']

    // Create Header
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_BROWSE_NODE_ITEMS_RESPONSE, requestHeader.correlationToken, Util.generateMessageId(),
      requestHeader.namespace, requestHeader.payloadVersion)

    // Search for videos for specified category in the database
    let videoIds = DatabaseGateway.getVideosByCategoryId(categoryId)
    this.logger.debug('Video Ids for Category: ', categoryId, ' : ', JSON.stringify(videoIds))

    // Paginate
    const nextToken = Util.generateNextToken(videoIds, minResultLimit, projectName)
    videoIds = videoIds.slice(0, minResultLimit)

    // Create Payload with videoIds
    const payload = new GetPlayableItemsResponsePayload(nextToken, videoIds)

    // Create response Event
    return new Event(header, payload)
  }

  static get logger () {
    return getLogger('get-browse-node-items-response-handler')
  }
}
