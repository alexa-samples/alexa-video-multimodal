import * as Logger from 'js-logger'
import { AwsClient } from 'aws4fetch'
import { AlexaController } from '../controllers/alexa-controller'

export class ApiGatewayAccess {
  static get logger () {
    return Logger.get('api-gateway-access')
  }

  /**
   * Get a configured AWS client object to be used to send requests to the API Gateway
   *
   * @param {object} awsCredentials  awsCredentials Current AWS credentials to authenticate this request
   * @returns {AwsClient} The AWS client object
   */
  static getAwsClient (awsCredentials) {
    return new AwsClient({
      accessKeyId: awsCredentials.AccessKeyId,
      secretAccessKey: awsCredentials.SecretAccessKey,
      sessionToken: awsCredentials.SessionToken
    })
  }

  /**
   * Get a new set of AWS IAM STS credentials
   *
   * @param {string} apiGatewayId API Gateway Id
   * @param {string} region AWS Region
   * @param {object} awsCredentials Current AWS credentials to authenticate this request
   * @returns {Promise} A promise with the new credentials
   */
  static retrieveNewAwsStsCredentials (apiGatewayId, region, awsCredentials) {
    this.logger.info('submitting refresh aws sts credentials request')
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`
    const path = '/prod/lambda'
    const method = 'POST'
    const payload = {
      directive: {
        header: {
          name: 'RefreshWebPlayerCredentials'
        }
      }
    }

    const aws = this.getAwsClient(awsCredentials)

    const url = endpoint + path
    return aws.fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(data => {
        this.logger.debug('successfully retrieved aws sts credentials ')
        return data.json()
      })
      .catch(err => {
        this.logger.error('there was an error retrieving the aws sts credentials', err)
      })
  }

  /**
   * Get a playback context token for a specific videoId. This is intended to be used for playing next/previous episodes.
   *
   * @param {string} apiGatewayId The Id of the AWS API Gateway
   * @param {string} region The AWS region for the AWS API gateway
   * @param {object} awsCredentials AWS credentials to authenticate the request
   * @param {string} videoId The video Id
   * @returns {Promise<string>} A promise that resolves to the playback context token
   */
  static getPlaybackContextTokenForVideoId (apiGatewayId, region, awsCredentials, videoId) {
    this.logger.info('submitting request to get a playback context token', videoId)
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`
    const path = '/prod/lambda'
    const method = 'POST'
    const payload = {
      directive: {
        header: {
          name: 'GetPlayableItemsMetadata'
        },
        payload: {
          mediaIdentifier: {
            id: videoId
          }
        }
      }
    }
    const aws = this.getAwsClient(awsCredentials)

    const url = endpoint + path
    return aws
      .fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(data => {
        return data.json()
      })
      .then(json => {
        if (json && json.event && json.event.payload && json.event.payload.searchResults && json.event.payload.searchResults.length > 0) {
          const result = json.event.payload.searchResults[0].playbackContextToken

          this.logger.debug('successfully retrieved playback context token ')
          return result
        } else {
          throw new Error(`Unable to parse the json response: ${json}`)
        }
      })
      .catch(err => {
        this.logger.error('there was an error retrieving the playback context token', err)
      })
  }

