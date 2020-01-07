import { Header } from '../models/header'
import { Constants } from '../utils/constants'
import { Util } from '../utils/util'
import { DatabaseGateway } from '../gateway/database-gateway'
import { Event } from '../models/event'
import { EndpointDiscovery } from '../models/discover/endpoint-discovery'
import { DiscoverResponsePayload } from '../models/discover/discover-response-payload'
import { getLogger } from 'log4js'

/**
 * Handles Discover request directive, and constructs a response by querying database through Gateway classes
 */
export class DiscoverHandler {
  static getDiscoverResponseBuilder (event) {
    // Create Header
    const requestHeader = event.directive.header
    const header = new Header(Constants.DISCOVER_RESPONSE, undefined, Util.generateMessageId(),
      requestHeader.namespace, requestHeader.payloadVersion)

    // Search for videos for specified category in the database
    const CapabilitiesEndpoint = DatabaseGateway.getSkillCapabilities()

    // Create Payload with CapabilitiesEndpoint
    const endpoints = []
    CapabilitiesEndpoint.forEach(endpoint => {
      endpoints.push(new EndpointDiscovery(endpoint))
    })
    this.logger.debug('Lambda Endpoints: ', JSON.stringify(endpoints))
    const payload = new DiscoverResponsePayload(endpoints)

    // Create response Event
    return new Event(header, payload)
  }

  static get logger () {
    return getLogger('discover-response-handler')
  }
}
