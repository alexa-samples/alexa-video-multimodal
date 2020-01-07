/**
 * This model class helps in creating Thumbnail Sources
 */
export class ThumbnailSource {
  /**
   * Constructor for Thumbnail Source
   *
   * @param {string} url Thumbnail URL
   * @param {string} size Thumbnail size
   * @param {number} widthPixels The width in pixels
   * @param {number} heightPixels The height in pixels
   */
  constructor (url, size, widthPixels, heightPixels) {
    this.url = url
    this.size = size
    this.widthPixels = widthPixels
    this.heightPixels = heightPixels
  }

  toJSON () {
    return {
      url: this.url,
      size: this.size,
      widthPixels: this.widthPixels,
      heightPixels: this.heightPixels
    }
  }
}
