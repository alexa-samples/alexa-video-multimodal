import { CloudWatchLogsUtil } from '../../src/util/cloud-watch-logs-util'
import { LogLevel, LogRecord } from '../../src/models/log-record'
import { ApiGatewayAccess } from '../../src/access/api-gateway-access'

describe('CloudWatchLogsUtil', () => {
  let cloudWatchLogsUtil = null
  beforeEach(() => {
    cloudWatchLogsUtil = new CloudWatchLogsUtil()
  })
  describe('configure', () => {
    it('cloud watch logging enabled', done => {
      // Arrange

      const setExistingLogStreamSequenceTokenSpy = spyOn(cloudWatchLogsUtil, 'setExistingLogStreamSequenceToken')
      setExistingLogStreamSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      const awsMetadata = {
        credentials: {
          AccessKeyId: 'dummy-access-key-id',
          SecretAccessKey: 'dummy-secret-access-key'
        },
        cloudWatchLogsEnabled: true
      }

      // Act
      const promise = cloudWatchLogsUtil.configure(awsMetadata)

      // Assert
      promise.then(results => {
        expect(results).toBeUndefined()
        expect(cloudWatchLogsUtil.cloudWatchLogsCredentialsReceived).toEqual(true)
        expect(cloudWatchLogsUtil.cloudWatchLogsEnabled).toEqual(true)
        expect(setExistingLogStreamSequenceTokenSpy).toHaveBeenCalledTimes(1)
        done()
      }).catch(done.fail)
    })

    it('cloud watch logging disabled', done => {
      // Arrange
      const setExistingLogStreamSequenceTokenSpy = spyOn(cloudWatchLogsUtil, 'setExistingLogStreamSequenceToken')
      setExistingLogStreamSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      const awsMetadata = {
        credentials: {
          AccessKeyId: 'dummy-access-key-id',
          SecretAccessKey: 'dummy-secret-access-key'
        },
        cloudWatchLogsEnabled: false
      }

      // Act
      const promise = cloudWatchLogsUtil.configure(awsMetadata)

      // Assert
      promise.then(results => {
        expect(results).toBeUndefined()
        expect(cloudWatchLogsUtil.cloudWatchLogsCredentialsReceived).toEqual(true)
        expect(cloudWatchLogsUtil.cloudWatchLogsEnabled).toEqual(false)
        expect(setExistingLogStreamSequenceTokenSpy).not.toHaveBeenCalled()
        done()
      }).catch(done.fail)
    })
  })

  it('logMessage', () => {
    // Arrange
    const level = LogLevel.INFO
    const messageArgs = ['dummy-lopg-message']
    const flushLogRecordCacheThrottledSpy = spyOn(cloudWatchLogsUtil, 'flushLogRecordCacheThrottled')
    flushLogRecordCacheThrottledSpy.and.returnValue(undefined)

    // Act
    const result = cloudWatchLogsUtil.logMessage(level, messageArgs)

    // Assert
    expect(flushLogRecordCacheThrottledSpy).toHaveBeenCalledTimes(1)
    expect(result).toBeUndefined()
    expect(cloudWatchLogsUtil.logRecordCache.length).toEqual(1)
  })

  describe('setExistingLogStreamSequenceToken', () => {
    it('has sequence token', done => {
      // Arrange
      const logStreamNameSpy = spyOn(cloudWatchLogsUtil, 'generateLogStreamName')
      logStreamNameSpy.and.returnValue('dummy-log-stream-name')
      const getSequenceTokenSpy = spyOn(ApiGatewayAccess, 'getSequenceToken')
      getSequenceTokenSpy.and.returnValue(Promise.resolve('dummy-sequence-token'))

      // Act
      const promise = cloudWatchLogsUtil.setExistingLogStreamSequenceToken()

      // Assert
      promise.then(result => {
        expect(logStreamNameSpy).toHaveBeenCalledTimes(1)
        expect(getSequenceTokenSpy).toHaveBeenCalledTimes(1)
        expect(cloudWatchLogsUtil.sequenceToken).toEqual('dummy-sequence-token')
        expect(cloudWatchLogsUtil.lastLogStreamName).toEqual('dummy-log-stream-name')
        done()
      }).catch(() => done.fail())
    })

    it('does not have sequence token', done => {
      // Arrange
      const logStreamNameSpy = spyOn(cloudWatchLogsUtil, 'generateLogStreamName')
      logStreamNameSpy.and.returnValue('dummy-log-stream-name')
      const getSequenceTokenSpy = spyOn(ApiGatewayAccess, 'getSequenceToken')
      getSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      // Act
      const promise = cloudWatchLogsUtil.setExistingLogStreamSequenceToken()

      // Assert
      promise.then(result => {
        expect(logStreamNameSpy).toHaveBeenCalledTimes(1)
        expect(getSequenceTokenSpy).toHaveBeenCalledTimes(1)
        expect(cloudWatchLogsUtil.sequenceToken).toBeNull()
        expect(cloudWatchLogsUtil.lastLogStreamName).toBeNull()
        done()
      }).catch(() => done.fail())
    })
  })

  it('generateLogStreamName', () => {
    // Arrange
    cloudWatchLogsUtil.customerId = 'dummy-customer-id'

    // Act
    const result = cloudWatchLogsUtil.generateLogStreamName()

    // Assert
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}\/\d{2}\/dummy-customer-id$/)
  })

  describe('flushLogRecordCache', () => {
    it('enabled - 0 logs', done => {
      // Arrange
      cloudWatchLogsUtil.cloudWatchLogsEnabled = true
      cloudWatchLogsUtil.cloudWatchLogsCredentialsReceived = true
      cloudWatchLogsUtil.logRecordCache = []

      const generateLogStreamNameSpy = spyOn(cloudWatchLogsUtil, 'generateLogStreamName')
      generateLogStreamNameSpy.and.returnValue('dummy-log-stream-name')

      const createCloudWatchLogsLogStreamSpy = spyOn(ApiGatewayAccess, 'createCloudWatchLogsLogStream')
      createCloudWatchLogsLogStreamSpy.and.returnValue(Promise.resolve())

      const getSequenceTokenSpy = spyOn(ApiGatewayAccess, 'getSequenceToken')
      getSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      const putLogEventsSpy = spyOn(ApiGatewayAccess, 'putLogEvents')
      putLogEventsSpy.and.returnValue(Promise.resolve('dummy-sequence-token'))

      // Act
      const promise = cloudWatchLogsUtil.flushLogRecordCache()

      // Assert
      promise.then(result => {
        expect(result).toBeUndefined()
        expect(generateLogStreamNameSpy).toHaveBeenCalledTimes(1)
        expect(createCloudWatchLogsLogStreamSpy).not.toHaveBeenCalled()
        expect(getSequenceTokenSpy).not.toHaveBeenCalled()
        expect(putLogEventsSpy).not.toHaveBeenCalled()
        expect(cloudWatchLogsUtil.logRecordCache.length).toEqual(0)

        done()
      }).catch(() => done.fail())
    })
    it('disabled', done => {
      // Arrange
      cloudWatchLogsUtil.cloudWatchLogsEnabled = false
      cloudWatchLogsUtil.cloudWatchLogsCredentialsReceived = false
      cloudWatchLogsUtil.logRecordCache.push(new LogRecord(`dummy-log-message`, new Date().getTime()))
      const generateLogStreamNameSpy = spyOn(cloudWatchLogsUtil, 'generateLogStreamName')
      generateLogStreamNameSpy.and.returnValue('dummy-log-stream-name')

      const createCloudWatchLogsLogStreamSpy = spyOn(ApiGatewayAccess, 'createCloudWatchLogsLogStream')
      createCloudWatchLogsLogStreamSpy.and.returnValue(Promise.resolve())

      const getSequenceTokenSpy = spyOn(ApiGatewayAccess, 'getSequenceToken')
      getSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      const putLogEventsSpy = spyOn(ApiGatewayAccess, 'putLogEvents')
      putLogEventsSpy.and.returnValue(Promise.resolve('dummy-sequence-token'))

      // Act
      const promise = cloudWatchLogsUtil.flushLogRecordCache()

      // Assert
      promise.then(result => {
        expect(result).toBeUndefined()
        expect(generateLogStreamNameSpy).not.toHaveBeenCalled()
        expect(createCloudWatchLogsLogStreamSpy).not.toHaveBeenCalled()
        expect(getSequenceTokenSpy).not.toHaveBeenCalled()
        expect(putLogEventsSpy).not.toHaveBeenCalled()
        expect(cloudWatchLogsUtil.logRecordCache.length).toEqual(1)

        done()
      }).catch(() => done.fail())
    })
    it('disabled - > 1000 logs', done => {
      // Arrange
      cloudWatchLogsUtil.cloudWatchLogsEnabled = false
      cloudWatchLogsUtil.cloudWatchLogsCredentialsReceived = false

      const generateLogStreamNameSpy = spyOn(cloudWatchLogsUtil, 'generateLogStreamName')
      generateLogStreamNameSpy.and.returnValue('dummy-log-stream-name')

      const createCloudWatchLogsLogStreamSpy = spyOn(ApiGatewayAccess, 'createCloudWatchLogsLogStream')
      createCloudWatchLogsLogStreamSpy.and.returnValue(Promise.resolve())

      const getSequenceTokenSpy = spyOn(ApiGatewayAccess, 'getSequenceToken')
      getSequenceTokenSpy.and.returnValue(Promise.resolve(null))

      const putLogEventsSpy = spyOn(ApiGatewayAccess, 'putLogEvents')
      putLogEventsSpy.and.returnValue(Promise.resolve('dummy-sequence-token'))

      for (let i = 0; i < 1001; i++) {
        cloudWatchLogsUtil.logRecordCache.push(new LogRecord(`dummy-log-message-${i}`, new Date().getTime()))
      }

      // Act
      const promise = cloudWatchLogsUtil.flushLogRecordCache()

      // Assert
      promise.then(result => {
        expect(result).toBeUndefined()
        expect(generateLogStreamNameSpy).not.toHaveBeenCalled()
        expect(createCloudWatchLogsLogStreamSpy).not.toHaveBeenCalled()
        expect(getSequenceTokenSpy).not.toHaveBeenCalled()
        expect(putLogEventsSpy).not.toHaveBeenCalled()
        expect(cloudWatchLogsUtil.logRecordCache.length).toEqual(0)

        done()
      }).catch(() => done.fail())
    })
  })
})
