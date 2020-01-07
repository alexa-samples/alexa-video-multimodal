import { CliUtil } from '../../src/util/cli-util'
import { Util } from '../../src/util/util'

describe('CliUtil', () => {
  describe('getMainOptionDefinitions', () => {
    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const optionDefinitions = CliUtil.getMainOptionDefinitions()
      // Assert
      expect(Util.isEmptyMap(optionDefinitions)).toEqual(false)
    })
  })

  describe('getResourceOptionDefinitions', () => {
    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const optionDefinitions = CliUtil.getResourceOptionDefinitions()
      // Assert
      expect(Util.isEmptyMap(optionDefinitions)).toEqual(false)
    })
  })

  describe('getSkillOptions', () => {
    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const optionDefinitions = CliUtil.getSkillOptions()
      // Assert
      expect(Util.isEmptyMap(optionDefinitions)).toEqual(false)
    })
  })

  describe('handleHelpOption', () => {
    it('success', () => {
      // Arrange
      spyOn(Util, 'exitWithError').and.returnValue(undefined)
      spyOn(console, 'log')
      const optionDefinitions = [
        {
          name: 'help',
          type: Boolean
        }
      ]

      // Act
      const result = CliUtil.handleHelpOption({}, optionDefinitions)

      // Assert
      expect(result).toBeUndefined()
      expect(console.log).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleVersionOption', () => {
    it('success', () => {
      // Arrange
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const result = CliUtil.handleVersionOption()

      // Assert

      expect(result).toBeUndefined()
    })
  })
})
