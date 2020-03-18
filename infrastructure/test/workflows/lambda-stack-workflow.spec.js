import { LambdaStackWorkflow } from '../../src/workflows/lambda-stack-workflow'
import { ArtifactStackWorkflow } from '../../src/workflows/artifact-stack-workflow'
import { of } from 'rxjs'
import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { AskAccountUtil } from '../../src/util/alexa/ask-account-util'
import { AwsAccountUtil } from '../../src/util/aws/aws-account-util'
import { S3Access } from '../../src/access/aws/s3-access'
import { Util } from '../../src/util/util'
import { CloudFormationAccess } from '../../src/access/aws/cloud-formation-access'
import { SmapiAccess } from '../../src/access/alexa/smapi-access'
import { CognitoAccess } from '../../src/access/aws/cognito-access'
import { AwsWorkflow } from '../../src/workflows/aws-workflow'
import { StsAccess } from '../../src/access/aws/sts-access'
import { readFileSpy } from '../run'
import { LambdaAccess } from '../../src/access/aws/lambda-access'
import { Constants } from '../../src/util/constants'

describe('LambdaStackWorkflow', () => {
  describe('getParameters', () => {
    it('success', () => {
      // Arrange
      // Nothing to arrange

      // Act
      const results = LambdaStackWorkflow.getParameters(
        'dummy-project-name',
        'dummy-artifact-bucket',
        'dummy-lambda-s3-key',
        'dummy-aws-account-number'
      )

      // Assert
      expect(results).toBeDefined()
      expect(results.length).toEqual(4)
    })
  })

  describe('sortS3ObjectsByCreatedTimeDesc', () => {
    it('success', () => {
      // Arrange
      const objects = [
        { LastModified: '2019-07-02T00:32:47.575Z' },
        { LastModified: '2019-07-03T00:32:47.575Z' },
        { LastModified: '2019-07-03T00:32:47.575Z' },
        { LastModified: '2019-07-11T00:32:47.575Z' },
        { LastModified: '2019-07-01T00:32:47.575Z' },
        { LastModified: '2019-07-06T00:32:47.575Z' }
      ]

      // Act
      const sortedObjects = LambdaStackWorkflow.sortS3ObjectsByCreatedTimeDesc(objects)

      // Assert
      expect(sortedObjects).toBeDefined()
      expect(sortedObjects.length).toEqual(6)
      expect(sortedObjects[0].LastModified).toEqual('2019-07-11T00:32:47.575Z')
      expect(sortedObjects[5].LastModified).toEqual('2019-07-01T00:32:47.575Z')
    })

    it('null input', () => {
      // Arrange
      const objects = null

      // Act
      const sortedObjects = LambdaStackWorkflow.sortS3ObjectsByCreatedTimeDesc(objects)

      // Assert
      expect(sortedObjects).toBeDefined()
      expect(sortedObjects.length).toEqual(0)
    })
  })

  describe('resolveStackParameters', () => {
    it('success', done => {
      // Arrange
      const expectedResults = [
        {
          ParameterKey: 'ProjectName',
          ParameterValue: 'dummy-project-name'
        },
        {
          ParameterKey: 'ArtifactBucket',
          ParameterValue: 'dummy-bucket-name'
        },
        {
          ParameterKey: 'LambdaZipFileS3ObjectKey',
          ParameterValue: 'dummy-s3-lambda-key'
        },
        {
          ParameterKey: 'AwsAccountNumber',
          ParameterValue: 'dummy-aws-account-number'
        }]
      const projectConfig = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)
      spyOn(ArtifactStackWorkflow, 'getArtifactBucketName').and.returnValue(of('dummy-bucket-name'))
      spyOn(LambdaStackWorkflow, 'getLambdaS3Key').and.returnValue(of('dummy-s3-lambda-key'))
      spyOn(StsAccess, 'getAccountNumber').and.returnValue(of('dummy-aws-account-number'))

      // Act
      const o = LambdaStackWorkflow.resolveStackParameters()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        done()
      })
    })
  })

  describe('getDomain', () => {
    it('success', () => {
      // Arrange
      const expectedResults = 'dummy-project-name'
      const projectConfig = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)

      // Act
      const results = LambdaStackWorkflow.getDomain()

      // Assert
      expect(results.startsWith(expectedResults)).toBeTruthy()
    })
  })

  describe('renderUrl', () => {
    it('success', () => {
      // Arrange
      const expectedResults = 'blah.dummy-domain.dummy-region.dummy-vendor-id'
      const input = 'blah.{SubDomain}.{Region}.{VendorId}'

      // Act
      const results = LambdaStackWorkflow.renderUrl(input, 'dummy-domain', 'dummy-region', 'dummy-vendor-id')

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('getLambdaS3Key', () => {
    it('has results', () => {
      // Arrange
      const expectedResults = 'dummy-key'
      spyOn(S3Access, 'listObjects').and.returnValue(of(['a', 'b', 'c']))
      spyOn(LambdaStackWorkflow, 'sortS3ObjectsByCreatedTimeDesc').and.returnValue([{ Key: 'dummy-key' }])

      // Act
      const o = LambdaStackWorkflow.getLambdaS3Key('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
      })
    })

    it('no results', () => {
      // Arrange
      spyOn(S3Access, 'listObjects').and.returnValue(of([]))
      spyOn(LambdaStackWorkflow, 'sortS3ObjectsByCreatedTimeDesc').and.returnValue([])
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const o = LambdaStackWorkflow.getLambdaS3Key('dummy-bucket')

      // Assert
      o.subscribe(results => {
        expect(results).toBeUndefined()
      })
    })
  })

  describe('configureAccountLinking', () => {
    it('domain does not exist', () => {
      // Arrange
      const config = {
        awsAccessKeyId: 'dummy-access-key-id',
        awsSecretAccessKey: 'dummy-secret-access-key',
        region: 'us-east-1'
      }
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(config)
      const projectConfig = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)
      const askConfig = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(askConfig)
      const description0 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-user-pool'
        }
      }
      const description1 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-cognito-client-id'
        }
      }
      const description2 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-skill-id'
        }
      }
      const description3 = {
        UserPoolClient: {
          ClientSecret: 'dummy-cognito-client-secret'
        }
      }

      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValues(
        of(description0),
        of(description1),
        of(description2)
      )
      spyOn(CognitoAccess, 'describeUserPoolClient').and.returnValues(
        of(description3))

      spyOn(CognitoAccess, 'describeUserPool').and.returnValue(of({}))
      const createUserPoolDomainSpy = spyOn(CognitoAccess, 'createUserPoolDomain')
      createUserPoolDomainSpy.and.returnValue(of(undefined))
      spyOn(CognitoAccess, 'updateUserPoolClient').and.returnValue(of(undefined))
      spyOn(SmapiAccess, 'getSkillStage').and.returnValue(of(undefined))
      spyOn(SmapiAccess, 'configureSkillAccountLinking').and.returnValue(of(undefined))

      // Act
      const o = LambdaStackWorkflow.configureAccountLinking()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(undefined)
        expect(createUserPoolDomainSpy).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String))
      })
    })

    it('domain does not exist', () => {
      // Arrange
      const config = {
        awsAccessKeyId: 'dummy-access-key-id',
        awsSecretAccessKey: 'dummy-secret-access-key',
        region: 'us-east-1'
      }
      spyOn(AwsAccountUtil, 'readAwsConfigs').and.returnValue(config)
      const projectConfig = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)
      const askConfig = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(askConfig)
      const description0 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-user-pool'
        }
      }
      const description1 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-cognito-client-id'
        }
      }
      const description2 = {
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-skill-id'
        }
      }
      const description3 = {
        UserPoolClient: {
          ClientSecret: 'dummy-cognito-client-secret'
        }
      }
      spyOn(CloudFormationAccess, 'describeStackResource').and.returnValues(
        of(description0),
        of(description1),
        of(description2)
      )
      spyOn(CognitoAccess, 'describeUserPoolClient').and.returnValues(
        of(description3))
      spyOn(CognitoAccess, 'describeUserPool').and.returnValue(of({
        UserPool: {
          Domain: 'dummy-domain'
        }
      }))
      const createUserPoolDomainSpy = spyOn(CognitoAccess, 'createUserPoolDomain')
      createUserPoolDomainSpy.and.returnValue(of(undefined))
      spyOn(CognitoAccess, 'updateUserPoolClient').and.returnValue(of(undefined))
      spyOn(SmapiAccess, 'getSkillStage').and.returnValue(of(undefined))
      spyOn(SmapiAccess, 'configureSkillAccountLinking').and.returnValue(of(undefined))

      // Act
      const o = LambdaStackWorkflow.configureAccountLinking()

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(undefined)
        expect(createUserPoolDomainSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe('deleteWorkflow', () => {
    it('success - skill existed before', () => {
      // Arrange
      const getStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      getStackNameSpy.and.returnValue('dummy-stack-name')

      const getAccessTokenSpy = spyOn(AskAccountUtil, 'getAccessToken')
      getAccessTokenSpy.and.returnValue('dummy-access-token')

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-bucket'))

      const geSkillId = spyOn(LambdaStackWorkflow, 'getSkillId')
      geSkillId.and.returnValue(of('dummy-skill-id'))

      const deleteSkillSpy = spyOn(SmapiAccess, 'deleteSkill')
      deleteSkillSpy.and.returnValue(of(undefined))

      const stackDeletionWorkflowSpy = spyOn(AwsWorkflow, 'stackDeletionWorkflow')
      stackDeletionWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const o = LambdaStackWorkflow.deleteWorkflow()

      // Assert
      o.subscribe((results) => {
        expect(results).toBeUndefined()
        expect(getStackNameSpy).toHaveBeenCalledTimes(1)
        expect(getAccessTokenSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(geSkillId).toHaveBeenCalledTimes(1)
        expect(deleteSkillSpy).toHaveBeenCalledTimes(1)
        expect(stackDeletionWorkflowSpy).toHaveBeenCalledTimes(1)
      })
    })

    it('success - skill did not exist before', () => {
      // Arrange
      const getStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
      getStackNameSpy.and.returnValue('dummy-stack-name')

      const getAccessTokenSpy = spyOn(AskAccountUtil, 'getAccessToken')
      getAccessTokenSpy.and.returnValue('dummy-access-token')

      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-bucket'))

      const geSkillId = spyOn(LambdaStackWorkflow, 'getSkillId')
      geSkillId.and.returnValue(of(null))

      const deleteSkillSpy = spyOn(SmapiAccess, 'deleteSkill')
      deleteSkillSpy.and.returnValue(of(undefined))

      const stackDeletionWorkflowSpy = spyOn(AwsWorkflow, 'stackDeletionWorkflow')
      stackDeletionWorkflowSpy.and.returnValue(of(undefined))

      // Act
      const o = LambdaStackWorkflow.deleteWorkflow()

      // Assert
      o.subscribe((results) => {
        expect(results).toBeUndefined()
        expect(getStackNameSpy).toHaveBeenCalledTimes(1)
        expect(getAccessTokenSpy).toHaveBeenCalledTimes(1)
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(geSkillId).toHaveBeenCalledTimes(1)
        expect(deleteSkillSpy).not.toHaveBeenCalled()
        expect(stackDeletionWorkflowSpy).toHaveBeenCalledTimes(1)
      })
    })
  })

  it('updateWorkflow', done => {
    // Arrange
    const projectConfig = {
      projectName: 'dummy-project-name',
      projectRoot: 'dummy-project-root',
      askSecurityProfileClientId: 'dummy-client-id',
      askSecurityProfileClientSecret: 'dummy-secret',
      skillName: 'dummy-skill-name'

    }
    spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)
    const resolveStackParametersSpy = spyOn(LambdaStackWorkflow, 'resolveStackParameters').and.returnValue(of(undefined))
    const stackUpdateWorkflowSpy = spyOn(AwsWorkflow, 'stackUpdateWorkflow').and.returnValue(of(undefined))
    const createSkillIfNeededSpy = spyOn(LambdaStackWorkflow, 'createSkill').and.returnValue(of(undefined))

    // Act
    const o = LambdaStackWorkflow.updateWorkflow()

    // Assert
    o.subscribe(results => {
      expect(results).toBeUndefined()
      expect(resolveStackParametersSpy).toHaveBeenCalledTimes(1)
      expect(stackUpdateWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(createSkillIfNeededSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('runCreateWorkflow', done => {
    // Arrange
    const getTemplateFilePathSpy = spyOn(LambdaStackWorkflow, 'getTemplateFilePath')
    getTemplateFilePathSpy.and.returnValue('dummy-path')

    const getStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
    getStackNameSpy.and.returnValue('dummy-stack-name')

    const resolveStackParametersSpy = spyOn(LambdaStackWorkflow, 'resolveStackParameters')
    resolveStackParametersSpy.and.returnValue(of({ 'dummy-param-key': 'dummy-param-value' }))

    const checkStackExistsSpy = spyOn(CloudFormationAccess, 'checkStackExists')
    checkStackExistsSpy.and.returnValue(of(false))

    const stackCreationWorkflowSpy = spyOn(AwsWorkflow, 'stackCreationWorkflow')
    stackCreationWorkflowSpy.and.returnValue(of(undefined))

    const createSkillSpy = spyOn(LambdaStackWorkflow, 'createSkill')
    createSkillSpy.and.returnValue(of(undefined))

    // Act
    const o = LambdaStackWorkflow.runCreateWorkflow()

    // Assert
    o.subscribe(results => {
      expect(results).toBeUndefined()
      expect(getTemplateFilePathSpy).toHaveBeenCalledTimes(1)
      expect(getStackNameSpy).toHaveBeenCalledTimes(1)
      expect(resolveStackParametersSpy).toHaveBeenCalledTimes(1)
      expect(checkStackExistsSpy).toHaveBeenCalledTimes(1)
      expect(stackCreationWorkflowSpy).toHaveBeenCalledTimes(1)
      expect(createSkillSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('getLambdaFunctionName', done => {
    // Arrange
    const description = {
      StackResourceDetail: {
        PhysicalResourceId: 'dummy-lambda-function-name'
      }
    }

    const getStackNameSpy = spyOn(LambdaStackWorkflow, 'getStackName')
    getStackNameSpy.and.returnValue('dummy-stack-name')

    const describeStackResourceSpy = spyOn(CloudFormationAccess, 'describeStackResource')
    describeStackResourceSpy.and.returnValue(of(description))

    // Act
    const o = LambdaStackWorkflow.getLambdaFunctionName()

    // Assert
    o.subscribe(results => {
      expect(results).toEqual('dummy-lambda-function-name')
      expect(describeStackResourceSpy).toHaveBeenCalledTimes(1)
      expect(getStackNameSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  /* eslint no-template-curly-in-string: "off" */
  it('resolveSkillManifestTemplate', () => {
    // Arrange
    const skillName = 'dummy-skill-name'
    const artifactBucketName = 'dummy-artifact-bucket-name'
    const skillManifestTemplate = {
      manifest: {
        publishingInformation: {
          locales: {
            'en-US': {}
          }
        },
        apis: {
          video: {
            regions: {},
            locales: {
              'en-US': {}
            },
            countries: {
              US: {}
            }
          }
        }
      },
      dummyLambdaEndpointUriDefaultKey: '${LambdaEndpointUriDefault}',
      dummySkillNameKey0: '${skillName}',
      dummySkillNameKey1: '${skillName}',
      dummyArtifactBucketNameKey: '${artifactBucketName}'
    }
    const getCountrySpy = spyOn(ProjectConfigUtil, 'getCountry')
    getCountrySpy.and.returnValue('dummy-country')

    const getLocalesSpy = spyOn(ProjectConfigUtil, 'getLocales')
    getLocalesSpy.and.returnValue(['dummy-locale'])

    const handleLegacyCountryLocaleOneToOneMappingSpy = spyOn(LambdaStackWorkflow, 'handleLegacyCountryLocaleOneToOneMapping')
    handleLegacyCountryLocaleOneToOneMappingSpy.and.returnValue(undefined)

    // Act
    const resolvedManifest = LambdaStackWorkflow.resolveSkillManifestTemplate(JSON.stringify(skillManifestTemplate), skillName, artifactBucketName)

    // Assert
    expect(resolvedManifest.dummySkillNameKey0).toEqual(skillName)
    expect(resolvedManifest.dummySkillNameKey1).toEqual(skillName)
    expect(resolvedManifest.dummyArtifactBucketNameKey).toEqual(artifactBucketName)

    expect(resolvedManifest.manifest.publishingInformation.locales['dummy-locale']).toEqual({})
    expect(resolvedManifest.manifest.apis.video.locales['dummy-locale']).toEqual({})
    expect(resolvedManifest.manifest.apis.video.countries['dummy-country']).toEqual({})

    expect(getCountrySpy).toHaveBeenCalledTimes(1)
    expect(getLocalesSpy).toHaveBeenCalledTimes(1)
    expect(handleLegacyCountryLocaleOneToOneMappingSpy).toHaveBeenCalledTimes(1)
  })

  /* eslint no-template-curly-in-string: "off" */
  describe('resolveSkillManifestTemplate', () => {
    it('NA deployment', () => {
      // Arrange
      const region = 'us-east-1'
      const lambdaFunctionArn = 'dummy-arn'
      const skillManifestTemplate = {
        manifest: {
          publishingInformation: {
            locales: {
              'en-US': {}
            }
          },
          apis: {
            video: {
              regions: {},
              locales: {
                'en-US': {}
              },
              countries: {
                US: {}
              }
            }
          }
        }
      }

      // Act
      const resolvedManifest = LambdaStackWorkflow.addLambdaArnsToSkill(skillManifestTemplate, lambdaFunctionArn, region)

      // Assert
      expect(resolvedManifest.manifest.apis.video.regions.NA).toBeDefined()
      expect(resolvedManifest.manifest.apis.video.regions.EU).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.FE).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.NA.endpoint.uri).toEqual(lambdaFunctionArn)
      expect(resolvedManifest.manifest.apis.video.endpoint.uri).toEqual(lambdaFunctionArn)
    })
    it('EU deployment', () => {
      // Arrange
      const region = 'eu-west-1'
      const lambdaFunctionArn = 'dummy-arn'
      const skillManifestTemplate = {
        manifest: {
          publishingInformation: {
            locales: {
              'en-US': {}
            }
          },
          apis: {
            video: {
              regions: {},
              locales: {
                'en-US': {}
              },
              countries: {
                US: {}
              }
            }
          }
        }
      }

      // Act
      const resolvedManifest = LambdaStackWorkflow.addLambdaArnsToSkill(skillManifestTemplate, lambdaFunctionArn, region)

      // Assert
      expect(resolvedManifest.manifest.apis.video.regions.NA).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.EU).toBeDefined()
      expect(resolvedManifest.manifest.apis.video.regions.FE).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.EU.endpoint.uri).toEqual(lambdaFunctionArn)
      expect(resolvedManifest.manifest.apis.video.endpoint.uri).toEqual(lambdaFunctionArn)
    })
    it('FE deployment', () => {
      // Arrange
      const region = 'us-west-2'
      const lambdaFunctionArn = 'dummy-arn'
      const skillManifestTemplate = {
        manifest: {
          publishingInformation: {
            locales: {
              'en-US': {}
            }
          },
          apis: {
            video: {
              regions: {},
              locales: {
                'en-US': {}
              },
              countries: {
                US: {}
              }
            }
          }
        }
      }

      // Act
      const resolvedManifest = LambdaStackWorkflow.addLambdaArnsToSkill(skillManifestTemplate, lambdaFunctionArn, region)

      // Assert
      expect(resolvedManifest.manifest.apis.video.regions.NA).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.EU).toBeUndefined()
      expect(resolvedManifest.manifest.apis.video.regions.FE).toBeDefined()
      expect(resolvedManifest.manifest.apis.video.regions.FE.endpoint.uri).toEqual(lambdaFunctionArn)
      expect(resolvedManifest.manifest.apis.video.endpoint.uri).toEqual(lambdaFunctionArn)
    })
  })

  describe('createNewSkill', () => {
    it('success', done => {
      // Arrange
      const projectConfig = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      const askConfig = {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        tokenType: 'dummy-token-type',
        expiresIn: 'dummy-expires-in',
        expiresAt: 'dummy-expires-at',
        vendorId: 'dummy-vendor-id',
        awsProfile: 'dummy-aws-profile'
      }
      spyOn(AskAccountUtil, 'readAskConfigs').and.returnValue(askConfig)
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(projectConfig)
      spyOn(LambdaStackWorkflow, 'getStackName').and.returnValue('dummy-stack-name')

      readFileSpy.and.returnValue('dummy-manifest-template')

      const describeStackResourceSpy = spyOn(CloudFormationAccess, 'describeStackResource')
      describeStackResourceSpy.and.returnValue(of({
        StackResourceDetail: {
          PhysicalResourceId: 'dummy-lambda-function-name'
        }
      }))

      const getFunctionSpy = spyOn(LambdaAccess, 'getFunction')
      getFunctionSpy.and.returnValue(of({
        Configuration: {
          FunctionArn: 'dummy-function-arn'
        }
      }))

      const resolveSkillManifestTemplateSpy = spyOn(LambdaStackWorkflow, 'resolveSkillManifestTemplate')
      resolveSkillManifestTemplateSpy.and.returnValue('dummy-resolved-manifest')

      const createSkillAndWaitSpy = spyOn(SmapiAccess, 'createSkillAndWait')
      createSkillAndWaitSpy.and.returnValue(of('dummy-skill-id'))

      const getBucketTaggingSpy = spyOn(S3Access, 'getBucketTagging')
      getBucketTaggingSpy.and.returnValue(of({
        TagSet: []
      }))

      const putBucketTaggingSpy = spyOn(S3Access, 'putBucketTagging')
      putBucketTaggingSpy.and.returnValue(of(undefined))

      const addPermissionSpy = spyOn(LambdaAccess, 'addPermission')
      addPermissionSpy.and.returnValue(of(undefined))

      const addLambdaArnsToSkillSpy = spyOn(LambdaStackWorkflow, 'addLambdaArnsToSkill')
      addLambdaArnsToSkillSpy.and.returnValue(of({}))

      const updateSkillAndWaitSpy = spyOn(SmapiAccess, 'updateSkillAndWait')
      updateSkillAndWaitSpy.and.returnValue(of(null))

      const configureAccountLinking = spyOn(LambdaStackWorkflow, 'configureAccountLinking')
      configureAccountLinking.and.returnValue(of(undefined))

      // Act
      const o = LambdaStackWorkflow.createNewSkill('dummy-artifact-bucket-name')

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(describeStackResourceSpy).toHaveBeenCalledTimes(1)
        expect(getFunctionSpy).toHaveBeenCalledTimes(1)
        expect(resolveSkillManifestTemplateSpy).toHaveBeenCalledTimes(1)
        expect(createSkillAndWaitSpy).toHaveBeenCalledTimes(1)
        expect(getBucketTaggingSpy).toHaveBeenCalledTimes(1)
        expect(putBucketTaggingSpy).toHaveBeenCalledTimes(1)
        expect(addPermissionSpy).toHaveBeenCalledTimes(1)
        expect(addLambdaArnsToSkillSpy).toHaveBeenCalledTimes(1)
        expect(updateSkillAndWaitSpy).toHaveBeenCalledTimes(1)
        expect(configureAccountLinking).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('getExistingSkillId', () => {
    it('does not have tag', done => {
      // Arrange
      const getBucketTaggingSpy = spyOn(S3Access, 'getBucketTagging')
      getBucketTaggingSpy.and.returnValue(of({
        TagSet: []
      }))

      // // Act
      const o = LambdaStackWorkflow.getSkillId('dummy-artifact-bucket-name')

      // Assert
      o.subscribe(result => {
        expect(result).toBeNull()
        expect(getBucketTaggingSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('has tag', done => {
      // Arrange
      const getBucketTaggingSpy = spyOn(S3Access, 'getBucketTagging')
      getBucketTaggingSpy.and.returnValue(of({
        TagSet: [
          {
            Key: Constants.SKILL_ID_AWS_TAG_KEY,
            Value: 'dummy-skill-id'
          }
        ]
      }))

      // // Act
      const o = LambdaStackWorkflow.getSkillId('dummy-artifact-bucket-name')

      // Assert
      o.subscribe(result => {
        expect(result).toEqual('dummy-skill-id')
        expect(getBucketTaggingSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('createSkillIfNeeded', () => {
    it('create it', done => {
      // Arrange
      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const geSkillId = spyOn(LambdaStackWorkflow, 'getSkillId')
      geSkillId.and.returnValue(of(null))

      const createNewSkillSpy = spyOn(LambdaStackWorkflow, 'createNewSkill')
      createNewSkillSpy.and.returnValue(of('dummy-skill-id'))

      // // Act
      const o = LambdaStackWorkflow.createSkill()

      // Assert
      o.subscribe(result => {
        expect(result).toEqual('dummy-skill-id')
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(geSkillId).toHaveBeenCalledTimes(1)
        expect(createNewSkillSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('do not create it', done => {
      // Arrange
      const getArtifactBucketNameSpy = spyOn(ArtifactStackWorkflow, 'getArtifactBucketName')
      getArtifactBucketNameSpy.and.returnValue(of('dummy-artifact-bucket-name'))

      const geSkillId = spyOn(LambdaStackWorkflow, 'getSkillId')
      geSkillId.and.returnValue(of({}))

      const createNewSkillSpy = spyOn(LambdaStackWorkflow, 'createNewSkill')
      createNewSkillSpy.and.returnValue(of('dummy-skill-id'))

      // // Act
      const o = LambdaStackWorkflow.createSkill()

      // Assert
      o.subscribe(result => {
        expect(result).toBeUndefined()
        expect(getArtifactBucketNameSpy).toHaveBeenCalledTimes(1)
        expect(geSkillId).toHaveBeenCalledTimes(1)
        expect(createNewSkillSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('handleLegacyCountryLocaleOneToOneMapping', () => {
    it('with legacy country', () => {
      // Arrange
      const locales = []
      const countries = ['US']

      // Act
      LambdaStackWorkflow.handleLegacyCountryLocaleOneToOneMapping(countries, locales)

      // Assert
      expect(locales).toEqual(['en-US'])
    })

    it('with legacy locale', () => {
      // Arrange
      const locales = ['en-US']
      const countries = []

      // Act
      LambdaStackWorkflow.handleLegacyCountryLocaleOneToOneMapping(countries, locales)

      // Assert
      expect(countries).toEqual(['US'])
    })

    it('with non-legacy locale', () => {
      // Arrange
      const locales = ['fr-CA']
      const countries = []

      // Act
      LambdaStackWorkflow.handleLegacyCountryLocaleOneToOneMapping(countries, locales)

      // Assert
      expect(countries).toEqual([])
    })
  })
})
