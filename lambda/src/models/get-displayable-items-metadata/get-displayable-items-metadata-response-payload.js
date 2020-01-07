/**
 * This model class helps in creating payload for GetDisplayableItemsMetadataResponse
 */
export class GetDisplayableItemsMetadataResponsePayload {
  /**
   * Constructor for GetDisplayableItemsMetadataResponsePayload
   *
   * @param {Array} searchResults Array of search results
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
