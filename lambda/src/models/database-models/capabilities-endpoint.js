/**
 *  Capabilities Endpoint Object that maps to database
 */
export class CapabilitiesEndpoint {
  constructor (options) {
    this.cookie = options.cookie
    this.capabilities = options.capabilities
    this.endpointId = options.endpointId
    this.endpointTypeId = options.endpointTypeId
    this.manufacturerName = options.manufacturerName
    this.friendlyName = options.friendlyName
    this.description = options.description
    this.displayCategories = options.displayCategories
  }
}
