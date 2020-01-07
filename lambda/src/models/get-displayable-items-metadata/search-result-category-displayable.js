/**
 * This model class helps in creating search results for categories, including the metadata information. Object of
 * this class is then passed to create the payload for GetDisplayableItemsMetadataResponse
 */
export class SearchResultCategoryDisplayable {
  /**
   * Constructor for creating search result for category
   *
   * @param {object} categoryMetadata category metadata
   */
  constructor (categoryMetadata) {
    this.name = categoryMetadata.name
    this.contentType = categoryMetadata.contentType
    this.itemType = categoryMetadata.itemType
    this.selectionAction = categoryMetadata.selectionAction
    this.thumbnailImage = {
      contentDescription: categoryMetadata.thumbnailImageDescription,
      sources: categoryMetadata.thumbnailImageSources
    }
    this.mediaIdentifier = { id: categoryMetadata.id }
  }

  toJSON () {
    return {
      name: this.name,
      contentType: this.contentType,
      itemType: this.itemType,
      selectionAction: this.selectionAction,
      thumbnailImage: this.thumbnailImage,
      mediaIdentifier: this.mediaIdentifier
    }
  }
}
