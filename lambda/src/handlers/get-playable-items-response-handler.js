import { Header } from '../models/header.js'
import { GetPlayableItemsResponsePayload } from '../models/get-playable-items/get-playable-items-response-payload.js'
import { Event } from '../models/event.js'
import { Util } from '../utils/util.js'
import { DatabaseGateway } from '../gateway/database-gateway'
import { ErrorPayload } from '../models/error-payload'
import { Constants } from '../utils/constants'
import { getLogger } from 'log4js'

/**
 *  Handles GetPlayableItems request directive, and constructs a response by querying database through Gateway classes
 */
export class PlayableItemsHandler {
  /**
   * This method searches the video database for the relevant video Ids corresponding to user's utterance
   * and builds the response to "getPlayableItemsResponse()"
   *
   * @param {object} event Alexa request directive
   * @param {string} projectName Lambda Name
   * @returns {Event} Response to GetPlayableItems directive
   */
  static getPlayableItemsResponseBuilder (event, projectName) {
    // Extract search strings
    const requestPayload = event.directive.payload
    const minResultLimit = requestPayload['minResultLimit']
    let searchVideoId, searchVideoName, searchGenreName, searchActorName,
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
        case 'Channel':
          if (entity['entityMetadata'] && entity['entityMetadata']['channelCallSign']) {
            searchChannelCallSign = entity['entityMetadata']['channelCallSign']
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

    this.logger.debug('Searching for video: ', searchVideoName, ' Genre: ', searchGenreName, 'Actor: ',
      searchActorName, 'VideoIds: ', searchVideoId, 'searchChannelCallSign: ', searchChannelCallSign,
      'Season: ', searchSeasonNumber, 'Episode: ', searchEpisodeNumber)

    // Create header object
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_PLAYABLE_ITEMS_RESPONSE, requestHeader.correlationToken, Util.generateMessageId(),
      requestHeader.namespace, requestHeader.payloadVersion)

    // Search for the VideoName, VideoId, Actor, Genre in the database
    let videoIds = DatabaseGateway.getVideoIdsForMatchingVideos(searchVideoName, searchGenreName, searchActorName,
      searchVideoId, searchChannelCallSign, searchSeasonNumber, searchEpisodeNumber)

    // Paginate
    const nextToken = Util.generateNextToken(videoIds, minResultLimit, projectName)
    videoIds = videoIds.slice(0, minResultLimit)

    // Create getPlayableItemsResponse Payload
    const payload = new GetPlayableItemsResponsePayload(nextToken, videoIds)

    // Error Handling
    if (payload.mediaItems.length === 0) {
      const errorPayload = new ErrorPayload(Constants.CONTENT_NOT_FOUND_TYPE, Constants.CONTENT_NOT_FOUND_MESSAGE)
      return new Event(header, errorPayload)
    }

    // Create Response Event
    return new Event(header, payload)
  }

  static get logger () {
    return getLogger('get-playable-items-response-handler')
  }
}
