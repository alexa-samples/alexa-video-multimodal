import { Util } from '../../src/util/util'
import prompts from 'prompts'
import { of } from 'rxjs'

describe('Util', () => {
  describe('exitWithError', () => {
    it('exits with error', () => {
      // Arrange
      const exitSpy = spyOn(process, 'exit')
      exitSpy.and.returnValue(undefined)

      // Act
      Util.exitWithError()

      // Assert
      expect(exitSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('isNonBlankString', () => {
    it('is blank', () => {
      // Arrange
      // Nothing to arrange

      // Act/Assert
      expect(Util.isNonBlankString('')).toEqual(false)
      expect(Util.isNonBlankString(null)).toEqual(false)
      expect(Util.isNonBlankString(undefined)).toEqual(false)
    })

    it('is not blank', () => {
      // Arrange
      // Nothing to arrange

      // Act/Assert
      expect(Util.isNonBlankString('123')).toEqual(true)
    })
  })

  describe('isEmptyMap', () => {
    it('is empty', () => {
      // Arrange
      // Nothing to arrange

      // Act/Assert
      expect(Util.isEmptyMap({})).toEqual(true)
    })

    it('is not empty', () => {
      // Arrange
      // Nothing to arrange

      // Act/Assert
      expect(Util.isEmptyMap({ key: 'value' })).toEqual(false)
    })
  })
  it('doPrompt', (done) => {
    // Arrange
    const promptsSpy = spyOn(prompts, 'prompt')
    promptsSpy.and.returnValue({
      'dummy-key-0': 'dummy-value-0',
      'dummy-key-1': '    dummy-value-1    '
    })

    // Act
    const o = Util.doPrompt([])

    // Assert
    o.subscribe(result => {
      expect(promptsSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        'dummy-key-0': 'dummy-value-0',
        'dummy-key-1': 'dummy-value-1'
      })
      done()
    })
  })
  describe('submitHttpRequest', () => {
    it('success - get', () => {
      // Arrange
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const mockRequestFunction = () => {
        return of({})
      }
      const requestSpy = spyOn(Util, 'getRequestFunction')
      requestSpy.and.returnValue(mockRequestFunction)

      // Act
      const o = Util.submitHttpRequest('dummy-url', {}, 'dummy-method', null, 99999)

      // Assert
      o.subscribe(result => {
        expect(result).toEqual({})
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
      })
    })
    it('failure - timeout', done => {
      // Arrange
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      exitWithErrorSpy.and.returnValue(of(undefined))

      const mockRequestFunction = () => {
        setTimeout(() => {
          // no-op
        }, 1000)
        return of({})
      }
      const requestSpy = spyOn(Util, 'getRequestFunction')
      requestSpy.and.returnValue(mockRequestFunction)

      // Act
      const o = Util.submitHttpRequest('dummy-url', {}, 'dummy-method', null, 100)

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(exitWithErrorSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
})
