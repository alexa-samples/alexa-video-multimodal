/**
 *  Category Metadata Object that maps to database
 */
export class CategoryMetadata {
  constructor (options) {
    this.name = options.name
    this.contentType = options.contentType
    this.itemType = options.itemType
    this.selectionAction = options.selectionAction
    this.thumbnailImageDescription = options.thumbnailImageDescription
    this.thumbnailImageSources = options.thumbnailImageSources
    this.id = options.id
  }
}
