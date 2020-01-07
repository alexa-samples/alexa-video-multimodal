import * as Logger from 'js-logger'
import { LogUtil } from '../../src/util/log-util'

describe('LogUtil', () => {
  it('init', () => {
    // Arrange
    const loggerSpy = spyOn(Logger, 'useDefaults')
    loggerSpy.and.returnValue(undefined)

    // Act
    const result = LogUtil.init()

    // Assert
    expect(result).toBeUndefined()
    expect(Logger.useDefaults).toHaveBeenCalledTimes(1)
  })
})
