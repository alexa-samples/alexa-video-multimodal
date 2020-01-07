import { Util } from '../../utils/util'
import { ThumbnailSource } from './thumbnail-source'

/**
 * This model class helps in creating search results for Episodic content, including the metadata information. Object
 * of this class is then passed to create the payload for GetDisplayableItemsMetadataResponse.
 */
export class SearchResultSeriesDisplayable {
  /**
   * Constructor for creating search result for Episodic content
   *
   * @param {object} videoMetadata Video metadata
   */
  constructor (videoMetadata) {
    this.name = videoMetadata.name
    this.contentType = videoMetadata.contentType
    this.parentalControl = { pinControl: videoMetadata.parentalControl }
    this.absoluteViewingPositionMilliseconds = videoMetadata.absoluteViewingPositionMilliseconds
    this.itemType = videoMetadata.itemType
    this.releaseYear = videoMetadata.releaseYear
    this.selectionAction = videoMetadata.selectionAction

    const imageSources = []
    videoMetadata.thumbnailImageSources.forEach(thumbnailImageSource => {
      const imageSource = Util.mapDatabaseResultToModelObject(thumbnailImageSource, ThumbnailSource.prototype)
      imageSources.push(imageSource)
    })

    this.thumbnailImage = {
      contentDescription: videoMetadata.thumbnailImageDescription,
      sources: imageSources
    }

    this.runtime = {
      runTimeInMilliseconds: videoMetadata.runTimeInMilliseconds,
      displayString: videoMetadata.runTimeDisplayString
    }

    this.closedCaption = {
      status: videoMetadata.closedCaptionStatus,
      displayString: videoMetadata.closedCaptionDisplayString
    }

    this.series = {
      seasonNumber: videoMetadata.seasonNumber,
      episodeNumber: videoMetadata.episodeNumber,
      seriesName: videoMetadata.name,
      episodeName: videoMetadata.episodeName
    }

    this.viewingDisplayString = videoMetadata.viewingDisplayString

    this.reviews = [{
      totalReviewCount: videoMetadata.reviewsTotalReviewCount,
      type: videoMetadata.reviewsType,
      ratingDisplayString: videoMetadata.reviewsRatingDisplayString
    }]

    this.rating = { category: videoMetadata.ratingCategory }
    this.mediaIdentifier = {
      id: videoMetadata.id
    }
  }

  toJSON () {
    return {
      name: this.name,
      contentType: this.contentType,
      itemType: this.itemType,
      releaseYear: this.releaseYear,
      selectionAction: this.selectionAction,
      thumbnailImage: this.thumbnailImage,
      runtime: this.runtime,
      closedCaption: this.closedCaption,
      series: this.series,
      absoluteViewingPositionMilliseconds: this.absoluteViewingPositionMilliseconds,
      parentalControl: this.parentalControl,
      viewingDisplayString: this.viewingDisplayString,
      reviews: this.reviews,
      rating: this.rating,
      mediaIdentifier: this.mediaIdentifier }
  }
}
