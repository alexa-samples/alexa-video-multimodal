import { Header } from '../models/header.js'
import { SearchResultDisplayable } from '../models/get-displayable-items-metadata/search-result-displayable'
import { GetDisplayableItemsMetadataResponsePayload } from '../models/get-displayable-items-metadata/get-displayable-items-metadata-response-payload'
import { Event } from '../models/event.js'
import { DatabaseGateway } from '../gateway/database-gateway'
import { Util } from '../utils/util.js'
import { SearchResultCategoryDisplayable } from '../models/get-displayable-items-metadata/search-result-category-displayable'
import { Constants } from '../utils/constants'
import { SearchResultSeriesDisplayable } from '../models/get-displayable-items-metadata/search-result-series-displayable'
import { getLogger } from 'log4js'

/**
 * Handles GetDisplayableItemsMetadata request directive, and constructs a response by querying database through Gateway classes
 */
export class DisplayableItemsMetadataHandler {
  /**
   * This method searches the video database for following:
   *      - The relevant video metadata for video Id
   *      - The relevant category metadata for category Id
   * and builds the response to "getDisplayableItemsMetadataResponse()"
   *
   * @param {object} event Alexa request directive
   * @param {string} projectName The project name
   * @returns {Event} Response to GetDisplayableItemsMetadata directive
   */
  static getDisplayableItemsMetadataResponseBuilder (event, projectName) {
    // Extract search strings
    const requestPayload = event.directive.payload

    const ids = requestPayload['mediaIdentifiers'] ? requestPayload['mediaIdentifiers']
      .map(mediaIdentifier => {
        return mediaIdentifier.id
      }) : []
    this.logger.debug('Searching for Ids ', JSON.stringify(ids))

    // Create Header
    const requestHeader = event.directive.header
    const header = new Header(Constants.GET_DISPLAYABLE_ITEMS_METADATA_RESPONSE, requestHeader.correlationToken, Util.generateMessageId(),
      requestHeader.namespace, requestHeader.payloadVersion)

    // Search for the movie and create search result
    const accessKey = Util.getAccessTokenFromEvent(event)
    return DatabaseGateway.getVideoMetadataByIds(ids, accessKey, projectName)
      .then(videoMetadataObjects => {
        this.logger.debug('Video Metadata found for Video Ids ', JSON.stringify(videoMetadataObjects))

        const videoSearchResults = []
        videoMetadataObjects.forEach(videoMetadata => {
          let searchResult

          // Check if this is a Channel and form search results differently
          if (videoMetadata.contentDescription === 'series') {
            searchResult = new SearchResultSeriesDisplayable(videoMetadata)
            this.logger.debug('Series Search Result ', JSON.stringify(searchResult))
          } else {
            searchResult = new SearchResultDisplayable(videoMetadata)
            this.logger.debug('VideoMetadata Search Result ', JSON.stringify(searchResult))
          }
          videoSearchResults.push(searchResult)
        })

        // Search for the Category and create search result
        const categoriesMetadataObjects = DatabaseGateway.getCategoryMetadataByIds(ids)
        this.logger.debug('Category Metadata found for category Ids ', JSON.stringify(categoriesMetadataObjects))

        // Transform to Alexa accepted format
        const categorySearchResults = []
        categoriesMetadataObjects.forEach(categoryMetadata => {
          categorySearchResults.push(new SearchResultCategoryDisplayable(categoryMetadata))
        })

        const aggregateSearchResult = videoSearchResults.concat(categorySearchResults)

        // Create getPlayableItemsMetadata payload
        const payload = new GetDisplayableItemsMetadataResponsePayload(aggregateSearchResult)

        // Create Event
        return new Event(header, payload)
      })
  }

  static get logger () {
    return getLogger('get-displayable-items-metadata-response-handler')
  }
}
