import { TestUtils } from './test-utils.spec'

describe('index.html', () => {
  it('exists', () => {
    // Arrange
    const mockDom = TestUtils.getTestDom()

    // Act
    const playerElement = mockDom.find('#player')

    // Assert
    expect(playerElement).toBeDefined()
    expect(playerElement.length).toEqual(1)
  })
})
