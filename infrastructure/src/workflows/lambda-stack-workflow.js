import { ProjectConfigUtil } from '../util/project-config-util'
import { FilesystemAccess } from '../access/filesystem-access'
import * as log4js from 'log4js'
import { Util } from '../util/util'
import { S3Access } from '../access/aws/s3-access'
import { ArtifactStackWorkflow } from './artifact-stack-workflow'
import { map, mergeMap } from 'rxjs/operators'
import { AwsWorkflow } from './aws-workflow'
import { CloudFormationAccess } from '../access/aws/cloud-formation-access'
import uuidv4 from 'uuid/v4'
import { StsAccess } from '../access/aws/sts-access'
import { of } from 'rxjs'
import { APP_LOGGER } from '../infrastructure'
import { Constants } from '../util/constants'
import { SmapiAccess } from '../access/alexa/smapi-access'
import { AskAccountUtil } from '../util/alexa/ask-account-util'
import { CognitoAccess } from '../access/aws/cognito-access'
import { LambdaAccess } from '../access/aws/lambda-access'
import invert from 'lodash/invert'
import includes from 'lodash/includes'

/**
 * Workflows relating to creating, updating, and deleting the lambda stack.
 *
 * This stack consists of:
 *  * AWS Lambda
 *  * AWS Cognito resources for account linking
 *  * API Gateway for providing access from the web player to the lamdba
 *  * DynamoDB tables to support the lambda
 *  * Associated IAM roles
 */
export class LambdaStackWorkflow {
  static get logger () {
    return log4js.getLogger('lambda-stack-workflow')
  }

  /**
   * Workflow to create the lambda CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static runCreateWorkflow () {
    const templateFilePath = this.getTemplateFilePath()
    const stackName = this.getStackName()

    let parameters = null
    return this.resolveStackParameters()
      .pipe(map(p => {
        parameters = p
      }))
      .pipe(mergeMap(() => CloudFormationAccess.checkStackExists(stackName)))
      .pipe(mergeMap(stackExists => {
        if (!stackExists) {
          return AwsWorkflow.stackCreationWorkflow(stackName, parameters, templateFilePath)
        } else {
          APP_LOGGER.info('Not creating the Lambda cloud formation stack because it already exists')
          return of(undefined)
        }
      }))
      .pipe(mergeMap(() => this.createSkill()))
  }

  /**
   * Workflow to update the lambda CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static updateWorkflow () {
    const templateFilePath = this.getTemplateFilePath()
    const stackName = this.getStackName()

    return this.resolveStackParameters()
      .pipe(mergeMap(parameters => AwsWorkflow.stackUpdateWorkflow(stackName, parameters, templateFilePath)))
      .pipe(mergeMap(() => this.createSkill()))
  }

  /**
   * Workflow to delete the lambda CloudFormation stack
   *
   * @returns {Observable} An observable
   */
  static deleteWorkflow () {
    const stackName = LambdaStackWorkflow.getStackName()
    const accessToken = AskAccountUtil.getAccessToken()
    let artifactBucketName = null
    let skillId = null
    return ArtifactStackWorkflow.getArtifactBucketName()
      .pipe(map(b => {
        artifactBucketName = b
      }))
      .pipe(mergeMap(() => LambdaStackWorkflow.getSkillId(artifactBucketName)))
      .pipe(map(id => {
        skillId = id
      }))
      .pipe(mergeMap(() => {
        if (skillId !== null) {
          APP_LOGGER.info(`Deleting skill with id ${skillId}`)
          return SmapiAccess.deleteSkill(skillId, accessToken)
        } else {
          return of(undefined)
        }
      }))
      .pipe(mergeMap(() => AwsWorkflow.stackDeletionWorkflow(stackName)))
  }

  /**
   * Get the lambda stack template file absolute path
   *
   * @returns {string} Absolute path of the stack template file
   * @private
   */
  static getTemplateFilePath () {
    const cwd = FilesystemAccess.getCurrentWorkingDirectory()
    return FilesystemAccess.constructPath([cwd, 'cloud-formation-templates', 'template.lambda.json'])
  }

