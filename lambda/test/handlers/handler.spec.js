import { Handler } from '../../src/handlers/handler'
import { Constants } from '../../src/utils/constants'
import { DiscoverHandler } from '../../src/handlers/discover-response-handler'
import { PlayableItemsHandler } from '../../src/handlers/get-playable-items-response-handler'
import { DisplayableItemsHandler } from '../../src/handlers/get-displayable-items-response-handler'
import { BrowseNodeItemsHandler } from '../../src/handlers/get-browse-node-items-response-handler'
import { NextPageHandler } from '../../src/handlers/get-next-page-response-handler'
import { Util } from '../../src/utils/util'
import { UserUtil } from '../../src/utils/user-util'
import { PlayableItemsMetadataHandler } from '../../src/handlers/get-playable-items-metadata-response-handler'
import { DisplayableItemsMetadataHandler } from '../../src/handlers/get-displayable-items-metadata-response-handler'

describe('Handlers', () => {
  describe('handleRequests', () => {
    it('DISCOVER_REQUEST', () => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.DISCOVER_REQUEST
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(DiscoverHandler, 'getDiscoverResponseBuilder')
      eventHandlerSpy.and.returnValue(expectedResponse)

      // Act
      const result = Handler.handleRequests(event, context)

      // Assert
      expect(result).toBeUndefined()
      expect(eventHandlerSpy).toHaveBeenCalledWith(event, 'dummy-function-name')
      expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
    })

    it('GET_PLAYABLE_ITEMS_REQUEST', () => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_PLAYABLE_ITEMS_REQUEST
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(PlayableItemsHandler, 'getPlayableItemsResponseBuilder')
      eventHandlerSpy.and.returnValue(expectedResponse)

      // Act
      const result = Handler.handleRequests(event, context)

      // Assert
      expect(result).toBeUndefined()
      expect(eventHandlerSpy).toHaveBeenCalledWith(event, 'dummy-function-name')
      expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
    })

    it('GET_PLAYABLE_ITEMS_METADATA_REQUEST', (done) => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_PLAYABLE_ITEMS_METADATA_REQUEST
          }
        }
      }
      const projectName = 'dummy-project-name'
      const context = {
        succeed: () => {

        },
        functionName: projectName
      }
      const expectedResponse = {}
      const credentials = {}
      const getWebPlayerAwsCredentialsSpy = spyOn(Util, 'getWebPlayerAwsCredentials')
      getWebPlayerAwsCredentialsSpy.and.returnValue(Promise.resolve(credentials))

      const eventHandlerSpy = spyOn(PlayableItemsMetadataHandler, 'getPlayableItemsMetadataResponseBuilder')
      eventHandlerSpy.and.returnValue(Promise.resolve(expectedResponse))

      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      // Act
      const p = Handler.handleRequests(event, context)

      // Assert
      p.finally(result => {
        expect(result).toBeUndefined()
        expect(getWebPlayerAwsCredentialsSpy).toHaveBeenCalledTimes(1)
        expect(eventHandlerSpy).toHaveBeenCalledWith(event, credentials, projectName)
        expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
        done()
      })
    })

    it('GET_DISPLAYABLE_ITEMS_REQUEST', () => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_DISPLAYABLE_ITEMS_REQUEST
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(DisplayableItemsHandler, 'getDisplayableItemsResponseBuilder')
      eventHandlerSpy.and.returnValue(expectedResponse)

      // Act
      const result = Handler.handleRequests(event, context)

      // Assert
      expect(result).toBeUndefined()
      expect(eventHandlerSpy).toHaveBeenCalledWith(event, 'dummy-function-name')
      expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
    })

    it('GET_DISPLAYABLE_ITEMS_METADATA_REQUEST', done => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_DISPLAYABLE_ITEMS_METADATA_REQUEST
          }
        }
      }
      const projectName = 'dummy-project-name'
      const context = {
        succeed: () => {

        },
        functionName: projectName
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(DisplayableItemsMetadataHandler, 'getDisplayableItemsMetadataResponseBuilder')
      eventHandlerSpy.and.returnValue(Promise.resolve(expectedResponse))

      // Act
      const p = Handler.handleRequests(event, context)

      // Assert
      p.then(result => {
        expect(result).toBeUndefined()
        expect(eventHandlerSpy).toHaveBeenCalledWith(event, projectName)
        expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
        done()
      })
    })

    it('GET_BROWSE_NODE_ITEMS_REQUEST', () => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_BROWSE_NODE_ITEMS_REQUEST
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(BrowseNodeItemsHandler, 'getBrowseNodeItemsResponseBuilder')
      eventHandlerSpy.and.returnValue(expectedResponse)

      // Act
      const result = Handler.handleRequests(event, context)

      // Assert
      expect(result).toBeUndefined()
      expect(eventHandlerSpy).toHaveBeenCalledWith(event, 'dummy-function-name')
      expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
    })

    it('GET_NEXT_PAGE_REQUEST', (done) => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.GET_NEXT_PAGE_REQUEST
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const eventHandlerSpy = spyOn(NextPageHandler, 'getNextPageResponseBuilder')
      eventHandlerSpy.and.returnValue(Promise.resolve(expectedResponse))

      // Act
      const promise = Handler.handleRequests(event, context)

      // Assert
      promise.then((result) => {
        expect(result).toBeUndefined()
        expect(eventHandlerSpy).toHaveBeenCalledWith(event, 'dummy-function-name')
        expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
        done()
      })
    })

    it('REFRESH_WEB_PLAYER_CREDENTIALS', (done) => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.REFRESH_WEB_PLAYER_CREDENTIALS
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const expectedResponse = {}
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const getWebPlayerAwsCredentialsSpy = spyOn(Util, 'getWebPlayerAwsCredentials')
      getWebPlayerAwsCredentialsSpy.and.returnValue(Promise.resolve({}))

      // Act
      const promise = Handler.handleRequests(event, context)

      // Assert
      promise.then((result) => {
        expect(result).toBeUndefined()
        expect(getWebPlayerAwsCredentialsSpy).toHaveBeenCalledTimes(1)
        expect(succeedSpy).toHaveBeenCalledWith(expectedResponse)
        done()
      })
    })

    it('UPDATE_VIDEO_PROGRESS', (done) => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: Constants.UPDATE_VIDEO_PROGRESS
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      const updateUserVideoProgressSpy = spyOn(UserUtil, 'updateUserVideoProgress')
      updateUserVideoProgressSpy.and.returnValue(Promise.resolve({}))

      // Act
      const promise = Handler.handleRequests(event, context)

      // Assert
      promise.then((result) => {
        expect(result).toBeUndefined()
        expect(updateUserVideoProgressSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('unhandled directive', () => {
      // Arrange
      const event = {
        directive: {
          header: {
            name: 'junk'
          }
        }
      }
      const context = {
        succeed: () => {

        },
        functionName: 'dummy-function-name'
      }
      const succeedSpy = spyOn(context, 'succeed')
      succeedSpy.and.returnValue(undefined)

      // Act
      const result = Handler.handleRequests(event, context)

      // Assert
      expect(result).toBeUndefined()
      expect(succeedSpy).not.toHaveBeenCalled()
    })
  })
})
