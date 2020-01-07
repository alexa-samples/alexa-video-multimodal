import { Header } from '../models/header'
import { Util } from '../utils/util'
import { DatabaseGateway } from '../gateway/database-gateway'
import { GetDisplayableItemsResponsePayload } from '../models/get-displayable-items/get-displayable-items-response-payload'
import { Event } from '../models/event'
import { ErrorPayload } from '../models/error-payload'
import { Constants } from '../utils/constants'
import { getLogger } from 'log4js'

/**
 * Handles GetDisplayableItems request directive, and constructs a response by querying database through Gateway classes
 */
export class DisplayableItemsHandler {
  /**
   * This method searches the video/category database for following:
   *      - The relevant video Id corresponding to user's search/find commands
   *      - Category Ids to display on the landing page
   * and builds the response to "GetDisplayableItemsResponse()"
   *
   * @param {object} event Alexa request directive
   * @param {string} projectName Lambda Name
   * @returns {Event} Response to GetDisplayableItems directive
   */
  static getDisplayableItemsResponseBuilder (event, projectName) {
    // Extract search strings
    const requestPayload = event.directive.payload
    const minResultLimit = requestPayload['minResultLimit']
    let searchVideoId, searchVideoName, searchGenreName,
      searchActorName,
      searchChannelCallSign, searchSeasonNumber, searchEpisodeNumber

    const topEntitiesOfAllTypes = Util.getTopEntitiesOfAllTypes(requestPayload.entities)

    topEntitiesOfAllTypes.forEach(entity => {
      const searchCriteria = entity.type
      switch (searchCriteria) {
        case 'Actor':
          searchActorName = entity.value
          break
        case 'Genre':
          searchGenreName = entity.value
          break
        case 'Video':
          searchVideoId = entity.externalIds ? entity.externalIds[Constants.CATALOG_NAME] : undefined
          break
        case 'Franchise':
          searchVideoName = entity.value
          break
        case 'SortType': // Request to get Recommended Video for Landing Page
          if (requestPayload.itemType === 'VIDEO') {
            searchVideoId = DatabaseGateway.getRecommendedVideo()
          }
          break
        case 'Channel': // Using Channel Call Sign for search
          if (entity.entityMetadata && entity.entityMetadata.channelCallSign) {
            searchChannelCallSign = entity.entityMetadata.channelCallSign
          }
          break
        case 'Season':
          searchSeasonNumber = entity.value
          break
        case 'Episode':
          searchEpisodeNumber = entity.value
          break
      }
    })

    // Create header object
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_DISPLAYABLE_ITEMS_RESPONSE, requestHeader.correlationToken,
      Util.generateMessageId(), requestHeader.namespace, requestHeader.payloadVersion)

    let ids = []
    let nextToken

    // If Item type is 'CATEGORY', we want to get all the category Ids
    if (requestPayload.itemType === 'CATEGORY') {
      const categoryType = requestPayload.entities[0].value
      this.logger.debug('Searching for Category: ', categoryType)
      ids = DatabaseGateway.getCategoryIds()

      // Paginate Categories.
      nextToken = Util.generateNextToken(ids, Constants.NUM_CATEGORIES_ON_LANDING_PAGE, projectName)
      ids = ids.slice(0, Constants.NUM_CATEGORIES_ON_LANDING_PAGE)
      this.logger.debug('Category Ids found: ', JSON.stringify(ids))
    } else {
      // If Item type is 'VIDEO', search for the VideoName, Actor, Genre in the database
      this.logger.debug('Searching for video: ', searchVideoName, ' Genre: ', searchGenreName, 'Actor: ',
        searchActorName, 'VideoIds: ', searchVideoId, 'searchChannelCallSign: ', searchChannelCallSign,
        'Season: ', searchSeasonNumber, 'Episode: ', searchEpisodeNumber)

      ids = DatabaseGateway.getVideoIdsForMatchingVideos(searchVideoName, searchGenreName, searchActorName,
        searchVideoId, searchChannelCallSign, searchSeasonNumber, searchEpisodeNumber)

      this.logger.debug('Video Ids found: ', JSON.stringify(ids))

      // Paginate
      nextToken = Util.generateNextToken(ids, minResultLimit, projectName)
      ids = ids.slice(0, minResultLimit)
    }

    // Create getDisplayableItemsResponse Payload
    const payload = new GetDisplayableItemsResponsePayload(nextToken, ids)

    // Error Handling
    if (payload.mediaItems.length === 0) {
      const errorPayload = new ErrorPayload(Constants.CONTENT_NOT_FOUND_TYPE, Constants.CONTENT_NOT_FOUND_MESSAGE)
      return new Event(header, errorPayload)
    }

    // Create response Event
    return new Event(header, payload)
  }

  static get logger () {
    return getLogger('get-displayable-items-response-handler')
  }
}
