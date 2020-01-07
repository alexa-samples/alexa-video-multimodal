/**
 * This model class helps in creating payload for Discover Response
 */
export class DiscoverResponsePayload {
  /**
   * Constructor for DiscoverResponsePayload
   *
   * @param {Array} endpoints Array of EndpointDiscovery objects
   */
  constructor (endpoints) {
    this.endpoints = []
    endpoints.forEach((endpoint) => {
      this.endpoints.push(endpoint)
    })
  }

  toJSON () {
    return {
      endpoints: this.endpoints
    }
  }
}
