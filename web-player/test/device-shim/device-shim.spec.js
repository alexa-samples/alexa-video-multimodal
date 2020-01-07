import { DeviceShim } from '../../src/device-shim/device-shim'
import { AlexaEvent } from '../../src/enums/alexa-event'
import { AlexaController } from '../../src/controllers/alexa-controller'
import { TestUtils } from '../test-utils.spec'
import { DeviceShimEvent } from '../../src/enums/device-shim-events'

describe('DeviceShim', () => {
  let deviceShim = null

  beforeEach(() => {
    deviceShim = new DeviceShim()
    window.AWMP_DeviceBridgeInitializer = undefined
    window.stub = undefined
  })

  it('init', () => {
    // Arrange
    const setupIframeListenerSpy = spyOn(deviceShim, 'setupIframeListener')
    setupIframeListenerSpy.and.returnValue(undefined)
    const getMockDeviceBridgeSpy = spyOn(deviceShim, 'getMockDeviceBridge')
    getMockDeviceBridgeSpy.and.returnValue('dummy-mock-device-bridge')

    // Act
    const result = deviceShim.init()

    // Assert
    expect(result).toBeUndefined()
    expect(setupIframeListenerSpy).toHaveBeenCalledTimes(1)
    expect(window.AWMP_DeviceBridgeInitializer).toEqual('dummy-mock-device-bridge')
  })

  it('getMockDeviceBridge', () => {
    // Arrange
    const deviceShim = new DeviceShim()

    // Act
    const mockDeviceBridge = deviceShim.getMockDeviceBridge()
    mockDeviceBridge.initialize('dummy-version')

    // Assert
    expect(mockDeviceBridge).toBeDefined('mockDeviceBridge should be defined')
    expect(window.stub).toBeDefined('window.stub should be defined')
    expect(window.stub.close).toBeDefined('window.stub.close should be defined')
    expect(window.stub.close()).toEqual(false, 'window.stub.close() should return false')
    expect(window.stub.onAllowedOperationsChanged).toBeDefined('window.stub.close should be defined')
    expect(window.stub.onAllowedOperationsChanged()).toEqual(false, 'window.stub.close() should return false')
    expect(window.stub.onPlaybackStateChanged).toBeDefined('window.onPlaybackStateChanged.close should be defined')
    expect(window.stub.onPlaybackStateChanged()).toEqual(false, 'window.onPlaybackStateChanged.close() should return false')
    expect(window.stub.setHandlers).toBeDefined('window.stub.setHandlers should be defined')
    expect(window.stub.setHandlers()).toEqual(false, 'window.stub.setHandlers() should return false')
    expect(window.stub.setMetadata).toBeDefined('window.stub.setMetadata should be defined')
    expect(window.stub.setMetadata()).toEqual(false, 'window.stub.setMetadata() should return false')
    expect(window.stub.setPlayerState).toBeDefined('window.stub.setPlayerState should be defined')
    expect(window.stub.setPlayerState()).toEqual(false, 'window.stub.setPlayerState() should return false')
    expect(window.stub.showLoadingOverlay).toBeDefined('window.stub.showLoadingOverlay should be defined')
    expect(window.stub.showLoadingOverlay()).toEqual(false, 'window.stub.showLoadingOverlay() should return false')
    expect(window.stub.onMetadataChanged).toBeDefined('window.stub.onMetadataChanged should be defined')
    expect(window.stub.onMetadataChanged()).toEqual(false, 'window.stub.onMetadataChanged() should return false')
    expect(window.stub.sendError).toBeDefined('window.stub.sendError should be defined')
    expect(window.stub.sendError()).toEqual(false, 'window.stub.sendError() should return false')
  })

  describe('deviceEmulatorEventHandler', () => {
    it('bad origin', () => {
      // Arrange
      const evt = {
        origin: 'junk-origin'
      }

      // Act
      const result = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
    })

    it('action undefined (origin http://localhost:9000)', () => {
      // Arrange
      const evt = {
        origin: 'http://localhost:9000'
      }

      // Act
      const result = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      expect(result).toBeUndefined()
    })

    it('invalid action', () => {
      // Arrange
      const evt = {
        origin: 'http://localhost:9001',
        data: {
          action: 'junk-action'
        }
      }

      // Act / Assert
      expect(() => deviceShim.deviceEmulatorEventHandler(evt)).toThrow()
    })

    it('ALEXA_LOAD_CONTENT', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.LOAD_CONTENT)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_LOAD_CONTENT,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_PREPARE_FOR_CLOSE', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.PREPARE_FOR_CLOSE)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_PREPARE_FOR_CLOSE,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_PAUSE', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.PAUSE)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_PAUSE,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_RESUME', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.RESUME)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_RESUME,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_SET_SEEK_POSITION', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.SET_SEEK_POSITION)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_SET_SEEK_POSITION,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_ADJUST_SEEK_POSITION', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.ADJUST_SEEK_POSITION)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_ADJUST_SEEK_POSITION,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_CLOSED_CAPTIONS_STATE_CHANGE', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.CLOSED_CAPTIONS_STATE_CHANGE)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_CLOSED_CAPTIONS_STATE_CHANGE,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_NEXT', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.NEXT)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_NEXT,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('ALEXA_PREVIOUS', done => {
      // Arrange
      const alexaController = new AlexaController()
      alexaController._alexaInterface = TestUtils.getMockAlexaInterface()
      alexaController.setAlexaEventHandlers()
      window.alexaController = alexaController
      const handlerSpy = spyOn(window.alexaController.alexaHandlers, AlexaEvent.PREVIOUS)
      handlerSpy.and.returnValue(Promise.resolve(undefined))
      const evt = {
        origin: 'http://localhost:9000',
        data: {
          action: DeviceShimEvent.ALEXA_PREVIOUS,
          payload: 'dummy-payload'
        }
      }

      // Act
      const p = deviceShim.deviceEmulatorEventHandler(evt)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(handlerSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })
  })
})
