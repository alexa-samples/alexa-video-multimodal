import { Util } from '../../src/util/util'

describe('Util', () => {
  describe('formatMilliseconds', () => {
    it('null input', () => {
      // Arrange
      const input = null

      // Act
      const output = Util.formatMilliseconds(input)

      // Assert
      expect(output).toEqual('')
    })

    it('valid input', () => {
      // Arrange
      const input = (1 + 2 * 60 + 3 * 60 * 60) * 1000

      // Act
      const output = Util.formatMilliseconds(input)

      // Assert
      expect(output).toEqual('03:02:01')
    })
  })
})
