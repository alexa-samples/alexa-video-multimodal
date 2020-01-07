/**
 * Video Metadata Object that maps to database
 */
export class VideoMetadata {
  constructor (options) {
    this.id = options.id
    this.name = options.name
    this.contentType = options.contentType
    this.videoUrl = options.videoUrl
    this.actors = options.actors
    this.genre = options.genre
    this.thumbnailImageDescription = options.thumbnailImageDescription
    this.thumbnailImageSources = options.thumbnailImageSources
    this.contentDescription = options.contentDescription
    this.parentalControl = options.parentalControl
    this.absoluteViewingPositionMilliseconds = options.absoluteViewingPositionMilliseconds
    this.itemType = options.itemType
    this.releaseYear = options.releaseYear
    this.selectionAction = options.selectionAction
    this.runTimeInMilliseconds = options.runTimeInMilliseconds
    this.runTimeDisplayString = options.runTimeDisplayString
    this.closedCaptionStatus = options.closedCaptionStatus
    this.closedCaptionDisplayString = options.closedCaptionDisplayString
    this.closedCaptionsFile = options.closedCaptionsFile
    this.viewingDisplayString = options.viewingDisplayString
    this.reviewsTotalReviewCount = options.reviewsTotalReviewCount
    this.reviewsType = options.reviewsType
    this.reviewsRatingDisplayString = options.reviewsRatingDisplayString
    this.ratingCategory = options.ratingCategory
    this.webPlayerContentType = options.webPlayerContentType
    this.networkDetails = options.networkDetails
    this.seasonNumber = options.seasonNumber
    this.episodeNumber = options.episodeNumber
    this.episodeName = options.episodeName
  }
}
