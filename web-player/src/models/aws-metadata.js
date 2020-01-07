/**
 * AWS metadata state model
 */
export class AwsMetadata {
  constructor () {
    this.credentials = new AwsCredentials()
    this.region = null
    this.apiGatewayId = null
    this.customerId = null
    this.cloudWatchLogsEnabled = false
  }
}

export class AwsCredentials {
  constructor () {
    this.AccessKeyId = null
    this.SecretAccessKey = null
    this.SessionToken = null
    this.Expiration = null
  }

  static fromObject (o) {
    return Object.assign(new AwsCredentials(), o)
  }
}
