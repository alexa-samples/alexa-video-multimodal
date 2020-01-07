import { Header } from '../models/header.js'
import { GetPlayableItemsResponsePayload } from '../models/get-playable-items/get-playable-items-response-payload.js'
import { Event } from '../models/event.js'
import { Util } from '../utils/util.js'
import { DatabaseGateway } from '../gateway/database-gateway'
import { Constants } from '../utils/constants'
import { getLogger } from 'log4js'

/**
 * Handles GetNextPage request directive, and constructs a response by querying database through Gateway classes
 */
export class NextPageHandler {
  /**
   * This method searches DynamoDB for the Paginated Ids corresponding to next page token and
   * returns next items for "GetNextPageResponse()"
   *
   * @param {object} event Alexa request directive
   * @param {string} projectName Lambda Name
   * @returns {Promise<Event>} Response to GetNextPage directive
   */
  static getNextPageResponseBuilder (event, projectName) {
    // Extract search strings
    const requestPayload = event.directive.payload
    const requestToken = requestPayload.nextToken
    const minResultLimit = requestPayload['minResultLimit']

    this.logger.debug('Searching for token: ', requestToken)

    // Create header object
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_NEXT_PAGE_RESPONSE, requestHeader.correlationToken, Util.generateMessageId(),
      requestHeader.namespace, requestHeader.payloadVersion)

    // Search for the Ids corresponding to the request token
    return DatabaseGateway.getItemsForToken(requestToken, projectName).then(responseIds => {
      this.logger.debug('Ids for token: ', JSON.stringify(responseIds))

      // Paginate
      const nextToken = Util.generateNextToken(responseIds, minResultLimit, projectName)
      responseIds = responseIds.slice(0, minResultLimit)

      // Create NextPage response Payload
      const payload = new GetPlayableItemsResponsePayload(nextToken, responseIds)

      // Create Response Event
      const responseEvent = new Event(header, payload)
      return Promise.resolve(responseEvent)
    })
  }

  static get logger () {
    return getLogger('get-next-page-response-handler')
  }
}
