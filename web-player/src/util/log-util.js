import * as Logger from 'js-logger'
import { CloudWatchLogsUtil } from './cloud-watch-logs-util'
import { LogLevel } from '../models/log-record'

/**
 * Utility methods relating to logging
 */
export class LogUtil {
  /**
   * Configure the logger used by the web player
   */
  static init () {
    Logger.useDefaults({
      defaultLevel: Logger.INFO,
      formatter: function (messages, context) {
        messages.unshift('[' + context.name + ']')
        messages.unshift('[web-player]')
      }
    })
  }

  /**
   * Overwrite the console logger so logs can be shipped to AWS CloudWatch
   */
  static configureConsoleLogger () {
    this.oldConsole = console

    window.console = {
      log: (...args) => {
        this.oldConsole.log.apply(this.oldConsole, args)
        this.cloudWatchLogsUtil.logMessage(LogLevel.DEBUG, args)
        // this.oldConsole.re.log.apply(this.oldConsole, args)
      },
      info: (...args) => {
        this.oldConsole.info.apply(this.oldConsole, args)
        this.cloudWatchLogsUtil.logMessage(LogLevel.INFO, args)
        // this.oldConsole.re.info.apply(this.oldConsole, args)
      },
      warn: (...args) => {
        this.oldConsole.warn.apply(this.oldConsole, args)
        this.cloudWatchLogsUtil.logMessage(LogLevel.WARN, args)
        // this.oldConsole.re.warn.apply(this.oldConsole, args)
      },
      error: (...args) => {
        this.oldConsole.error.apply(this.oldConsole, args)
        this.cloudWatchLogsUtil.logMessage(LogLevel.ERROR, args)
        // this.oldConsole.re.error.apply(this.oldConsole, args)
      }
    }
  }

  static get oldConsole () {
    return this._oldConsole
  }

  static set oldConsole (oldConsole) {
    this._oldConsole = oldConsole
  }

  static get cloudWatchLogsUtil () {
    this._cloudWatchLogsUtil = this._cloudWatchLogsUtil || new CloudWatchLogsUtil()
    return this._cloudWatchLogsUtil
  }
}
