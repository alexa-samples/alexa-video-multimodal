import { FilesystemAccess } from '../access/filesystem-access'
import * as log4js from 'log4js'
import { Util } from '../util/util'
import { filter, map, mergeMap, take } from 'rxjs/operators'
import { forkJoin, of, timer } from 'rxjs'
import { Constants } from '../util/constants'
import { S3Access } from '../access/aws/s3-access'
import { APP_LOGGER } from '../infrastructure'
import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import { ArtifactStackWorkflow } from './artifact-stack-workflow'
import { DeployWorkflow } from './deploy-workflow'

/**
 * This class manages workflows related to migrating sample content to a customer owned S3 bucket
 */
export class MigrateContentWorkflow {
  /**
   * This workflow will determine what video related content needs to be migrated to a customer's private bucket and then perform
   * that migration if needed. The migration consists of downloading content to the local computer from a
   * publicly available cloud front URL and then uploading that content to the Artifact bucket under
   * the directory /content.
   *
   * @returns {Observable} An empty observable
   */
  static runMigrateContentWorkflow () {
    MigrateContentWorkflow.S3_CONTENT_SYNC_REQUIRED = true
    const artifactStackName = ArtifactStackWorkflow.getStackName()
    const cwd = FilesystemAccess.getCurrentWorkingDirectory()
    const localContentDir = FilesystemAccess.constructPath([cwd, '.content'])
    const s3BaseDirectory = 'content'
    let artifactBucketName = null
    // a list of available demo video content that can be migrated to customer's private video content bucket
    const availableDemoContent = this._getAvailableContent()

    // of the available demo video content files, flag files that have not yet been downloaded locally
    this._flagFilesRequiringDownload(localContentDir, availableDemoContent)

    // check what is currently in S3
    return CloudFormationAccess.checkStackExists(artifactStackName)
      .pipe(map(exists => {
        if (!exists) {
          Util.exitWithError('The artifact stack does not exist. Cannot update the web player.')
        }
      }))
      .pipe(mergeMap(() => ArtifactStackWorkflow.getArtifactBucketName()))
      .pipe(map((b) => {
        artifactBucketName = b
        DeployWorkflow.logger.info('Using this video content s3 bucket "' + artifactBucketName + '"')
      }))
      .pipe(mergeMap(() => S3Access.listObjects(artifactBucketName, s3BaseDirectory)))
      .pipe(map(s3Objects => {
        const s3Contents = s3Objects.Contents.map(c => c.Key)

        // of the available demo video content files, flag files that have not yet been uploaded to S3
        this._flagFilesRequiringUpload(s3BaseDirectory, s3Contents, availableDemoContent)

        // create download requests that can run in parallel
        const downloadRequests = {}
        availableDemoContent
          .filter(o => o.requiresDownload)
          .forEach(o => {
            const source = Constants.DEMO_CONTENT_BASE_URL + o.folder + '/' + o.file
            const targetFolder = FilesystemAccess.constructPath([localContentDir, o.folder])
            const target = FilesystemAccess.constructPath([targetFolder, o.file])
            // The target directory must exist prior to the download
            if (!FilesystemAccess.checkIfFileOrDirectoryExists(targetFolder)) {
              FilesystemAccess.mkdir(targetFolder)
            }
            downloadRequests[target] = Util.wget(source, target)
          })

        // create upload requests that can run in parallel
        const uploadRequests = {}
        availableDemoContent
          .filter(o => o.requiresUpload)
          .forEach(o => {
            const source = FilesystemAccess.constructPath([localContentDir, o.folder, o.file])
            const target = s3BaseDirectory + '/' + o.folder + '/' + o.file
            uploadRequests[target] = S3Access.uploadFile(source, artifactBucketName, target)
          })
          // Only migrate if there is a need to migrate
        if (!Util.isEmptyMap(uploadRequests)) {
          // Start an async process that will perform the downloads and then the uploads
          this._migrateAsync(availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests)
        } else {
          // no need to start any downloads
          APP_LOGGER.info('No need to upload video content files to S3')
          MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = true
          MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true
        }
      }))
  }

  /**
   * Poll every 500 ms to check if the video content download has completed or not.
   * Return only the downloads/uploads have completed.
   *
   * @returns {Observable} An observable
   */
  static waitForVideoContentSync () {
    if (!MigrateContentWorkflow.S3_CONTENT_SYNC_REQUIRED) {
      // No download was required, no need to wait
      return of(undefined)
    } else {
      if (!MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE) {
        APP_LOGGER.info('Waiting for video content to be uploaded to S3 (This can take a few minutes)')
      }
      // TODO: add a timeout for this polling
      // Poll every 500ms to check the static variable MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE
      return timer(0, 500)
        .pipe(filter(() => {
          if (MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE) {
            if (MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS) {
              return true
            } else {
              Util.exitWithError('There was an error migrating video content to the s3 directory')
            }
          } else {
            return false
          }
        }))
        .pipe(take(1))
        .pipe(map(() => MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS))
    }
  }

