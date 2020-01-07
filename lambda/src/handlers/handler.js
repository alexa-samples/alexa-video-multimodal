import { PlayableItemsHandler } from './get-playable-items-response-handler.js'
import { PlayableItemsMetadataHandler } from './get-playable-items-metadata-response-handler.js'
import { DisplayableItemsMetadataHandler } from './get-displayable-items-metadata-response-handler'
import { DisplayableItemsHandler } from './get-displayable-items-response-handler.js'
import { BrowseNodeItemsHandler } from './get-browse-node-items-response-handler'
import { NextPageHandler } from './get-next-page-response-handler'
import { Util } from '../utils/util'
import { Constants } from '../utils/constants'
import { DiscoverHandler } from './discover-response-handler'
import { UserUtil } from '../utils/user-util'
import { getLogger } from 'log4js'

/**
 *  Main Handler class that receives the request directive from Alexa and depending on the type of directive,
 *  it directs the request to directive specific handlers.
 */
export class Handler {
  /**
   * Directive Handler- Directs the Alexa Request to directive specific handlers
   *
   * @param {object} event Event containing Alexa request directive
   * @param {object} context Context includes the details surrounding the event
   * @returns {undefined|Promise} Promise is returned for async handlers
   */
  static handleRequests (event, context) {
    const logger = getLogger('handler')
    const requestDirectiveName = event.directive.header.name
    let projectName = context.functionName
    projectName = projectName.replace('-lambda', '')
    logger.info('Alexa Request: ', requestDirectiveName, JSON.stringify(event))

    if (requestDirectiveName === Constants.DISCOVER_REQUEST) {
      const discoverResultResponse = DiscoverHandler.getDiscoverResponseBuilder(event, projectName)
      logger.info('Lambda Response: DiscoverResultResponse ', JSON.stringify(discoverResultResponse))
      context.succeed(discoverResultResponse)
    } else if (requestDirectiveName === Constants.GET_PLAYABLE_ITEMS_REQUEST) {
      const getPlayableItemsResponse = PlayableItemsHandler.getPlayableItemsResponseBuilder(event, projectName)
      logger.info('Lambda Response: GetPlayableItemsResponse ', JSON.stringify(getPlayableItemsResponse))
      context.succeed(getPlayableItemsResponse)
    } else if (requestDirectiveName === Constants.GET_PLAYABLE_ITEMS_METADATA_REQUEST) {
      return Util.getWebPlayerAwsCredentials()
        .then(webPlayerCredentials => {
          PlayableItemsMetadataHandler.getPlayableItemsMetadataResponseBuilder(event, webPlayerCredentials, projectName)
            .then(getPlayableItemsMetadataResponse => {
              logger.info('Lambda Response: GetPlayableItemsMetadataResponse not logged intentionally as it contains AWS Credentials required by Web Player')
              context.succeed(getPlayableItemsMetadataResponse)
            })
        })
    } else if (requestDirectiveName === Constants.GET_DISPLAYABLE_ITEMS_REQUEST) {
      const getDisplayableItemsResponse = DisplayableItemsHandler.getDisplayableItemsResponseBuilder(event, projectName)
      logger.info('Lambda Response: GetDisplayableItemsResponse ', JSON.stringify(getDisplayableItemsResponse))
      context.succeed(getDisplayableItemsResponse)
    } else if (requestDirectiveName === Constants.GET_DISPLAYABLE_ITEMS_METADATA_REQUEST) {
      return DisplayableItemsMetadataHandler.getDisplayableItemsMetadataResponseBuilder(event, projectName)
        .then(getDisplayableItemsMetadataResponse => {
          logger.info('Lambda Response: GetDisplayableItemsMetadataResponse ', JSON.stringify(getDisplayableItemsMetadataResponse))
          context.succeed(getDisplayableItemsMetadataResponse)
        })
    } else if (requestDirectiveName === Constants.GET_NEXT_PAGE_REQUEST) {
      return NextPageHandler.getNextPageResponseBuilder(event, projectName)
        .then(getNextPageResponse => {
          logger.info('Lambda Response: GetNextPageResponse', JSON.stringify(getNextPageResponse))
          context.succeed(getNextPageResponse)
        })
    } else if (requestDirectiveName === Constants.GET_BROWSE_NODE_ITEMS_REQUEST) {
      const getBrowseNodeItems = BrowseNodeItemsHandler.getBrowseNodeItemsResponseBuilder(event, projectName)
      logger.info('Lambda Response: GetBrowseNodeItems', JSON.stringify(getBrowseNodeItems))
      context.succeed(getBrowseNodeItems)
    } else if (requestDirectiveName === Constants.REFRESH_WEB_PLAYER_CREDENTIALS) {
      return Util.getWebPlayerAwsCredentials()
        .then((webPlayerCredentials) => {
          context.succeed(webPlayerCredentials)
        })
    } else if (requestDirectiveName === Constants.UPDATE_VIDEO_PROGRESS) {
      return UserUtil.updateUserVideoProgress(event, projectName)
        .then(() => {
          context.succeed()
        })
    }
  }
}
