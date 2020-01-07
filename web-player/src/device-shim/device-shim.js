import * as Logger from 'js-logger'
import { AlexaController } from '../controllers/alexa-controller'
import { DeviceShimEvent } from '../enums/device-shim-events'
import { AlexaEvent } from '../enums/alexa-event'

/**
 * This class acts as a device shim. It can also receive and respond
 * to external events that mimic events that would be sent by Alexa on device.
 * This is designed to work with the device-emulator and should not be
 * part of the production build.
 */
export class DeviceShim {
  constructor () {
    this.logger = Logger.get('device-shim')
  }

  /**
   * initialize the device shim
   */
  init () {
    this.logger.info('Setting mock device bridge')
    this.setupIframeListener()
    window['AWMP_DeviceBridgeInitializer'] = this.getMockDeviceBridge()
  }

  /**
   * return a mock device bridge (used to mock the device)
   *
   * @returns {object} Mock device bridge
   */
  getMockDeviceBridge () {
    const setPlayerState = (...args) => {
      this.logger.debug('mock setPlayerState', args)
      return false
    }

    const onPlaybackStateChanged = (...args) => {
      this.logger.debug('mock onPlaybackStateChanged', args)
      return false
    }

    const setMetadata = (...args) => {
      this.logger.debug('mock setMetadata', args)
      return false
    }

    const setHandlers = (...args) => {
      this.logger.debug('mock setHandlers', args)
      return false
    }

    const showLoadingOverlay = (...args) => {
      this.logger.debug('mock showLoadingOverlay', args)
      return false
    }

    const onAllowedOperationsChanged = (...args) => {
      this.logger.debug('mock onAllowedOperationsChanged', args)
      return false
    }

    const onMetadataChanged = (...args) => {
      this.logger.debug('mock onMetadataChanged', args)
      return false
    }

    const close = (...args) => {
      this.logger.debug('mock close', args)
      return false
    }

    const sendError = (...args) => {
      this.logger.debug('mock sendError', args)
      return false
    }

    const initialize = (version) => {
      window.stub = {
        setPlayerState,
        setMetadata,
        setHandlers,
        onPlaybackStateChanged,
        onAllowedOperationsChanged,
        showLoadingOverlay,
        close,
        sendError,
        onMetadataChanged
      }

      this.logger.info(`deviceShim initialized (version = ${version})`)

      return JSON.stringify({
        uuid: 'stub',
        version: '1.0',
        deviceBridge: 'stub'
      })
    }

    return {
      initialize
    }
  };

  /**
   * This listener listens for evens from the device emulator when the web player is loaded
   * as an iFrame in the device emulator
   */
  setupIframeListener () {
    window.addEventListener('message', this.deviceEmulatorEventHandler.bind(this))
  }

  /**
   * This method handles various device emulator events
   *
   * @param {object} evt Event
   * @returns {Promise|undefined} A thenable promise
   */
  deviceEmulatorEventHandler (evt) {
    // Ignore messages except from the web-player and the device-emulator
    // TODO: hosts and ports are hard coded.
    if (evt.origin !== 'http://localhost:9000' && evt.origin !== 'http://localhost:9001') {
      return
    }
    if (evt.data && evt.data.action) {
      const action = evt.data.action
      const handlerParameter = evt.data.handlerParameter

      this.logger.info('device shim received event', action)
      let p = null

      if (action === DeviceShimEvent.ALEXA_LOAD_CONTENT) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.LOAD_CONTENT](handlerParameter)
      } else if (action === DeviceShimEvent.ALEXA_PREPARE_FOR_CLOSE) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.PREPARE_FOR_CLOSE]()
      } else if (action === DeviceShimEvent.ALEXA_PAUSE) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.PAUSE]()
      } else if (action === DeviceShimEvent.ALEXA_RESUME) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.RESUME]()
      } else if (action === DeviceShimEvent.ALEXA_SET_SEEK_POSITION) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.SET_SEEK_POSITION](handlerParameter)
      } else if (action === DeviceShimEvent.ALEXA_ADJUST_SEEK_POSITION) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.ADJUST_SEEK_POSITION](handlerParameter)
      } else if (action === DeviceShimEvent.ALEXA_CLOSED_CAPTIONS_STATE_CHANGE) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.CLOSED_CAPTIONS_STATE_CHANGE](handlerParameter)
      } else if (action === DeviceShimEvent.ALEXA_NEXT) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.NEXT](handlerParameter)
      } else if (action === DeviceShimEvent.ALEXA_PREVIOUS) {
        p = AlexaController.getAlexaController().alexaHandlers[AlexaEvent.PREVIOUS](handlerParameter)
      }

      if (p !== null) {
        return p.then(() => {
          this.logger.info(`device emulator handler "${action}" action completed`)
        })
      } else {
        throw new Error(`No device emulator action "${action}" available in the web player device shim.`)
      }
    }
  }
}

// initialize the device emulator
const deviceShim = new DeviceShim()
deviceShim.init()
