import { AwsAccountUtil } from '../../../src/util/aws/aws-account-util'
import { Util } from '../../../src/util/util'
import { of } from 'rxjs'
import { FilesystemAccess } from '../../../src/access/filesystem-access'
import { checkIfFileOrDirectoryExistsSpy, chmodSpy, mkdirSpy, touchSpy, writeFileSpy } from '../../run'
import { CloudFormationAccess } from '../../../src/access/aws/cloud-formation-access'
import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'

describe('AwsAccountUtil', () => {
  describe('promptForAwsCredentials', () => {
    it('success', () => {
      // Arrange
      const expectedResults = {}
      spyOn(Util, 'doPrompt').and.returnValue(expectedResults)

      // Act
      const results = AwsAccountUtil.promptForAwsCredentials({})

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('requiresAwsCredentialsPrompt', () => {
    it('does not require', () => {
      // Arrange
      const config = {
        awsAccessKeyId: 'dummy-access-key-id',
        awsSecretAccessKey: 'dummy-secret-access-key',
        region: 'dummy-region'
      }
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(config)
      spyOn(AwsAccountUtil, 'validateCredentials').and.returnValue(of(true))

      // Act
      const o = AwsAccountUtil.requiresAwsCredentialsPrompt()

      // Assert
      o.subscribe(doesRequire => {
        expect(doesRequire).toEqual(false)
      })
    })

    it('does require (missing field)', () => {
      // Arrange
      const config = {
        awsAccessKeyId: 'dummy-access-key-id',
        awsSecretAccessKey: null,
        region: 'dummy-region'
      }
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(config)
      spyOn(AwsAccountUtil, 'validateCredentials').and.returnValue(of(true))

      // Act
      const o = AwsAccountUtil.requiresAwsCredentialsPrompt()

      // Assert
      o.subscribe(doesRequire => {
        expect(doesRequire).toEqual(true)
      })
    })

    it('does require (missing field)', () => {
      // Arrange
      const config = {
        awsAccessKeyId: 'dummy-access-key-id',
        awsSecretAccessKey: 'dummy-secret-access-key',
        region: 'dummy-region'
      }
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(config)
      spyOn(AwsAccountUtil, 'validateCredentials').and.returnValue(of(false))

      // Act
      const o = AwsAccountUtil.requiresAwsCredentialsPrompt()

      // Assert
      o.subscribe(doesRequire => {
        expect(doesRequire).toEqual(true)
      })
    })
  })

  describe('readAwsConfigs', () => {
    it('no ~/.aws directory', () => {
      // Arrange
      const expectedResult = {
        awsAccessKeyId: null,
        awsSecretAccessKey: null
      }
      spyOn(AwsAccountUtil, '_hasAwsDirectory').and.returnValue(false)

      // Act
      const awsConfigs = AwsAccountUtil.readAwsConfigs()

      // Assert
      expect(awsConfigs).toEqual(expectedResult)
    })

    it('no credentials file', () => {
      // Arrange
      const expectedResult = {
        awsAccessKeyId: null,
        awsSecretAccessKey: null
      }
      spyOn(AwsAccountUtil, '_hasAwsDirectory').and.returnValue(true)
      spyOn(AwsAccountUtil, '_hasAwsCredentialsFile').and.returnValue(false)

      // Act
      const awsConfigs = AwsAccountUtil.readAwsConfigs()

      // Assert
      expect(awsConfigs).toEqual(expectedResult)
    })

    it('no profile', () => {
      // Arrange
      const expectedResult = {
        awsAccessKeyId: null,
        awsSecretAccessKey: null
      }
      const iniFileContents = {}
      spyOn(AwsAccountUtil, '_hasAwsDirectory').and.returnValue(true)
      spyOn(AwsAccountUtil, '_hasAwsCredentialsFile').and.returnValue(true)
      spyOn(FilesystemAccess, 'readIniFile').and.returnValues(iniFileContents, iniFileContents)

      // Act
      const awsConfigs = AwsAccountUtil.readAwsConfigs()

      // Assert
      expect(awsConfigs).toEqual(expectedResult)
    })

    it('has profile, but no configs', () => {
      // Arrange
      const expectedResult = {
        awsAccessKeyId: null,
        awsSecretAccessKey: null
      }
      const profile = AwsAccountUtil.getAwsUserProfile()
      const iniFileContents = {}
      iniFileContents[profile] = {}
      spyOn(AwsAccountUtil, '_hasAwsDirectory').and.returnValue(true)
      spyOn(AwsAccountUtil, '_hasAwsCredentialsFile').and.returnValue(true)
      spyOn(FilesystemAccess, 'readIniFile').and.returnValues(iniFileContents, iniFileContents)

      // Act
      const awsConfigs = AwsAccountUtil.readAwsConfigs()

      // Assert
      expect(awsConfigs).toEqual(expectedResult)
    })

    it('has profile and configs', () => {
      // Arrange
      const expectedResult = {
        awsAccessKeyId: 'key',
        awsSecretAccessKey: 'secret'
      }
      const profile = AwsAccountUtil.getAwsUserProfile()
      const credentialsFileContents = {}
      credentialsFileContents[profile] = {
        aws_access_key_id: 'key',
        aws_secret_access_key: 'secret'
      }

      spyOn(AwsAccountUtil, '_hasAwsDirectory').and.returnValue(true)
      spyOn(AwsAccountUtil, '_hasAwsCredentialsFile').and.returnValue(true)
      spyOn(FilesystemAccess, 'readIniFile').and.returnValues(credentialsFileContents)

      // Act
      const awsConfigs = AwsAccountUtil.readAwsConfigs()

      // Assert
      expect(awsConfigs).toEqual(expectedResult)
    })
  })

  describe('persistAwsConfigs', () => {
    it('no ~/.aws directory', () => {
      // Arrange
      const inputConfigs = {
        awsAccessKeyId: 'key',
        awsSecretAccessKey: 'secret',
        region: 'region'
      }
      mkdirSpy.and.returnValue(null)
      touchSpy.and.returnValue(null)
      writeFileSpy.and.returnValue(null)
      spyOn(FilesystemAccess, 'readIniFile').and.returnValue(inputConfigs)
      chmodSpy.and.returnValue(null)
      checkIfFileOrDirectoryExistsSpy.and.returnValues(false, false, false)

      // Act
      const outputConfigs = AwsAccountUtil.persistAwsConfigs(inputConfigs)

      // Assert
      expect(outputConfigs).toEqual(inputConfigs)
    })

    it('has ~/.aws directory, credential, and config file', () => {
      // Arrange
      const inputConfigs = {
        awsAccessKeyId: 'key',
        awsSecretAccessKey: 'secret',
        region: 'region'
      }
      writeFileSpy.and.returnValue(null)
      spyOn(FilesystemAccess, 'readIniFile').and.returnValue(inputConfigs)
      chmodSpy.and.returnValue(null)
      checkIfFileOrDirectoryExistsSpy.and.returnValues(true, true, true)

      // Act
      const outputConfigs = AwsAccountUtil.persistAwsConfigs(inputConfigs)

      // Assert
      expect(outputConfigs).toEqual(inputConfigs)
    })
  })

  describe('validateCredentials', () => {
    it('is valid', () => {
      // Arrange

      spyOn(CloudFormationAccess, 'listStacks').and.returnValue(of({}))
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)
      spyOn(AwsAccountUtil, 'getAwsAccessKeyId').and.returnValue('dummy-access-key-id')
      spyOn(AwsAccountUtil, 'getAwsSecretAccessKey').and.returnValue('dummy-secret-access-leu')

      // Act
      const o = AwsAccountUtil.validateCredentials()

      // Assert
      o.subscribe(isValid => {
        expect(isValid).toEqual(true)
      })
    })

    it('is not valid', () => {
      // Arrange

      spyOn(CloudFormationAccess, 'listStacks').and.returnValue(of(null))
      spyOn(AwsSdkUtil, 'setAwsCredentials').and.returnValue(undefined)
      spyOn(AwsAccountUtil, 'getAwsAccessKeyId').and.returnValue('dummy-access-key-id')
      spyOn(AwsAccountUtil, 'getAwsSecretAccessKey').and.returnValue('dummy-secret-access-leu')

      // Act
      const o = AwsAccountUtil.validateCredentials()

      // Assert
      o.subscribe(isValid => {
        expect(isValid).toEqual(false)
      })
    })
  })
})
