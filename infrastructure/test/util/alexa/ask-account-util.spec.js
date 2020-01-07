import { AskAccountUtil } from '../../../src/util/alexa/ask-account-util'
import { Util } from '../../../src/util/util'
import { of } from 'rxjs'
import { AwsAccountUtil } from '../../../src/util/aws/aws-account-util'
import oauth2 from 'simple-oauth2'
import { checkIfFileOrDirectoryExistsSpy, mkdirSpy, readFileSpy, touchSpy, writeFileSpy } from '../../run'

describe('AskAccountUtil', () => {
  describe('getRefreshToken', () => {
    it('success', () => {
      // Arrange
      const config = {
        refreshToken: 'dummy-refresh-token'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.getRefreshToken()

      // Assert
      expect(result).toEqual('dummy-refresh-token')
    })
  })

  describe('getVendorId', () => {
    it('success', () => {
      // Arrange
      const config = {
        vendorId: 'dummy-vendor-id'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.getVendorId()

      // Assert
      expect(result).toEqual('dummy-vendor-id')
    })
  })

  describe('getAccessToken', () => {
    it('success', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.getAccessToken()

      // Assert
      expect(result).toEqual('dummy-access-token')
    })
  })

  describe('tokenIsValid', () => {
    it('is valid', () => {
      // Arrange
      const tokenExpiry = Date.now() + 99999

      // Act
      const result = AskAccountUtil.tokenIsValid(tokenExpiry)

      // Assert
      expect(result).toEqual(true)
    })

    it('is not valid', () => {
      // Arrange
      const tokenExpiry = Date.now() - 99999

      // Act
      const result = AskAccountUtil.tokenIsValid(tokenExpiry)

      // Assert
      expect(result).toEqual(false)
    })
  })

  describe('getVendorIdsFromToken', () => {
    it('success', () => {
      // Arrange
      const httpResponse = JSON.stringify({
        vendors: [{ id: 'dummy-vendor-id' }]
      })
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

      // Act
      const o = AskAccountUtil.getVendorIdsFromToken({})

      // Assert
      o.subscribe(vendorIds => {
        expect(vendorIds).toEqual(['dummy-vendor-id'])
      })
    })

    it('null token', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const o = AskAccountUtil.getVendorIdsFromToken(null)

      // Assert
      o.subscribe(vendorIds => {
        expect(vendorIds).toEqual(null)
      })
    })

    it('invalid json response', () => {
      // Arrange
      spyOn(Util, 'exitWithError').and.returnValue(undefined)
      spyOn(Util, 'submitHttpRequest').and.returnValue(of('not-json'))

      // Act
      const o = AskAccountUtil.getVendorIdsFromToken({})

      // Assert
      o.subscribe(vendorIds => {
        expect(vendorIds).toEqual(undefined)
        expect(Util.exitWithError).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object))
      })
    })

    it('no token in json response', () => {
      // Arrange
      spyOn(Util, 'exitWithError').and.returnValue(undefined)
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(JSON.stringify({})))

      // Act
      const o = AskAccountUtil.getVendorIdsFromToken({})

      // Assert
      o.subscribe(vendorIds => {
        expect(vendorIds).toEqual(undefined)
        expect(Util.exitWithError).toHaveBeenCalledWith(jasmine.any(String))
      })
    })
  })

  describe('requestTokens', () => {
    it('success', () => {
      // Arrange
      const dummyToken = {}
      const oa = {
        authorizationCode: {
          getToken: () => Promise.resolve(dummyToken)
        },
        accessToken: {
          create: () => {
            return {
              token: 'dummy-token'
            }
          }
        }
      }

      // Act
      const o = AskAccountUtil.requestTokens(oa, '', '')

      // Assert
      o.subscribe(token => {
        expect(token).toEqual('dummy-token')
      })
    })

    it('error', () => {
      // Arrange
      const oa = {
        authorizationCode: {
          getToken: () => Promise.reject(new Error('some-error'))
        }
      }

      // Act
      const o = AskAccountUtil.requestTokens(oa, '', '')

      // Assert
      o.subscribe(token => {
        expect(token).toEqual(undefined)
      })
    })
  })

  describe('requiresAskCredentialsPrompt', () => {
    it('valid', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'never',
        expiresAt: Date.now() + 99999,
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'

      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.requiresAskCredentialsPrompt()

      // Assert
      expect(result).toEqual(false)
    })

    it('not valid missing value', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: null,
        expiresIn: 'never',
        expiresAt: Date.now() + 99999,
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'

      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.requiresAskCredentialsPrompt()

      // Assert
      expect(result).toEqual(true)
    })

    it('not valid expired token', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'always',
        expiresAt: Date.now() - 99999,
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'

      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(config)

      // Act
      const result = AskAccountUtil.requiresAskCredentialsPrompt()

      // Assert
      expect(result).toEqual(true)
    })
  })

  describe('readAskConfigs', () => {
    it('no ~/.ask directory', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(false)

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory but no config file', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(false)

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory and config file but no profiles section', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      const fileContents = {}
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory, config, profiles section no profile defined', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      const fileContents = {
        profiles: {}
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory, config, profiles section, profile defined, but no configs', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      const fileContents = {
        profiles: {}
      }
      fileContents.profiles[AskAccountUtil.getAskUserProfile()] = {}
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory, config, profiles section, profile defined, but no token', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      const fileContents = {
        profiles: {}
      }
      fileContents.profiles[AskAccountUtil.getAskUserProfile()] = {
        vendor_id: 'dummy-vendor-id',
        aws_profile: 'dummy-aws-profile',
        token: null
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory, config, profiles section, profile defined, and token with null values', () => {
      // Arrange
      const config = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      const fileContents = {
        profiles: {}
      }
      fileContents.profiles[AskAccountUtil.getAskUserProfile()] = {
        vendor_id: 'dummy-vendor-id',
        aws_profile: 'dummy-aws-profile',
        token: {
          access_token: null,
          refresh_token: null,
          token_type: null,
          expires_in: null,
          expires_at: null
        }
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })

    it('has ~/.ask directory, config, profiles section, profile defined, and token', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      const fileContents = {
        profiles: {}
      }
      fileContents.profiles[AskAccountUtil.getAskUserProfile()] = {
        vendor_id: 'dummy-vendor-id',
        aws_profile: 'dummy-aws-profile',
        token: {
          access_token: 'dummy-access-token',
          refresh_token: 'dummy-refresh-token',
          token_type: 'dummy-token-type',
          expires_in: 'dummy-expires-in',
          expires_at: 'dummy-expires-at'
        }
      }
      spyOn(AskAccountUtil, '_hasAskDirectory').and.returnValue(true)
      spyOn(AskAccountUtil, '_hasAskConfigFile').and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(fileContents))

      // Act
      const askConfigs = AskAccountUtil.readAskConfigs()

      // Assert
      expect(askConfigs).toEqual(config)
    })
  })

  describe('persistAskConfigs', () => {
    it('no ~/.ask directory', () => {
      // Arrange
      const inputConfigs = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      checkIfFileOrDirectoryExistsSpy.and.returnValues(false, false)
      mkdirSpy.and.returnValue(null)
      touchSpy.and.returnValue(null)
      readFileSpy.and.returnValue(inputConfigs)
      writeFileSpy.and.returnValue(null)

      // Act
      const outputConfigs = AskAccountUtil.persistAskConfigs(inputConfigs)

      // Assert
      expect(outputConfigs).toEqual(inputConfigs)
    })

    it('has ~/.ask directory no content', () => {
      // Arrange
      const inputConfigs = {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        expiresAt: null,
        vendorId: null,
        awsProfile: null
      }
      checkIfFileOrDirectoryExistsSpy.and.returnValues(true, true)
      readFileSpy.and.returnValue(inputConfigs)
      writeFileSpy.and.returnValue(null)

      // Act
      const outputConfigs = AskAccountUtil.persistAskConfigs(inputConfigs)

      // Assert
      expect(outputConfigs).toEqual(inputConfigs)
    })
  })

  describe('promptForAskCredentials', () => {
    it('success', () => {
      // Arrange
      const config = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: AwsAccountUtil.getAwsUserProfile()
      }
      spyOn(oauth2, 'create').and.returnValue({ authorizationCode: { authorizeURL: () => 'dummy-auth-url' } })
      const token = {
        token_type: 'dummy-token-type',
        refresh_token: 'dummy-refresh-token',
        access_token: 'dummy-access-token',
        expires_in: 'dummy-expires-in',
        expires_at: 'dummy-expires-at'
      }
      spyOn(Util, 'doPrompt').and.returnValue(of(config))
      spyOn(AskAccountUtil, 'requestTokens').and.returnValue(of(token))
      spyOn(AskAccountUtil, 'getVendorIdsFromToken').and.returnValue(of(['dummy-vendor-id']))
      spyOn(AskAccountUtil, 'getVendorId').and.returnValue('dummy-vendor-id-1')

      // Act
      const o = AskAccountUtil.promptForAskCredentials('dummy-security-profile-id', 'dummy-security-profile-client-secret')

      // Assert
      o.subscribe(result => {
        expect(result).toEqual(config)
      })
    })
  })
})
