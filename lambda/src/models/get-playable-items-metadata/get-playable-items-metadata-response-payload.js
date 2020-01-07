/**
 * This model class helps in creating payload for GetPlayableItemsMetadataResponse
 */
export class GetPlayableItemsMetadataResponsePayload {
  /**
   * Constructor for GetPlayableItemsMetadataResponsePayload
   *
   * @param {Array} searchResults Search results Array
   */
  constructor (searchResults) {
    this.searchResults = []
    searchResults.forEach((searchResult) => {
      this.searchResults.push(searchResult)
    })
  }

  toJSON () {
    return {
      searchResults: this.searchResults
    }
  }
}
