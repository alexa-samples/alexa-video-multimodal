import $ from 'jquery'

/**
 * Utility methods to assist with unit tests
 */
export class TestUtils {
  /**
   * Get the DOM for the web page (useful for testing UI)
   *
   * @returns {object} JQuery object with the dom
   */
  static getTestDom () {
    window.__html__ = window.__html__ || {}
    return $('<body>').append($.parseHTML(window.__html__['index.html']))
  }

  /**
   * Mock alexa interface (an object provided by the external liv AlexWebPlayerContoller)
   *
   * @returns {object} A mock Alexa interface
   */
  static getMockAlexaInterface () {
    return {
      setMetadata: (...args) => {

      },
      setPlayerState: (...args) => {

      },
      setAllowedOperations: (...args) => {

      },
      close: (...args) => {

      },
      on: (...args) => {

      },
      showLoadingOverlay: (...args) => {

      },
      sendError: (...args) => {

      }
    }
  }

  /**
   * An object provided by an external lib
   *
   * @returns {object} Mock alexa web player controller
   */
  static getMockAlexaWebPlayerController () {
    return {
      initialize: (...args) => {

      }
    }
  }
}