  /**
   * Get the lambda stack name
   *
   * @returns {string} The stack name
   */
  static getStackName () {
    return ProjectConfigUtil.getProjectName() + '-lambda-stack'
  }

  /**
   * Get parameters object for the CloudFormation stack template
   *
   * @param {string} projectName Project name
   * @param {string} artifactBucket Artifact S3 bucket name
   * @param {string} lambdaS3Key Lambda S3 key
   * @param {string} awsAccountNumber AWS account number
   * @returns {Array} Stack parameters
   */
  static getParameters (projectName, artifactBucket, lambdaS3Key, awsAccountNumber) {
    return [
      {
        ParameterKey: 'ProjectName',
        ParameterValue: projectName
      },
      {
        ParameterKey: 'ArtifactBucket',
        ParameterValue: artifactBucket
      },
      {
        ParameterKey: 'LambdaZipFileS3ObjectKey',
        ParameterValue: lambdaS3Key
      },
      {
        ParameterKey: 'AwsAccountNumber',
        ParameterValue: awsAccountNumber
      }
    ]
  }

  /**
   * Get the S3 object key for the lambda zip file.
   * Looks up for the most recently created file under lambda in the Artifact bucket
   * and uses it.
   *
   * @param {string} artifactBucket The Artifact bucket name
   * @returns {Observable<string>} Observable with the S3 key
   */
  static getLambdaS3Key (artifactBucket) {
    return S3Access.listObjects(artifactBucket, 'lambda/')
      .pipe(map(response => {
        const sortedKeys = LambdaStackWorkflow.sortS3ObjectsByCreatedTimeDesc(response.Contents)
        if (sortedKeys.length === 0) {
          return Util.exitWithError('There are no lambda zip file objects in the artifact bucket.')
        } else {
          return sortedKeys[0]
        }
      }))
      .pipe(map(o => o ? o.Key : undefined))
  }

  /**
   * render a URL given a template
   *
   * @param {string} template Template
   * @param {string} domain Domain
   * @param {string} region Region
   * @param {string} vendorId Vendor Id
   * @returns {string} The URL
   */
  static renderUrl (template, domain, region, vendorId) {
    return template
      .replace('{SubDomain}', domain)
      .replace('{Region}', region)
      .replace('{VendorId}', vendorId)
  }

  /**
   * Get the domain to use for Cognito
   *
   * @returns {string} Cognito domain for the project <projectname>-<uuid>
   */
  static getDomain () {
    return ProjectConfigUtil.getProjectName() + '-' + uuidv4()
  }

  /**
   * Sort a list of S3 objects from newest to oldest (LastModified)
   *
   * @param {Array} objects Unsorted list of S3 objects
   * @returns {Array} Sorted list of S3 objects
   */
  static sortS3ObjectsByCreatedTimeDesc (objects) {
    if (!objects) {
      return []
    }
    return objects.sort((a, b) => {
      if (a.LastModified > b.LastModified) {
        return -1
      }
      if (a.LastModified < b.LastModified) {
        return 1
      }
      return 0
    })
  }

  /**
   * Return the stack parameters
   *
   * @returns {Observable<object>} Stack parameters
   */
  static resolveStackParameters () {
    const projectName = ProjectConfigUtil.getProjectName()
    let artifactBucket = null
    let lambdaS3Key = null
    let awsAccountNumber = null
    return ArtifactStackWorkflow.getArtifactBucketName()
      .pipe(map(bucketName => {
        artifactBucket = bucketName
        LambdaStackWorkflow.logger.info(`Using this artifact bucket: "${artifactBucket}"`)
      }))
      .pipe(mergeMap(() => LambdaStackWorkflow.getLambdaS3Key(artifactBucket)))
      .pipe(map(key => {
        lambdaS3Key = key
        LambdaStackWorkflow.logger.info('Using this lambda zip file: "' + lambdaS3Key + '"')
      }))
      .pipe(mergeMap(() => StsAccess.getAccountNumber()))
      .pipe(map(accountNumber => {
        awsAccountNumber = accountNumber
        LambdaStackWorkflow.logger.info(`Using this aws account number: "${awsAccountNumber}"`)
      }))
      .pipe(map(() => {
        return LambdaStackWorkflow.getParameters(projectName, artifactBucket, lambdaS3Key, awsAccountNumber)
      }))
  }

