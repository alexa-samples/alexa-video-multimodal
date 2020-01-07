# Alexa Video Multi-modal Reference Software Infrastructure
 
## Introduction
This project provides you with a CLI tool for building an Alexa video skill from scratch targeting Echo Show devices.

This CLI tool uses the AWS CloudFormation service to provision a collection of AWS resources known as a CloudFormation Stack. The CLI tool builds two stacks.

This is a high level diagram of what gets built:

```
           Artifact CloudFormation Stack                                  Lambda  CloudFormation Stack
+----------------------------------------------------------+         +--------------------------------------------------------------------+
|                                                          |         |                                                                    |
|                                                          |         |     +------------------------+                                     |
|                                                          |         |     |                        |                                     |
|                                                          |         |     |     AWS Lambda         |                                     |
|                                                          |         |     |                        |                                     |
|                                                          |         |     +------------------------+                                     |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|          +-----------------------------+                 |         |                                                                    |
|          |                             |                 |         |                                                                    |
|          |                             |                 |         |                                                                    |
|          |                             |                 |         |     +---------------------------+                                  |
|          |                             |                 |         |     |     Aws Cognito User Pool |                                  |
|          |   Artifact S3 Bucket        |                 |         |     +---------------------------+                                  |
|          |                             |                 |         |     +----------------------------------+                           |
|          |                             |                 |         |     |     Aws Cognito User Pool Client |                           |
|          |                             |                 |         |     +----------------------------------+                           |
|          |                             |                 |         |     +-----------------------------+                                |
|          |                             |                 |         |     |     Dynamo DB Database      |                                |
|          |                             |                 |         |     +-----------------------------+                                |
|          |                             |                 |         |                                                                    |
|          |                             |                 |         |     +-----------------------------+                                |
|          |                             |                 |         |     |     Various IAM Roles       |                                |
|          |                             |                 |         |     +-----------------------------+                                |
|          +-----------------------------+                 |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
|                                                          |         |                                                                    |
+----------------------------------------------------------+         +--------------------------------------------------------------------+

 Alexa
+-----------------------------+
|  +----------------------+   |
|  |                      |   |
|  |   Video Skill        |   |
|  |                      |   |
|  |                      |   |
|  +----------------------+   |
|                             |
+-----------------------------+


```
 
### Artifact CloudFormation Stack

It contains an S3 bucket that hosts the following:

* Built lambda (as a zip file)
* Sample video content
* Built web player (as a website)

When the AWS Lambda is provisioned as part of the lambda CloudFormation stack, its source code is configured to originate from the lambda zip file located in the S3 bucket.  Therefore, before the creation of the lambda stack, the artifact stack must already exist and have content uploaded to it.

#### Lambda CloudFormation Stack   
 
This stack creates the AWS Lambda, AWS Cognito resources used for account linking, and DynamoDB tables used to store nextTokens for pagination and tracking video progress to support 'continue watching' functionality. It also provisions various IAM roles to support the skill.
 
#### The Video Skill

The video skill itself is created using public REST APIs outside of the cloud formation stacks.
 
## Requirements
 
