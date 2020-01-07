import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import * as log4js from 'log4js'
import { Util } from '../../../src/util/util'

describe('AwsSdkUtil', () => {
  // eslint-disable-next-line jasmine/new-line-between-declarations
  describe('makeRequest', () => {
    it('success', (done) => {
      // Arrange
      const logger = log4js.getLogger('AwsSdkUtil.makeRequest.test')
      const infoSpy = spyOn(logger, 'info')
      const errorSpy = spyOn(logger, 'error')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      const expectedResults = {}
      const api = {
        dummyFunc: () => {
          return {
            promise: () => {
              return Promise.resolve(expectedResults)
            }
          }
        }
      }
      // Act
      const o = AwsSdkUtil.makeRequest(api, api.dummyFunc, [], logger, 'test-message')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        expect(infoSpy).toHaveBeenCalledTimes(2)
        expect(errorSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('success, suppressAllLogs=true ', (done) => {
      // Arrange
      const logger = log4js.getLogger('AwsSdkUtil.makeRequest.test')
      const infoSpy = spyOn(logger, 'info')
      const errorSpy = spyOn(logger, 'error')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      const expectedResults = {}
      const api = {
        dummyFunc: () => {
          return {
            promise: () => {
              return Promise.resolve(expectedResults)
            }
          }
        }
      }

      // Act
      const o = AwsSdkUtil.makeRequest(api, api.dummyFunc, [], logger, 'test-message', true, false, true)

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        expect(infoSpy).toHaveBeenCalledTimes(0)
        expect(errorSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failure exitOnError=true', (done) => {
      // Arrange
      const logger = log4js.getLogger('AwsSdkUtil.makeRequest.test')
      const errorSpy = spyOn(logger, 'error')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      const api = {
        dummyFunc: () => {
          return {
            promise: () => {
              return Promise.reject(new Error('dummy-error'))
            }
          }
        }
      }

      // Act
      const o = AwsSdkUtil.makeRequest(api, api.dummyFunc, [], logger, 'test-message', true)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(errorSpy).toHaveBeenCalledTimes(0)
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
    it('failure exitOnError=false', (done) => {
      // Arrange
      const logger = log4js.getLogger('AwsSdkUtil.makeRequest.test')
      const infoSpy = spyOn(logger, 'info')
      const errorSpy = spyOn(logger, 'error')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      const api = {
        dummyFunc: () => {
          return {
            promise: () => {
              return Promise.reject(new Error('dummy-error'))
            }
          }
        }
      }

      // Act
      const o = AwsSdkUtil.makeRequest(api, api.dummyFunc, [], logger, 'test-message', false)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(infoSpy).toHaveBeenCalledTimes(1)
        expect(errorSpy).toHaveBeenCalledTimes(1)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
    it('failure exitOnError=false, suppressErrorMessage=true', (done) => {
      // Arrange
      const logger = log4js.getLogger('AwsSdkUtil.makeRequest.test')
      const infoSpy = spyOn(logger, 'info')
      const errorSpy = spyOn(logger, 'error')
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      const api = {
        dummyFunc: () => {
          return {
            promise: () => {
              return Promise.reject(new Error('dummy-error'))
            }
          }
        }
      }

      // Act
      const o = AwsSdkUtil.makeRequest(api, api.dummyFunc, [], logger, 'test-message', false, true)

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
        expect(infoSpy).toHaveBeenCalledTimes(1)
        expect(errorSpy).not.toHaveBeenCalled()
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })
})