  /**
   * Get the name of the lambda function
   *
   * @returns {Observable<string>} Lambda function name
   */
  static getLambdaFunctionName () {
    const stackName = this.getStackName()
    return CloudFormationAccess.describeStackResource(stackName, 'Lambda')
      .pipe(map(description => {
        return description.StackResourceDetail.PhysicalResourceId
      }))
  }

  /**
   * Create or update the skill
   *
   * @returns {Observable<string>} Skill Id
   */
  static createSkill () {
    APP_LOGGER.info('Building and configuring the skill')

    let artifactBucketName = null
    return ArtifactStackWorkflow.getArtifactBucketName()
      .pipe(map((b) => {
        artifactBucketName = b
      }))
      .pipe(mergeMap(() => this.getSkillId(artifactBucketName)))
      .pipe(mergeMap(skillId => {
        if (skillId === null) {
          // no skill currently exists for this project, make a new one
          return this.createNewSkill(artifactBucketName)
        } else {
          APP_LOGGER.info('Not creating the skill because it already exists')
          return of(undefined)
        }
      }))
  }

  /**
   * Check to see if the skill has already been created.
   * This is checked by looking at the Artifact bucket tags to see if there is a tag called SkillId. The value of
   * that tag (the skill Id) is then checked in SMAPI for the skills manifest. If the skill exists then the function
   * returns the skill Id, otherwise null.
   *
   * @param {string} artifactBucketName Artifact bucket name
   * @returns {Observable<string|null>} Observable with the skill Id, otherwise null
   */
  static getSkillId (artifactBucketName) {
    return S3Access.getBucketTagging(artifactBucketName)
      .pipe(map(response => {
        const tagSet = response.TagSet
        const filteredTagSet = tagSet.filter(t => t.Key === Constants.SKILL_ID_AWS_TAG_KEY)
        if (filteredTagSet.length === 0) {
          return null
        } else {
          return filteredTagSet[0].Value
        }
      }))
  }

  /**
   * Resolve the skill manifest template by replacing values in the manifest
   * and removing unused regional sections (only configure for a single region)
   *
   * @param {string} skillManifestTemplate Skill manifest template as a string
   * @param {string} lambdaFunctionArn ARN for the skill's lambda
   * @param {string} region The region where the skill is being deployed to
   * @param {string} skillName The skill name
   * @param {string} artifactBucketName The name of the artifact S3 bucket
   * @returns {string} The resolved manifest
   */
  static resolveSkillManifestTemplate (skillManifestTemplate, lambdaFunctionArn, region, skillName, artifactBucketName) {
    let output = skillManifestTemplate
    const countries = [ProjectConfigUtil.getCountry()]
    const locales = ProjectConfigUtil.getLocales().slice()

    LambdaStackWorkflow.handleLegacyCountryLocaleOneToOneMapping(countries, locales)

    if (region === Constants.NA_REGION) {
      output = output.replace(/\${LambdaEndpointUriNA}/g, lambdaFunctionArn)
      const o = JSON.parse(output)
      delete o.manifest.apis.video.regions.EU
      delete o.manifest.apis.video.regions.FE
      output = JSON.stringify(o, null, 4)
    } else if (region === Constants.EU_REGION) {
      output = output.replace(/\${LambdaEndpointUriEU}/g, lambdaFunctionArn)
      const o = JSON.parse(output)
      delete o.manifest.apis.video.regions.NA
      delete o.manifest.apis.video.regions.FE
      output = JSON.stringify(o, null, 4)
    } else if (region === Constants.FE_REGION) {
      output = output.replace(/\${LambdaEndpointUriFE}/g, lambdaFunctionArn)
      const o = JSON.parse(output)
      delete o.manifest.apis.video.regions.NA
      delete o.manifest.apis.video.regions.EU
      output = JSON.stringify(o, null, 4)
    } else {
      Util.exitWithError(`Unsupported region "${region}"`)
    }

    // Configure country/locales
    const o = JSON.parse(output)

    const manifestPublishingInformationLocale = o.manifest.publishingInformation.locales['en-US']
    delete o.manifest.publishingInformation.locales['en-US']

    const manifestVideoApiLocale = o.manifest.apis.video.locales['en-US']
    delete o.manifest.apis.video.locales['en-US']

    locales.forEach(locale => {
      o.manifest.publishingInformation.locales[locale] = manifestPublishingInformationLocale
      o.manifest.apis.video.locales[locale] = manifestVideoApiLocale
    })

    const manifestCountry = o.manifest.apis.video.countries.US
    delete o.manifest.apis.video.countries.US

    countries.forEach(country => {
      o.manifest.apis.video.countries[country] = manifestCountry
    })

    output = JSON.stringify(o, null, 4)

    output = output.replace(/\${LambdaEndpointUriDefault}/g, lambdaFunctionArn)
    output = output.replace(/\${skillName}/g, skillName)
    output = output.replace(/\${artifactBucketName}/g, artifactBucketName)
    return JSON.parse(output)
  }