  /**
   * Send information to the lambda to update the video progress
   *
   * @param {string} apiGatewayId The Id of the AWS API gateway
   * @param {string} region The AWS region for the AWS API gateway
   * @param {object} awsCredentials AWS credentials to authenticate the request
   * @param {string} videoId The video Id
   * @param {number} positionInMilliseconds The time position of the video in milliseconds
   * @returns {Promise<string>} A promise that resolves to the playback context token
   */
  static updateVideoProgress (apiGatewayId, region, awsCredentials, videoId, positionInMilliseconds) {
    this.logger.debug('submitting request to update the current time position of the video', videoId, positionInMilliseconds)
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`
    const path = '/prod/lambda'
    const method = 'POST'
    const payload = {
      directive: {
        header: {
          name: 'UpdateVideoProgress'
        },
        payload: {
          videoProgress: {
            id: videoId,
            positionInMilliseconds: positionInMilliseconds,
            accessToken: AlexaController.accessToken
          }
        }
      }
    }
    const aws = ApiGatewayAccess.getAwsClient(awsCredentials)
    const url = endpoint + path
    return aws
      .fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .catch(err => {
        ApiGatewayAccess.logger.error('there was an error updating the video time', err)
      })
  }

  /**
   * Create a CloudWatch Logs log stream. The log group is hard coded per skill and created once
   * when the skill is initially deployed.
   *
   * @param {string} apiGatewayId The API gateway Id
   * @param {string} region The AWS region where the API Gateway is deployed
   * @param {object} awsCredentials AWS credentials to authenticate the request
   * @param {string} logStreamName The name of the log stream to be created
   * @returns {Promise} A thenable promise
   */
  static createCloudWatchLogsLogStream (apiGatewayId, region, awsCredentials, logStreamName) {
    this.logger.debug('submitting request to create a CloudWatch logs Log stream', logStreamName)
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`
    const logStreamNameEncoded = encodeURIComponent(logStreamName)
    const path = `/prod/cloud-watch-logs/create-log-stream?log-stream-name=${logStreamNameEncoded}`
    const method = 'POST'
    const aws = ApiGatewayAccess.getAwsClient(awsCredentials)
    const url = endpoint + path
    return aws
      .fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .catch(err => {
        ApiGatewayAccess.logger.error('there was an error creating the cloud watch logs log stream', err)
        console.error('err', err)
        return Promise.resolve()
      })
      .then(() => {
        this.logger.debug('create cloud watch logs log stream success')
        return Promise.resolve()
      })
  }

  /**
   * Write a batch of log messages to a specified log stream in CloudWatch Logs.
   * The log group is hard coded per skill and created once
   * when the skill is initially deployed.
   * The schema for the logEvents is an array of objects with two keys: message and timestamp.
   * e.g.
   * [{message: 'some log message', timestamp: new Date().getTime()},...]
   *
   * @param {string} apiGatewayId The API Gateway Id
   * @param {string} region The AWS region where the API gateway is deployed
   * @param {object} awsCredentials AWS credentials to authenticate the request
   * @param {string} logStreamName The name of the log stream to be created
   * @param {string} sequenceToken The sequence token for the cloud watch logs API
   * @param {Array} logEvents The schema for the logEvents is an array of objects with two keys: message and timestamp.
   * @returns {Promise<any>} A thenable promise
   */
  static putLogEvents (apiGatewayId, region, awsCredentials, logStreamName, sequenceToken, logEvents) {
    this.logger.debug('submitting a put log events to CloudWatch Logs', logStreamName)
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`

    const payload = {
      logStreamName: logStreamName,
      messages: logEvents
    }
    if (sequenceToken) {
      payload.sequenceToken = sequenceToken
    }

    const path = `/prod/cloud-watch-logs/put-log-events`
    const method = 'POST'
    const aws = ApiGatewayAccess.getAwsClient(awsCredentials)
    const url = endpoint + path
    return aws
      .fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        this.logger.debug('put log events success')
        return data.nextSequenceToken
      })
      .catch(err => {
        ApiGatewayAccess.logger.error('there was an error with the put log events request', err)
        console.error('err', err)
        return null
      })
  }

  /**
   * Get the sequence token for a specific log stream for writing logs to CloudWatch logs
   *
   * @param {string} apiGatewayId The API gateway Id
   * @param {string} region The AWS region where the API gateway is deployed
   * @param {object} awsCredentials AWS credentials to authenticate the request
   * @param {string} logStreamName The name of the log stream to be created
   * @returns {Promise<any>} A thenable promise
   */
  static getSequenceToken (apiGatewayId, region, awsCredentials, logStreamName) {
    this.logger.debug('submitting a get sequence token request to cloud watch logs', logStreamName)
    const host = `${apiGatewayId}.execute-api.${region}.amazonaws.com`
    const endpoint = `https://${host}`

    const logStreamNameEncoded = encodeURIComponent(logStreamName)
    const path = `/prod/cloud-watch-logs/get-sequence-token?log-stream-name=${logStreamNameEncoded}`
    const method = 'GET'
    const aws = ApiGatewayAccess.getAwsClient(awsCredentials)
    const url = endpoint + path
    return aws
      .fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        this.logger.debug('get sequence token success')
        return data.sequenceToken || null
      })
      .catch(err => {
        ApiGatewayAccess.logger.error('there was an error with the get sequence token request', err)
        console.error('err', err)
        return null
      })
  }
}
