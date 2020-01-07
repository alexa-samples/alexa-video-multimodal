/**
 * This model class helps in creating payload for GetPlayableItemsResponse
 */
export class GetPlayableItemsResponsePayload {
  /**
   * Constructor for GetPlayableItemsResponsePayload
   *
   * @param {string} nextToken Access Id for paginated items
   * @param {Array} ids Video Ids
   */
  constructor (nextToken, ids) {
    this.nextToken = nextToken
    this.mediaItems = []
    ids.forEach((id) => {
      this.mediaItems.push({ mediaIdentifier: { id: id } })
    })
  }

  toJSON () {
    return {
      nextToken: this.nextToken,
      mediaItems: this.mediaItems
    }
  }
}