  /**
   * Create and configure a new skill using the SMAPI API and then tag
   * the Artifact bucket with the skill Id. In this way there is a reference to the skill somewhere
   * in AWS that can be referenced in a subsequent run.
   *
   * @param {string} artifactBucketName Artifact bucket name
   * @returns {Observable<any>} An observable
   */
  static createNewSkill (artifactBucketName) {
    const accessToken = AskAccountUtil.getAccessToken()
    const vendorId = AskAccountUtil.getVendorId()
    const projectRoot = ProjectConfigUtil.getProjectRoot()
    const region = Util.getAwsDeploymentRegion()
    const skillName = ProjectConfigUtil.getSkillName()
    const stackName = this.getStackName()
    let lambdaFunctionName = null
    let lambdaFunctionArn = null
    const skillTemplateFileName = FilesystemAccess.constructPath([projectRoot, 'infrastructure', 'video-skill', 'skill.json'])
    const skillManifestTemplate = FilesystemAccess.readFile(skillTemplateFileName)
    let skillManifest = null
    let skillId = null
    APP_LOGGER.info('Creating the skill')
    return CloudFormationAccess.describeStackResource(stackName, 'Lambda')
      .pipe(map(description => description.StackResourceDetail.PhysicalResourceId))
      .pipe(mergeMap(functionName => {
        lambdaFunctionName = functionName
        LambdaStackWorkflow.logger.info(`Using lambda function name ${lambdaFunctionName}`)
        return LambdaAccess.getFunction(lambdaFunctionName)
      }))
      .pipe(map(description => {
        lambdaFunctionArn = description.Configuration.FunctionArn
        LambdaStackWorkflow.logger.info(`Using this lambda function arn "${lambdaFunctionArn}"`)
        skillManifest = LambdaStackWorkflow.resolveSkillManifestTemplate(skillManifestTemplate, lambdaFunctionArn, region, skillName, artifactBucketName)
      }))
      .pipe(mergeMap(() => SmapiAccess.createSkillAndWait(vendorId, skillManifest, accessToken)))
      .pipe(map(id => {
        skillId = id
        APP_LOGGER.info(`The skill id is ${skillId}`)
      }))
      .pipe(mergeMap(() => S3Access.getBucketTagging(artifactBucketName)))
      .pipe(map(response => {
        const tagSet = response.TagSet
        tagSet.push = {
          Key: Constants.SKILL_ID_AWS_TAG_KEY,
          Value: skillId
        }
        return tagSet
      }))
      .pipe(mergeMap(tagSet => S3Access.putBucketTagging(artifactBucketName, tagSet)))
      .pipe(mergeMap(() => LambdaAccess.addPermission(lambdaFunctionName, 'lambda:InvokeFunction', 'alexa-connectedhome.amazon.com', uuidv4(), skillId)))
      .pipe(mergeMap(() => this.configureAccountLinking(vendorId, accessToken, stackName, skillId)))
  }

