import * as log4js from 'log4js'

/**
 * Logging utility functions
 */
export class LogUtil {
  /**
   * Configure the logger
   */
  static configure () {
    log4js.configure({
      appenders: {
        out: { type: 'console' }
      },
      categories: {
        default: {
          appenders: ['out'],
          level: 'warn'
        },
        app: {
          appenders: ['out'],
          level: 'info'
        }
      }
    })
  }
}
