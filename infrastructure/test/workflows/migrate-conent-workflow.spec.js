import { of, throwError } from 'rxjs'
import { checkIfFileOrDirectoryExistsSpy, getCurrentWorkingDirectorySpy, mkdirSpy } from '../run'
import { S3Access } from '../../src/access/aws/s3-access'
import { Util } from '../../src/util/util'
import { MigrateContentWorkflow } from '../../src/workflows/migrate-content-workflow'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'

describe('MigrateContentWorkflow', () => {
  it('_getAvailableContent', () => {
    // Arrange
    // Nothing to arrange

    // Act
    const result = MigrateContentWorkflow._getAvailableContent()

    // Assert
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  describe('_flagFilesRequiringDownload', () => {
    it('requires download', () => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0'
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1'
        }
      ]
      const localContentDir = 'dummy-content-dir'
      checkIfFileOrDirectoryExistsSpy.and.returnValues(false, false, false)
      mkdirSpy.and.returnValue(undefined)

      // Act
      MigrateContentWorkflow._flagFilesRequiringDownload(localContentDir, availableDemoContent)

      // Assert
      expect(availableDemoContent[0].requiresDownload).toEqual(true)
      expect(availableDemoContent[1].requiresDownload).toEqual(true)
      expect(mkdirSpy).toHaveBeenCalledTimes(1)
    })

    it('does not require download', () => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0'
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1'
        }
      ]
      const localContentDir = 'dummy-content-dir'
      checkIfFileOrDirectoryExistsSpy.and.returnValue(true, true, true)

      // Act
      MigrateContentWorkflow._flagFilesRequiringDownload(localContentDir, availableDemoContent)

      // Assert
      expect(availableDemoContent[0].requiresDownload).toEqual(false)
      expect(availableDemoContent[1].requiresDownload).toEqual(false)
      expect(mkdirSpy).not.toHaveBeenCalled()
    })
  })

  describe('_flagFilesRequiringUpload', () => {
    it('requires upload', () => {
      // Arrange
      const s3BaseDirectory = 'dummy-base-dir'
      const s3Contents = []
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true
        }
      ]

      // Act
      MigrateContentWorkflow._flagFilesRequiringUpload(s3BaseDirectory, s3Contents, availableDemoContent)

      // Assert
      expect(availableDemoContent[0].requiresUpload).toEqual(true)
      expect(availableDemoContent[1].requiresUpload).toEqual(true)
      expect(availableDemoContent[0].requiresDownload).toEqual(true)
      expect(availableDemoContent[1].requiresDownload).toEqual(true)
    })

    it('does not require upload', () => {
      // Arrange
      const s3BaseDirectory = 'dummy-base-dir'
      const s3Contents = [
        'dummy-base-dir/dummy-folder-0/dummy-file-0',
        'dummy-base-dir/dummy-folder-1/dummy-file-1'
      ]
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true
        }
      ]

      // Act
      MigrateContentWorkflow._flagFilesRequiringUpload(s3BaseDirectory, s3Contents, availableDemoContent)

      // Assert
      expect(availableDemoContent[0].requiresUpload).toEqual(false)
      expect(availableDemoContent[1].requiresUpload).toEqual(false)
      expect(availableDemoContent[0].requiresDownload).toEqual(false)
      expect(availableDemoContent[1].requiresDownload).toEqual(false)
    })
  })

  describe('migrateContentWorkflow', () => {
    it('requires migration', done => {
      // Arrange
      spyOn(ArtifactStackWorkflow, 'getStackName').and.returnValue('dummy-artifact-stack-name')
      getCurrentWorkingDirectorySpy.and.returnValue('dummy-cwd')
      const _getAvailableContentSpy = spyOn(MigrateContentWorkflow, '_getAvailableContent')
      _getAvailableContentSpy.and.returnValue([
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true,
          requiresUpload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true,
          requiresUpload: true
        }
      ])

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValue(of(true))

      const artifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      artifactBucketNameSpy.and.returnValue(of(undefined))

      const _flagFilesRequiringDownloadSpy = spyOn(MigrateContentWorkflow, '_flagFilesRequiringDownload')
      _flagFilesRequiringDownloadSpy.and.returnValue(undefined)

      const _flagFilesRequiringUploadSpy = spyOn(MigrateContentWorkflow, '_flagFilesRequiringUpload')
      _flagFilesRequiringUploadSpy.and.returnValue(undefined)
      const listObjectsSpy = spyOn(S3Access, 'listObjects')
      listObjectsSpy.and.returnValue(of({ Contents: [] }))

      checkIfFileOrDirectoryExistsSpy.and.returnValues(true, false)
      mkdirSpy.and.returnValues(undefined, undefined)

      spyOn(Util, 'wget').and.returnValues(of('dummy-wget-observable-0'), of('dummy-wget-observable-1'))
      spyOn(S3Access, 'uploadFile').and.returnValues(of('dummy-s3-upload-observable-0'), of('dummy-s3-upload-observable-1'))

      const _downloadAsyncSpy = spyOn(MigrateContentWorkflow, '_migrateAsync')

      // Act
      const o = MigrateContentWorkflow.runMigrateContentWorkflow()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(artifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(_getAvailableContentSpy).toHaveBeenCalledTimes(1)
        expect(_flagFilesRequiringDownloadSpy).toHaveBeenCalledTimes(1)
        expect(_flagFilesRequiringUploadSpy).toHaveBeenCalledTimes(1)
        expect(listObjectsSpy).toHaveBeenCalledTimes(1)
        expect(_downloadAsyncSpy).toHaveBeenCalledTimes(1)
        expect(mkdirSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('does not require migration', done => {
      // Arrange
      spyOn(ArtifactStackWorkflow, 'getStackName').and.returnValue('dummy-artifact-stack-name')
      getCurrentWorkingDirectorySpy.and.returnValue('dummy-cwd')
      const _getAvailableContentSpy = spyOn(MigrateContentWorkflow, '_getAvailableContent')
      _getAvailableContentSpy.and.returnValue([
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: false,
          requiresUpload: false
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: false,
          requiresUpload: false
        }
      ])

      const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
      checkStackExistsSpy.and.returnValue(of(true))

      const artifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      artifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const _flagFilesRequiringDownloadSpy = spyOn(MigrateContentWorkflow, '_flagFilesRequiringDownload')
      _flagFilesRequiringDownloadSpy.and.returnValue(undefined)

      const _flagFilesRequiringUploadSpy = spyOn(MigrateContentWorkflow, '_flagFilesRequiringUpload')
      _flagFilesRequiringUploadSpy.and.returnValue(undefined)
      const listObjectsSpy = spyOn(S3Access, 'listObjects')
      listObjectsSpy.and.returnValue(of({ Contents: [] }))

      const wgetSpy = spyOn(Util, 'wget')
      const uploadFileSpy = spyOn(S3Access, 'uploadFile')

      const _downloadAsyncSpy = spyOn(MigrateContentWorkflow, '_migrateAsync')

      // Act
      const o = MigrateContentWorkflow.runMigrateContentWorkflow()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(checkStackExistsSpy).toHaveBeenCalledTimes(1)
        expect(artifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(_getAvailableContentSpy).toHaveBeenCalledTimes(1)
        expect(_flagFilesRequiringDownloadSpy).toHaveBeenCalledTimes(1)
        expect(_flagFilesRequiringUploadSpy).toHaveBeenCalledTimes(1)
        expect(listObjectsSpy).toHaveBeenCalledTimes(1)
        expect(checkIfFileOrDirectoryExistsSpy).not.toHaveBeenCalled()
        expect(mkdirSpy).not.toHaveBeenCalled()
        expect(wgetSpy).not.toHaveBeenCalled()
        expect(uploadFileSpy).not.toHaveBeenCalled()
        expect(_downloadAsyncSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('_migrateAsync', () => {
    it('success', done => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true,
          requiresUpload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true,
          requiresUpload: true
        }
      ]
      const localContentDir = 'dummy-local-content-dir'
      const s3BaseDirectory = 'dummy-s3-base-directory'
      const downloadRequests = {
        'dummy-download-request-0': of(undefined),
        'dummy-download-request-1': of(undefined)
      }
      const uploadRequests = {
        'dummy-upload-request-0': of(undefined),
        'dummy-upload-request-1': of(undefined)
      }

      // Act
      const s = MigrateContentWorkflow._migrateAsync(availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests)
      //
      // Assert
      s.add(result => {
        expect(result).toBeUndefined()
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE).toEqual(true)
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS).toEqual(true)
        done()
      })
    })

    it('success - empty download', done => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: false,
          requiresUpload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: false,
          requiresUpload: true
        }
      ]
      const localContentDir = 'dummy-local-content-dir'
      const s3BaseDirectory = 'dummy-s3-base-directory'
      const downloadRequests = {}
      const uploadRequests = {
        'dummy-upload-request-0': of(undefined),
        'dummy-upload-request-1': of(undefined)
      }

      // Act
      const s = MigrateContentWorkflow._migrateAsync(availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests)
      //
      // Assert
      s.add(result => {
        expect(result).toBeUndefined()
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE).toEqual(true)
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS).toEqual(true)
        done()
      })
    })

    it('error - download', done => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true,
          requiresUpload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true,
          requiresUpload: true
        }
      ]
      const localContentDir = 'dummy-local-content-dir'
      const s3BaseDirectory = 'dummy-s3-base-directory'
      const downloadRequests = {
        'dummy-download-request-0': throwError('dummy-error'),
        'dummy-download-request-1': of(undefined)
      }
      const uploadRequests = {
        'dummy-upload-request-0': of(undefined),
        'dummy-upload-request-1': of(undefined)
      }

      // Act
      const s = MigrateContentWorkflow._migrateAsync(availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests)
      //
      // Assert
      s.add(result => {
        expect(result).toBeUndefined()
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE).toEqual(true)
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS).toEqual(false)
        done()
      })
    })

    it('error - upload', done => {
      // Arrange
      const availableDemoContent = [
        {
          file: 'dummy-file-0',
          folder: 'dummy-folder-0',
          requiresDownload: true,
          requiresUpload: true
        },
        {
          file: 'dummy-file-1',
          folder: 'dummy-folder-1',
          requiresDownload: true,
          requiresUpload: true
        }
      ]
      const localContentDir = 'dummy-local-content-dir'
      const s3BaseDirectory = 'dummy-s3-base-directory'
      const downloadRequests = {
        'dummy-download-request-0': of(undefined),
        'dummy-download-request-1': of(undefined)
      }
      const uploadRequests = {
        'dummy-upload-request-0': throwError('dummy-error'),
        'dummy-upload-request-1': of(undefined)
      }

      // Act
      const s = MigrateContentWorkflow._migrateAsync(availableDemoContent, localContentDir, s3BaseDirectory, downloadRequests, uploadRequests)
      //
      // Assert
      s.add(result => {
        expect(result).toBeUndefined()
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE).toEqual(true)
        expect(MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS).toEqual(false)
        done()
      })
    })
  })

  describe('waitForVideoContentSync', () => {
    it('success', done => {
      // Arrange
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      MigrateContentWorkflow.S3_CONTENT_SYNC_REQUIRED = true
      MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true
      MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = true

      // Act
      const o = MigrateContentWorkflow.waitForVideoContentSync()

      // Assert
      o.subscribe(result => {
        expect(result).toEqual(true)
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('success (waited)', done => {
      // Arrange
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      MigrateContentWorkflow.S3_CONTENT_SYNC_REQUIRED = true
      MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = false
      MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = true

      // Act
      const o = MigrateContentWorkflow.waitForVideoContentSync()
      setTimeout(() => {
        MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true

        // Assert
        o.subscribe(result => {
          expect(result).toEqual(true)
          expect(exitWithErrorSpy).not.toHaveBeenCalled()
          done()
        })
      }, 1000)
    })

    it('not required', done => {
      // Arrange
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')
      MigrateContentWorkflow.S3_CONTENT_SYNC_REQUIRED = false
      MigrateContentWorkflow.S3_CONTENT_SYNC_COMPLETE = true
      MigrateContentWorkflow.S3_CONTENT_SYNC_SUCCESS = true

      // Act
      const o = MigrateContentWorkflow.waitForVideoContentSync()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })
})