  /**
   * Configure account linking
   *
   * @param {string} vendorId Vendor Id
   * @param {string} accessToken Access token
   * @param {string} stackName Stack name
   * @param {string} skillId  Skill Id
   * @returns {Observable<any>} An observable
   */
  static configureAccountLinking (vendorId, accessToken, stackName, skillId) {
    APP_LOGGER.info('Configuring account linking')
    let userPoolId = null
    let cognitoClientId = null
    let cognitoClientSecret = null

    const region = Util.getAwsDeploymentRegion()
    const domain = this.getDomain()
    let authorizationUri = 'https://{SubDomain}.auth.{Region}.amazoncognito.com/oauth2/authorize?response_type=code&redirect_uri=https://pitangui.amazon.com/api/skill/link/{VendorId}'
    let accessTokenUri = 'https://{SubDomain}.auth.{Region}.amazoncognito.com/oauth2/token'
    let redirectUrls = [
      'https://alexa.amazon.co.jp/api/skill/link/{VendorId}',
      'https://layla.amazon.com/api/skill/link/{VendorId}',
      'https://pitangui.amazon.com/api/skill/link/{VendorId}'
    ]
    let logoutUrl = 'https://{SubDomain}.auth.{Region}.amazoncognito.com/logout?response_type=code'
    let skillStage = AskAccountUtil
    return CloudFormationAccess.describeStackResource(stackName, 'CognitoUserPool')
      .pipe(map(description => {
        userPoolId = description.StackResourceDetail.PhysicalResourceId
      }))
      .pipe(mergeMap(() => {
        return CloudFormationAccess.describeStackResource(stackName, 'CognitoUserPoolClient')
      }))
      .pipe(map(description => {
        cognitoClientId = description.StackResourceDetail.PhysicalResourceId
      }))
      .pipe(mergeMap(() => {
        return CognitoAccess.describeUserPoolClient(userPoolId, cognitoClientId)
      }))
      .pipe(map(description => {
        cognitoClientSecret = description.UserPoolClient.ClientSecret
      }))
      .pipe(mergeMap(() => {
        return CognitoAccess.describeUserPool(userPoolId)
      }))
      .pipe(map((description) => {
        return description && description.UserPool && description.UserPool.Domain
      }))
      .pipe(mergeMap((exists) => {
        if (exists) {
          return of(undefined)
        } else {
          return CognitoAccess.createUserPoolDomain(userPoolId, domain)
        }
      }))
      .pipe(map(() => {
        authorizationUri = this.renderUrl(authorizationUri, domain, region, vendorId)
        accessTokenUri = this.renderUrl(accessTokenUri, domain, region, vendorId)
        redirectUrls = redirectUrls.map(url => this.renderUrl(url, domain, region, vendorId))
        logoutUrl = this.renderUrl(logoutUrl, domain, region, vendorId)
      }))
      .pipe(mergeMap(() => {
        return CognitoAccess.updateUserPoolClient(cognitoClientId, userPoolId, redirectUrls, [logoutUrl])
      }))
      .pipe(mergeMap(() => {
        return SmapiAccess.getSkillStage(vendorId, skillId, accessToken)
      }))
      .pipe(map((stage) => {
        skillStage = stage
      }))
      .pipe(mergeMap(() => {
        return SmapiAccess.configureSkillAccountLinking(skillId, skillStage, authorizationUri, accessTokenUri, cognitoClientId, cognitoClientSecret, accessToken)
      }))
  }

  /**
   * For legacy reasons, some countries require a specific corresponding locale in the manifest,
   * and some locales require a specific corresponding
   * country. This method should be removed eventually.
   * The mapping of counties and locales can be found in `Constants.COUNTRY_TO_LOCALE_MAP`.
   *
   * @param {Array} countries A list of countries
   * @param {Array} locales A list of locales
   */
  static handleLegacyCountryLocaleOneToOneMapping (countries, locales) {
    const countryToLocaleMap = Constants.COUNTRY_TO_LOCALE_MAP
    const localeToCountryMap = invert(countryToLocaleMap)
    countries.forEach(country => {
      const requiredLocale = countryToLocaleMap[country]
      if (requiredLocale && !includes(locales, requiredLocale)) {
        locales.push(requiredLocale)
      }
    })
    locales.forEach(locale => {
      const requiredCountry = localeToCountryMap[locale]
      if (requiredCountry && !includes(countries, requiredCountry)) {
        countries.push(requiredCountry)
      }
    })
  }
}
