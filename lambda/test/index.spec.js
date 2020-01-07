import { Handler } from '../src/handlers/handler'
import { handler } from '../src'

describe('index', () => {
  it('handler', () => {
    // Arrange
    const handleRequestsSpy = spyOn(Handler, 'handleRequests')
    handleRequestsSpy.and.returnValue(Promise.resolve(undefined))

    // Act
    const event = {
      event: 'event'
    }
    const context = {
      context: 'context'
    }
    const result = handler(event, context, () => {
    })

    // Assert
    expect(result).toBeUndefined()
    expect(handleRequestsSpy).toHaveBeenCalledWith(event, context)
  })
})
