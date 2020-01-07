import { configure } from 'log4js'

/**
 * Logging utility functions
 */
export class LogUtil {
  /**
   * Configure the logger
   *
   * @param {string} requestId The request Id associated with the lambda invocation
   */
  static configure (requestId) {
    configure({
      appenders: {
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern',
            pattern: `[%p] [${requestId}] [%d] [%c] %m%n`
          }
        }
      },
      categories: {
        default: {
          appenders: ['out'],
          level: 'debug'
        }
      }
    })
  }
}
