import { WebPlayer } from '../src/web-player'

describe('WebPlayer', () => {
  it('init', () => {
    // Arrange
    const webPlayer = new WebPlayer()
    const alexaControllerInitSpy = spyOn(webPlayer.alexaController, 'init')
    const videoControllerInitSpy = spyOn(webPlayer.videoController, 'init')
    const uiControllerInitSpy = spyOn(webPlayer.uiController, 'init')
    const apiGatewayControllerInitSpy = spyOn(webPlayer.apiGatewayController, 'init')

    // Act
    const result = webPlayer.init()

    // Assert
    expect(result).toBeUndefined()
    expect(alexaControllerInitSpy).toHaveBeenCalledTimes(1)
    expect(videoControllerInitSpy).toHaveBeenCalledTimes(1)
    expect(uiControllerInitSpy).toHaveBeenCalledTimes(1)
    expect(apiGatewayControllerInitSpy).toHaveBeenCalledTimes(1)
  })
})
