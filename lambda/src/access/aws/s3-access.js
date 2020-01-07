import S3 from 'aws-sdk/clients/s3'
import { Constants } from '../../utils/constants'

/**
 * AWS S3 access methods
 */
export class S3Access {
  /**
   * Get an instance of the S3 client API
   * Mainly used for unit testing.
   *
   * @returns {S3} S3 object
   */
  static get s3 () {
    return this._s3 ? this._s3 : new S3()
  }

  /**
   * Set an instance of the S3 client API
   * Mainly used for unit testing.
   *
   * @param {S3} s3 The S3 object
   */
  static set s3 (s3) {
    this._s3 = s3
  }

  /**
   * Create a self-signed URL for an S3 object
   *
   * @param {string} bucket The S3 bucket
   * @param {string} key S3 key of object to sign
   * @param {number} expiry (In seconds) The URL's expiration (default 8 hrs)
   * @param {string} operation The operation to allow with the self signed URL
   * @returns {object} The map of key to self signed S3 URL
   */
  static getSignedUrl (bucket, key, expiry = Constants.DEFAULT_SELF_SIGNED_S3_URL_EXPIRY_SECONDS, operation = 'getObject') {
    return this.s3.getSignedUrl(operation, {
      Bucket: bucket,
      Key: key,
      Expires: expiry // seconds
    })
  }
}
