/**
 * Log record for CloudWatch Logs
 */
export class LogRecord {
  constructor (message, timestamp) {
    this.message = message
    this.timestamp = timestamp
  }
}

export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}
