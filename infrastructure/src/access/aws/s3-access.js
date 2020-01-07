import * as log4js from 'log4js'
import { AwsSdkUtil } from '../../util/aws/aws-sdk-util'
import { map, mergeMap } from 'rxjs/operators'
import S3 from 'aws-sdk/clients/s3'
import { FilesystemAccess } from '../filesystem-access'
import mime from 'mime-types'
import path from 'path'
import { Observable } from 'rxjs'

/**
 * AWS S3 access functions
 */
export class S3Access {
  /**
   * Check if a bucket exists
   *
   * @param {string} bucketName Bucket name
   * @returns {Observable<boolean>} An observable - true if the S3 bucket exists
   */
  static checkIfBucketExists (bucketName) {
    const logger = log4js.getLogger('s3-util')
    return S3Access.getBucketLocation(
      bucketName,
      false,
      true,
      'check if bucket exists "' + bucketName + '"')
      .pipe(map(data => {
        if (data) {
          logger.info('Bucket "' + bucketName + '" exists')
          return true
        } else {
          logger.info('Bucket "' + bucketName + '" does not exist')
          return false
        }
      }))
  }

  /**
   * Get bucket location
   *
   * @param {string} bucketName Bucket name
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<{}>} An observable with the bucket location
   */
  static getBucketLocation (bucketName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('cloud-formation-util')
    const params = {
      Bucket: bucketName
    }
    const s3 = new S3()
    return AwsSdkUtil.makeRequest(
      s3,
      s3.getBucketLocation,
      [params],
      logger,
      logMessage || 'get bucket "' + bucketName + '" location',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * List objects in bucket
   *
   * @param {string} bucketName Bucket name
   * @param {string} prefix S3 key prefix
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable<any>} An observable with the S3 bucket objects
   */
  static listObjects (bucketName, prefix = null, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('s3-util')
    const params = {
      Bucket: bucketName
    }
    if (prefix) {
      params.Prefix = prefix
    }
    const s3 = new S3()
    return AwsSdkUtil.makeRequest(
      s3,
      s3.listObjects,
      [params],
      logger,
      logMessage || 'list objects in bucket "' + bucketName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Delete objects in a bucket
   *
   * @param {string} bucketName Bucket name
   * @param {object} objects S3 objects
   * @param {boolean} exitOnError Exit the process if this API call fails
   * @param {boolean} suppressErrorMessage Do not log an error message if this API call fails
   * @param {string} logMessage A log message for the API call
   * @returns {Observable} An observable
   */
  static deleteObjects (bucketName, objects, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('s3-util')
    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: objects,
        Quiet: false
      }
    }
    const s3 = new S3()
    return AwsSdkUtil.makeRequest(
      s3,
      s3.deleteObjects,
      [params],
      logger,
      logMessage || 'delete objects in bucket "' + bucketName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  /**
   * Upload a file to S3
   *
   * @param {string} sourceFilePath Path on the local filesystem to upload
   * @param {string} targetBucket The target S3 bucket
   * @param {string} targetObjectKey The object S3 key
   * @param {string} acl the ACL to apply to the uploaded object
   * @returns {Observable<undefined>} An observable
   */
  static uploadFile (sourceFilePath, targetBucket, targetObjectKey, acl = 'private') {
    const logger = log4js.getLogger('s3-util')
    const s3 = new S3()
    return new Observable(observer => {
      const stream = FilesystemAccess.createReadStream(sourceFilePath)
      const contentType = mime.contentType(path.extname(sourceFilePath))
      const params = {
        Bucket: targetBucket,
        Key: targetObjectKey,
        Body: stream,
        ContentType: contentType,
        ACL: acl,
        CacheControl: 'no-cache',
        Expires: 0
      }
      observer.next(params)
      observer.complete()
    })
      .pipe(mergeMap(params => {
        return AwsSdkUtil.makeRequest(
          s3,
          s3.putObject,
          [params],
          logger,
          'upload "' + sourceFilePath + '" to "' + targetBucket + ':' + targetObjectKey + '"',
          true,
          false)
      }))
  }

  static getBucketTagging (bucketName, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('s3-util')
    const params = {
      Bucket: bucketName
    }
    const s3 = new S3()
    return AwsSdkUtil.makeRequest(
      s3,
      s3.getBucketTagging,
      [params],
      logger,
      logMessage || 'get bucket tagging on bucket "' + bucketName + '"',
      exitOnError,
      suppressErrorMessage)
  }

  static putBucketTagging (bucketName, tagSet, exitOnError = true, suppressErrorMessage = false, logMessage = null) {
    const logger = log4js.getLogger('s3-util')
    const params = {
      Bucket: bucketName,
      Tagging: {
        TagSet: tagSet
      }
    }
    const s3 = new S3()
    return AwsSdkUtil.makeRequest(
      s3,
      s3.putBucketTagging,
      [params],
      logger,
      logMessage || 'put bucket tagging on bucket "' + bucketName + '"',
      exitOnError,
      suppressErrorMessage)
  }
}
