import * as Logger from 'js-logger'
import './scss/style.scss'
import 'popper.js'
import 'bootstrap'
import { WebPlayer } from './web-player'
import { LogUtil } from './util/log-util'

// initialize the logger
LogUtil.init()
const logger = Logger.get('index')
LogUtil.configureConsoleLogger()

// if running in development mode, setup the device shim
if (process.env.NODE_ENV === 'development') {
  logger.info('Running in development mode with a device shim')
  require('./device-shim/device-shim')
} else {
  logger.info('Running in production mode')
}

// setup the actual web player
logger.info('Initializing the web player')
const webPlayer = new WebPlayer()
webPlayer.init()