* [Node.js 10.x](https://nodejs.org/en/download/)

  Currently, this is the only supported version. Test your installed version with this command: `node --version`
* npm (prebuilt in Node.js)

  Currently, Node.js supports every npm version between 5.6.0 and 6.11.3. Test your npm version with: `npm --version`. Use `npm install -g npm@version` to downgrade your npm, if needed.
  
* [Python 2.7 or later](https://www.python.org/downloads/) (required by some installation packages)
* [Firefox](https://www.mozilla.org/firefox/new/)
* PowerShell (Windows) or terminal (macOS)

<br>You must also have access to the following:

* Mobile phone or a tablet with [Alexa App](https://www.amazon.com/gp/help/customer/display.html?nodeId=201602060) installed
* An Echo Show device
* [AWS Developer Account](https://aws.amazon.com/developer/)
* [Alexa Developer Account](https://developer.amazon.com/alexa)

### Other Dependencies

Check your environment against the settings listed [here](https://github.com/nodejs/node-gyp).

**Windows users:** Through an elevated PowerShell or CMD.exe (run as Administrator),  you must install all the required tools and configurations using Microsoft windows-build-tools with this command:

`npm install --global --production windows-build-tools`

**macOS users:** You might need install Xcode and the Xcode Command Line Tools by running `xcode-select --install` on a terminal.

## Installation

### Setup accounts

##### AWS Account
1.  Create an [AWS Account](http://console.aws.amazon.com).
2.  Create an [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html#id_users_create_console).
3.  Ensure the user has programmatic access.       
4.  Attach a policy to the user using the IAM AWS console.
    * See the policy definition as JSON: [Infrastructure Cli Tool User Policy](./infrastructure-user-policy.json)
5.  Follow these instructions for attaching a policy: [Instructions for attaching an inline policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-attach-detach.html#add-policies-console).
6.  Use the section **To embed an inline policy for a user or role (console)** and add the policy as JSON.                
7.  Create AWS API credentials for that user.
8.  Note your `AWS Access Key Id` and `AWS Secret Access Key`.

######  Alexa Developer Account
1.  Create an [Alexa developer account](https://developer.amazon.com/).
2.  Create a [security profile](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html).
3.  Click the settings icon, then select **Web Settings**.
4.  For **Allowed Return URLs**, add this link: https://s3.amazonaws.com/ask-cli/response_parser.html
	* This URL enables the CLI tool to create an authentication flow and ensure that CLI users obtain ASK access tokens.
5.  Note the `Client Id` and `Client Secret` 

#### Configure Devices

###### Echo Show (Multimodal Device)
Log into the Echo Show device with the same account as your Alexa Developer Account.
###### Alexa App
Log in to the Alexa App on your smart phone with the same account as your Alexa Developer Account.
#### Build the code
1.  Navigate to `<project-root>/infrastructure`.
2.  Run `npm run release`.
    * This performs the following:
        * installs dependencies
        * cleans the project
        * runs unit tests
        * compiles the code

The output is written to `./dist` with the following contents:        
  * `./dist/bin/alexa-video-infrastructure-cli` The cli tool itself
  * `./doc/index.html` Autogenerated documentation of the code
  * `./coverage/index.html` An HTML code coverage report
 
## Usage

After installation, you can use the CLI tool.

##### Build, Deploy, and Test your skill
Do the following:

**Windows users:** Add `node` to the start of the commands. For example, run `node ./dist/bin/alexa-video-infrastructure-cli --init` in Powershell.

1.  Run `./dist/bin/alexa-video-infrastructure-cli --init` and go through the prompts.
2.  Run `./dist/bin/alexa-video-infrastructure-cli --deploy` to build entire skill.
3.  On your mobile phone, go to the Alexa App.
4.  Tap the Hamburger icon (☰) on the top left of the screen.
5.  Tap **Settings**.
6.  Tap **TV & Video**.
7.  Scroll through the list of skills, and you should see yours at the bottom.
8.  Tap your skill.
9.  Tap **Link Your Alexa Device**. 
       * This guides you to an AWS Cognito OAuth workflow.
10. Tap **Sign up** at the bottom.  
       * Do not use login as there are no accounts created by default.
11. Create an account with a valid email address and password.
       * You will receive an email with a verification code. Use that to confirm your account.
       * If you have issues, log into the AWS console, and go to the AWS Cognito Section.
           * Click **Manage User Pools**.
           * Select your skill's user pool (named after your project name).
           * On the left, under **General Settings**, click **Users and Groups**.
           * If needed, manually confirm users, or even create new users.
12. Enable the skill on the device you want to test on and click **Save**.
13. Invoke the skill: 
   * Say 'Alexa Video Home', and you should see your new skill there.
   * Say 'Alexa watch Black Panther', and this should play the 'Big Buck Bunny' movie.

## Supported Commands

**`./dist/bin/alexa-video-infrastructure-cli --init`**
 
 Initializes the project and prompts the user for the following information:
   * `Project Name` is the name of the project (used primarily to name created cloud resources).
   * `Skill Name` is the name of the Alexa skill to create.
   * `Path to project root` is the absolute path to the directory containing the sample lambda (`./lambda`) and sample web player (`./web-player`) code.
   * `ASK security profile client id` is the client id associated with your ASK security profile.
   * `ASK security profile client secret` is the client secret associated with your ASK security profile.
   * `AWS Access Key` is the AWS Access Key associated with your AWS IAM user.
   * `AWS Secret Access Key` is the AWS Secret Access Key associated with your AWS IAM user.
   * `Authorization Code`
       
     Visit the prompted website which will ask you to log in and then issue you a single use Authorization Code. This code will generate an OAuth access and refresh token. This token is used to authenticate your Alexa Developer Account for API calls. It expires eventually, and if this happens, you will be prompted to create a new token.
   * `Vendor Id` If you have multiple vendor Ids associated with your ASK account, you get an additional prompt to select the one you would like to apply. You can always retrieve this data from this page on the developer console. https://developer.amazon.com/settings/console/mycid
   * Note that the CLI tool stores information on your local machine:
       
       * Under `~/.aws` there is a file with your aws credentials stored within.
       * Under `~/.ask` there is a file with your ASK oauth tokens stored within.
       * The file `<directory where cli is run>/.project-config.json` stores project level information as well as your ASK client id and ASK client secret.
           
**`./dist/bin/alexa-video-infrastructure-cli --deploy`**
 
Run this command once to create the skill for the first time.  For a given `Project Name`, you can only run the `--deploy` command once.  If the command fails, you can run the `--delete` command and then re-run the `--deploy` command, but note this will delete your skill.  If you want to update the web player or the lambda, you can run the `--update --web-player` or `--update --lambda` commands respectively. 

Deploy the skill performs the following:
   * Creates the artifact stack
   * Starts copying over sample video content (e.g. Big Buck Bunny) in the background
   * Builds the sample lambda and web player package locally
   * Uploads the newly built sample lambda and web player to S3
   * Creates the lambda artifact stack
   * Creates the Alexa Skill by uploading a skill manifest 
   * Configures account linking and skill triggers

You can view your newly created skill by following this process:
1. Open the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Click on your skill where you can view or update your settings.

**`./dist/bin/alexa-video-infrastructure-cli --delete`**

Deletes the entire skill, all data, S3 buckets, and so on

**`./dist/bin/alexa-video-infrastructure-cli --update --lambda`**
 
This updates just the lambda:
  *  Builds the lambda locally
  *  Uploads it to S3
  *  Updates the lambda source code

**`./dist/bin/alexa-video-infrastructure-cli --update --web-player`**
 
This updates just the web player:
  *  Builds the web player locally
  *  Uploads it to S3

Note: you may need to wait about 5 minutes to see web player changes on device.  You can see your changes faster if you reboot your device. 
   
**`./dist/bin/alexa-video-infrastructure-cli --skill --enable-web-player-logs`**

You do not have access to the logs produced by the web player because it runs on device.  By running this command, your web player writes its logs to AWS CloudWatch Logs.  You can view your logs in the CloudWatch Logs section of the AWS console.  The logs are located within a log group named after your `Project Name`.

Enable this logging only during development because in production you might accrue more costs.  For production, ensure the logging is disabled.

**`./dist/bin/alexa-video-infrastructure-cli --skill --disable-web-player-logs`**

Disable the web player from writing its logs to AWS CloudWatch Logs.
 
It is recommended to have CloudWatch Logs disabled in production because in production you might accrue more costs.


**`./dist/bin/alexa-video-infrastructure-cli --status`**

Gets the status of your deployed resources.


**`./dist/bin/alexa-video-infrastructure-cli --version`**

Shows the version of the cli tool.

**`./dist/bin/alexa-video-infrastructure-cli --help`**

Shows all the available commands and descriptions.      
    
    
## Development
These are instructions for developing the infrastructure CLI tool.

* Use the `<project root>/infrastructure` folder.
* Run `npm run watch`.
* While you make changes, the infrastructure CLI tool's code is auto built.
* Test changes under `./dist/bin/alexa-video-infrastructure-cli`.
 
## Documentation
See the [full technical documentation](https://developer.amazon.com/docs/video-skills-multimodal-devices/sample-video-skill-overview.html).

## License

This library is licensed under the Amazon Software License.

