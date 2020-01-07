import { Handler } from './handlers/handler.js'
import { getLogger } from 'log4js'
import { LogUtil } from './utils/log-util'

/**
 * Handler receiving directives from Alexa
 *
 * @param {object} event Event containing Alexa request directive
 * @param {object} context Context includes the details surrounding the event
 * @param {object} callback Callback function to return responses directly to Alexa
 */

export var handler = (event, context, callback) => {
  const requestId = context.awsRequestId
  LogUtil.configure(requestId)

  const logger = getLogger('index')
  logger.info('Interaction starts')
  Handler.handleRequests(event, context)
    .then(() => {
      logger.info('Interaction ends')
    })
}
