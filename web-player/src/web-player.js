import { AlexaController } from './controllers/alexa-controller'
import { VideoController } from './controllers/video-controller'
import { UiController } from './controllers/ui-controller'
import * as Logger from 'js-logger'
import { ApiGatewayController } from './controllers/api-gateway-controller'

/**
 * The main web player driver class
 */
export class WebPlayer {
  constructor () {
    this.logger = Logger.get('web-player')
    this.logger.info('initializing the web player')
    this.alexaController = new AlexaController()
    this.videoController = new VideoController()
    this.uiController = new UiController()
    this.apiGatewayController = new ApiGatewayController()
  }

  /**
   * Initialize the web player
   */
  init () {
    this.logger.info('initialize web player')
    this.alexaController.init()
    this.videoController.init()
    this.uiController.init()
    this.apiGatewayController.init()
  }
}
