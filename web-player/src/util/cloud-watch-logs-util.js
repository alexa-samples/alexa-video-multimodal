import throttle from 'lodash/throttle'
import padStart from 'lodash/padStart'
import { LogRecord } from '../models/log-record'
import { ApiGatewayAccess } from '../access/api-gateway-access'
import * as Logger from 'js-logger'

/**
 * Utility methods for logging to CloudWatch Logs
 * Calls to `logMessage` will append `LogRecord` objects to an array called `logRecordCache`. It will then attempt to
 * flush those records to CloudWatch Logs by calling  `flushLogRecordCacheThrottled`.
 * `flushLogRecordCacheThrottled` is throttled so logs are pushed to CloudWatch Logs no more than once every 2000 ms.
 */
export class CloudWatchLogsUtil {
  constructor () {
    this.logger = Logger.get('cloud watch logs util')
    this.logRecordCache = []
    this.cloudWatchLogsCredentialsReceived = false
    this.cloudWatchLogsEnabled = false
    this.flushLogRecordCacheThrottled = throttle(this.flushLogRecordCache.bind(this), 2000, {
      trailing: true,
      leading: false
    })
    this.sequenceToken = null
    this.lastLogStreamName = null
  }

  /**
   * Configure the web player to log (or not log) to cloud watch logs
   *
   * @param {object} awsMetadata An object that contains AWS credentials, the flag cloudWatchLogsEnabled which is passed down via the lambda to enable & disale logging
   * @returns {Promise} A thenable promise (mainly used for testing)
   */
  configure (awsMetadata) {
    this.logger.info('configuring cloud watch logs')
    this.credentials = awsMetadata.credentials
    this.cloudWatchLogsCredentialsReceived = !!this.credentials
    this.logger.info('cloud watch logs aws credentials are set? ', this.cloudWatchLogsCredentialsReceived)
    if (awsMetadata.cloudWatchLogsEnabled) {
      this.logger.info('cloud watch logs are enabled')
      this.apiGatewayId = awsMetadata.apiGatewayId
      this.region = awsMetadata.region
      this.customerId = awsMetadata.customerId
      this.logger.info('Getting existing log stream sequence token (if any)')
      return this.setExistingLogStreamSequenceToken()
        .then(() => {
          this.logger.info('log stream sequence token: ' + this.sequenceToken)
          this.cloudWatchLogsEnabled = awsMetadata.cloudWatchLogsEnabled
          this.logger.info('will begin logging to cloud watch logs')
        })
    } else {
      this.logger.info('cloud watch logs are not enabled')
      return Promise.resolve()
    }
  }

  /**
   * Log a message to CloudWatch Logs
   *
   * @param {string} level The log level
   * @param {object} messageArgs The args passed to console (log, info, error, etc.)
   */
  logMessage (level, messageArgs) {
    const message = `[${level}] ${messageArgs.join(' ')}`
    const logRecord = new LogRecord(message, new Date().getTime())
    this.logRecordCache.push(logRecord)
    this.flushLogRecordCacheThrottled()
  }

  /**
   * Flush the log cache to CloudWatch Logs.
   * If CloudWatch logging is not enabled, the log will be purged every time after 1000 log messages have been added to it.
   *
   * @returns {Promise} A thenable promise (mainly used for unit testing)
   */
  flushLogRecordCache () {
    if (this.cloudWatchLogsEnabled && this.cloudWatchLogsCredentialsReceived) {
      const logStreamName = this.generateLogStreamName()
      // clone the logs
      const logs = this.logRecordCache.slice()
      this.logRecordCache = []
      if (this.lastLogStreamName !== logStreamName) {
        this.sequenceToken = null
      }
      this.lastLogStreamName = logStreamName
      if (logs.length > 0) {
        const promise = Promise.resolve(undefined) // initialize a chain of then able promises
        if (this.sequenceToken === null) {
          promise
            .then(() => ApiGatewayAccess.createCloudWatchLogsLogStream(this.apiGatewayId, this.region, this.credentials, logStreamName))
            .then(() => ApiGatewayAccess.getSequenceToken(this.apiGatewayId, this.region, this.credentials, logStreamName))
            .then(sequenceToken => {
              this.sequenceToken = sequenceToken
              return Promise.resolve()
            })
        }
        promise.then(() => ApiGatewayAccess.putLogEvents(this.apiGatewayId, this.region, this.credentials, logStreamName, this.sequenceToken, logs))
          .then(sequenceToken => {
            this.sequenceToken = sequenceToken
          })
        return promise
      } else {
        return Promise.resolve() // no logs to flush
      }
    } else if (this.logRecordCache.length > 1000) {
      this.logRecordCache = []
      this.logger.warn('purging log cache because it has grown too large without being able to be flushed to cloud watch logs')
    }
    return Promise.resolve()
  }

  /**
   * Get the sequence token for the current log stream. If the log stream does not exist return null.
   *
   * @returns {Promise<string|null>} A thenable promise with the sequence token
   */
  setExistingLogStreamSequenceToken () {
    const logStreamName = this.generateLogStreamName()
    return ApiGatewayAccess.getSequenceToken(this.apiGatewayId, this.region, this.credentials, logStreamName)
      .then(sequenceToken => {
        this.sequenceToken = sequenceToken || null
        this.lastLogStreamName = sequenceToken ? logStreamName : null
      })
  }

  /**
   * Generate the log stream name.
   * The log stream name is formatted as yyyy/mm/dd/hh/customerId where customerId is
   * the customer id from 3p account set up during the account linking process
   *
   * @returns {string} The log stream name
   */
  generateLogStreamName () {
    const now = new Date()
    const year = padStart(now.getUTCFullYear(), 4, '0')
    const month = padStart(now.getUTCMonth() + 1, 2, '0')
    const day = padStart(now.getUTCDay(), 2, '0')
    const hour = padStart(now.getUTCHours(), 2, '0')
    return `${year}/${month}/${day}/${hour}/${this.customerId}`
  }
}
