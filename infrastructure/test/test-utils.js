export class TestUtils {
  static s3GetBucketLocationResponse () {
    return { LocationConstraint: 'us-west-2' }
  }

  static s3ListObjectsResponse () {
    return {
      IsTruncated: false,
      Marker: '',
      Contents:
        [{
          Key: 'lambda/lambda.b58fbe6167fe8fdc6712.zip',
          LastModified: '2019-07-08T21:48:38.000Z',
          ETag: '"40ebe9bf7f11c4a5637213379c8961dc"',
          Size: 697,
          StorageClass: 'STANDARD',
          Owner: {}
        }
        ],
      Name: 'waffles-artifact-bucket',
      Prefix: '',
      MaxKeys: 1000,
      CommonPrefixes: []
    }
  }

  static s3ListObjectsResponseEmpty () {
    return {
      IsTruncated: false,
      Marker: '',
      Contents:
        [],
      Name: 'waffles-artifact-bucket',
      Prefix: '',
      MaxKeys: 1000,
      CommonPrefixes: []
    }
  }

  static s3DeleteObjectsResponse () {
    return {
      Deleted: [{ Key: '/video-skill/video-skill.1562614038.zip' }],
      Errors: []
    }
  }

  static cloudFormationDescribeStackResourcesResponse () {
    return {
      ResponseMetadata: { RequestId: '13dc356c-a1fc-11e9-9b5d-f723d806da84' },
      StackResources:
        [
          {
            StackName: 'waffles-video-skill-stack',
            StackId:
              'arn:aws:cloudformation:us-west-2:480845012438:stack/waffles-video-skill-stack/fc9a20f0-a1b6-11e9-8b3d-0a530b8d8b00',
            LogicalResourceId: 'AlexaAppKitRole',
            PhysicalResourceId: 'waffles-alexa-skill-kit-role',
            ResourceType: 'AWS::IAM::Role',
            Timestamp: '2019-07-08T19:31:53.454Z',
            ResourceStatus: 'CREATE_COMPLETE',
            DriftInformation: {}
          },
          {
            StackName: 'waffles-video-skill-stack',
            StackId:
              'arn:aws:cloudformation:us-west-2:480845012438:stack/waffles-video-skill-stack/fc9a20f0-a1b6-11e9-8b3d-0a530b8d8b00',
            LogicalResourceId: 'CognitoUserPool',
            PhysicalResourceId: 'us-west-2_fWkLlxreY',
            ResourceType: 'AWS::Cognito::UserPool',
            Timestamp: '2019-07-08T19:31:36.857Z',
            ResourceStatus: 'CREATE_COMPLETE',
            DriftInformation: {}
          },
          {
            StackName: 'waffles-video-skill-stack',
            StackId:
              'arn:aws:cloudformation:us-west-2:480845012438:stack/waffles-video-skill-stack/fc9a20f0-a1b6-11e9-8b3d-0a530b8d8b00',
            LogicalResourceId: 'CognitoUserPoolClient',
            PhysicalResourceId: '3uc4mpqapinp92lq1bvjbpjljq',
            ResourceType: 'AWS::Cognito::UserPoolClient',
            Timestamp: '2019-07-08T19:31:41.268Z',
            ResourceStatus: 'CREATE_COMPLETE',
            DriftInformation: {}
          }
        ]
    }
  }

  static cloudFormationListStacksResponse () {
    return {
      ResponseMetadata: { RequestId: '9ba08788-a1fc-11e9-9999-fbde6f006cd3' },
      StackResources:
        [{
          StackName: 'waffles-video-skill-stack',
          StackId:
            'arn:aws:cloudformation:us-west-2:480845012438:stack/waffles-video-skill-stack/fc9a20f0-a1b6-11e9-8b3d-0a530b8d8b00',
          LogicalResourceId: 'AlexaAppKitRole',
          PhysicalResourceId: 'waffles-alexa-skill-kit-role',
          ResourceType: 'AWS::IAM::Role',
          Timestamp: '2019-07-08T19:31:53.454Z',
          ResourceStatus: 'CREATE_COMPLETE',
          DriftInformation: {}
        }]
    }
  }

  static cognitoUtilDescribeUserPoolDomainResponse () {
    return {
      DomainDescription:
        {
          UserPoolId: 'us-west-2_fWkLlxreY',
          AWSAccountId: '480845012438',
          Domain: 'waffles',
          S3Bucket: 'aws-cognito-prod-pdx-assets',
          CloudFrontDistribution: 'dpp0gtxikpq3y.cloudfront.net',
          Version: '20190708193231',
          Status: 'ACTIVE',
          CustomDomainConfig: {}
        }
    }
  }

  static codeCommitListRepositoriesResponse () {
    return {
      repositories:
        [{
          repositoryName: 'pancake-repo',
          repositoryId: '36b854d9-e176-4efb-9e8b-c5081898fd1a'
        }]
    }
  };

  static codeCommitGetRepositoryResponse () {
    return {
      repositoryMetadata:
        {
          accountId: '480845012438',
          repositoryId: '36b854d9-e176-4efb-9e8b-c5081898fd1a',
          repositoryName: 'pancake-repo',
          defaultBranch: 'master',
          lastModifiedDate: '2019-07-09T06:02:21.400Z',
          creationDate: '2019-07-09T05:58:33.377Z',
          cloneUrlHttp:
            'https://git-codecommit.us-east-1.amazonaws.com/v1/repos/pancake-repo',
          cloneUrlSsh:
            'ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/pancake-repo',
          Arn: 'arn:aws:codecommit:us-east-1:480845012438:pancake-repo'
        }
    }
  }
}
