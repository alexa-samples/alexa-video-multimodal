
/**
 * This model class helps in creating endpoint for discovery directive payload
 */
export class EndpointDiscovery {
  /**
   * Constructor for creating endpoint
   *
   * @param {object} capabilitiesEndpoint CapabilitiesEndpoint object
   */
  constructor (capabilitiesEndpoint) {
    this.endpointId = capabilitiesEndpoint.endpointId
    this.endpointTypeId = capabilitiesEndpoint.endpointTypeId
    this.manufacturerName = capabilitiesEndpoint.manufacturerName
    this.friendlyName = capabilitiesEndpoint.friendlyName
    this.description = capabilitiesEndpoint.description
    this.displayCategories = capabilitiesEndpoint.displayCategories
    this.cookie = capabilitiesEndpoint.cookie
    this.capabilities = capabilitiesEndpoint.capabilities
  }

  toJSON () {
    return {
      endpointId: this.endpointId,
      endpointTypeId: this.endpointTypeId,
      manufacturerName: this.manufacturerName,
      friendlyName: this.friendlyName,
      description: this.description,
      displayCategories: this.displayCategories,
      cookie: this.cookie,
      capabilities: this.capabilities
    }
  }
}