  /**
   * Get available demo content
   *
   * @returns {Array} List of content
   */
  static _getAvailableContent () {
    const availableContent = []
    Constants.DEMO_CONTENT_PATHS.forEach(val => {
      if (val.VIDEO) {
        availableContent.push({
          file: val.VIDEO,
          folder: val.FOLDER
        })
      }
      if (val.THUMBNAIL) {
        availableContent.push({
          file: val.THUMBNAIL,
          folder: val.FOLDER
        })
      }
      if (val.CC_FILE) {
        availableContent.push({
          file: val.CC_FILE,
          folder: val.FOLDER
        })
      }
    })
    return availableContent
  }

  /**
   * Flag files that need to be downloaded. A file needs to be downloaded if it doesn't
   * exist on the local computer already from a previous execution of this code
   *
   * @param {string} localContentDir The local directory where to download the demo content
   * @param {Array} availableDemoContent A list of available demo content
   */
  static _flagFilesRequiringDownload (localContentDir, availableDemoContent) {
    // Create the local directory where content will be downloaded to, if it doesn't already exist
    if (!FilesystemAccess.checkIfFileOrDirectoryExists(localContentDir)) {
      FilesystemAccess.mkdir(localContentDir)
    }
    availableDemoContent.forEach(o => {
      const localFile = FilesystemAccess.constructPath([localContentDir, o.folder, o.file])
      o.requiresDownload = !FilesystemAccess.checkIfFileOrDirectoryExists(localFile)
    })
  }

  /**
   * Flag files that need to be uploaded. A file needs to be uploaded if it doesn't exist
   * on S3. If a file is present in S3, but not present locally, it will overwrite the `requiresDownload` flag by
   * setting it to false.
   *
   * @param {string} s3BaseDirectory The S3 base directory where the demo content is hosted
   * @param {Array} s3Contents A list of existing S3 files
   * @param {Array} availableDemoContent A list of available demo content
   */
  static _flagFilesRequiringUpload (s3BaseDirectory, s3Contents, availableDemoContent) {
    availableDemoContent.forEach(o => {
      const file = s3BaseDirectory + '/' + o.folder + '/' + o.file
      o.requiresUpload = s3Contents.indexOf(file) === -1
      // do not download files that do not need to be uploaded to S3
      if (!o.requiresUpload && o.requiresDownload) {
        o.requiresDownload = false
      }
    })
  }

  /**
   * Start an asynchronous process to download any required demo video content files locally,
   * and then upload any required demo video content files to S3. When the process is ongoing, a
   * static variable `MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE` will be set to `false`, and then, when the process completes,
   * it will be set to `true`. Upon completion of the process, the success of the process can be checked using `MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS`.
   *
   * @param {Array} availableDemoContent A list of available demo content
   * @param {string} localContentDir The local directory where to download the demo content
   * @param {string} s3BaseDirectory The S3 base directory where the demo content is hosts
   * @param {object} downloadRequests An object containing the download requests
   * @param {object} uploadRequests An object containing the upload to S3 requests
   * @returns {*} The result of the subscription
   */
  static _migrateAsync (availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests) {
    // Logging
    APP_LOGGER.info('Will download these video content files in the background:')
    availableDemoContent
      .filter(o => o.requiresDownload)
      .forEach(o => APP_LOGGER.info(`\t- ${FilesystemAccess.constructPath([localContentDir, o.folder, o.file])}`))
    APP_LOGGER.info('Will upload these video content files to S3 in the background:')
    availableDemoContent
      .filter(o => o.requiresUpload)
      .forEach(o => APP_LOGGER.info(`\t- ${s3BaseDirectory + '/' + o.folder + '/' + o.file}`))

    // non-blocking download locally -> upload to s3 process
    this.logger.info(`Submitting ${Object.keys(downloadRequests).length} download requests`)
    return (Util.isEmptyMap(downloadRequests) ? of(undefined) : forkJoin(downloadRequests))
      .pipe(mergeMap(() => {
        this.logger.info(`Downloads complete`)
        this.logger.info(`Submitting ${Object.keys(uploadRequests).length} upload requests`)
        return (Util.isEmptyMap(uploadRequests) ? of(undefined) : forkJoin(uploadRequests))
      }))
      .subscribe(() => {
        APP_LOGGER.info('Video content successfully uploaded to S3')
        MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = true
        MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true
      }, (err) => {
        APP_LOGGER.info('There was an error migrating demo video content to S3', err)
        MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = false
        MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true
      })
  }

  static set S3_CONTENT_SYNC_COMPLETE (isComplete) {
    this._isComplete = isComplete
  }

  static get S3_CONTENT_SYNC_COMPLETE () {
    return this._isComplete !== false && this._isComplete !== true ? false : this._isComplete
  }

  static set S3_CONTENT_SYNC_SUCCESS (isSuccess) {
    this._isSuccess = isSuccess
  }

  static get S3_CONTENT_SYNC_SUCCESS () {
    return this._isSuccess !== false && this._isSuccess !== true ? false : this._isSuccess
  }

  static set S3_CONTENT_SYNC_REQUIRED (isRequired) {
    this._isRequired = isRequired
  }

  static get S3_CONTENT_SYNC_REQUIRED () {
    return this._isRequired !== false && this._isRequired !== true ? false : this._isRequired
  }

  static get logger () {
    return log4js.getLogger('migrate-content-workflow')
  }
}
