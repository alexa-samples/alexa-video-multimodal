# Lambda
 
## Introduction
The AWS lambda serves as the backend for the video skill. The lambda function can receive directives as JSON from Alexa, process them, and then return a response with the expected JSON. Directives are JSON messages that contain instructions about performing a specific action, like getting metadata for a video.

Currently, there is a JSON object that functions as a database embedded within the sample lambda code. To configure the lambda to interact with another existing database, you must modify the database access class to query the existing database and return data structured in the same way as in the reference code. The rest of the lambda code can remain unchanged as it responds dynamically to the contents returned by the database access layer.
 
## Requirements

* AWS Account: If you are not familiar with AWS Lambda or AWS Cloudwatch, refer to [this documentation](https://docs.aws.amazon.com/lambda/index.html).

* Node JS 10.x:
    * [For MAC](https://treehouse.github.io/installation-guides/mac/node-mac.html)
    * [For Windows](https://treehouse.github.io/installation-guides/windows/node-windows.html)
    * [For Linux](https://treehouse.github.io/installation-guides/linux/node-linux.html)
 
 
## Installation
There are two ways you can use this lambda function:

**Recommended** 
 
Use the infrastructure CLI tool included in the Reference Software:

1. Run `--deploy` in the CLI tool to create and deploy the AWS lambda function.
2. Run `--update --lambda` to update and deploy the lambda code during the development cycle.

**Manual Process**

1. cd to `lambda` directory 
2. Run `npm run release`

   This installs dependencies, cleans the project, runs unit tests, and compiles the code. The output will is written to `./dist` consisting of:
   
      * `./coverage` containing the unit test coverage report
      * `./doc` containing the generated js docs for lambda
      * `./lambda` containing the compiled lambda code

3. Create an AWS lambda function in the same region where you wish to deploy your video skill, following the [steps mentioned here](https://developer.amazon.com/docs/video-skills-multimodal-devices/create-video-skill-and-lambda.html#create_lambda_function).
4. Copy the compiled lambda code from `./lambda/dist/lambda` to the AWS lambda function created in Step 3.
5. In your lambda execution role created in Step 3, add the following policy: AmazonDynamoDBFullAccess.
6. Create a DynamoDB database for your lambda, to store data for pagination using the following specs:   
```
"PaginationDatabase": {
    "Type" : "AWS::DynamoDB::Table",
    "Description": "Holds data for Pagination",
    "Properties" : {
        "TableName" : {
            "Fn::Sub": [
                "${ProjectName}-pagination-table",
                {
                    "ProjectName": {
                        "Ref": "ProjectName"
                    }
                }
            ]
        },
        "AttributeDefinitions" : [
            {
                "AttributeName" : "token",
                "AttributeType" : "S"
            }
        ],
        "KeySchema" : [
            {
                "AttributeName" : "token",
                "KeyType" : "HASH"
            }
        ],
        "ProvisionedThroughput" : {
            "ReadCapacityUnits" : "5",
            "WriteCapacityUnits" : "5"
        }
    }
}
```
    
## Documentation
* [Lambda Directives](https://developer.amazon.com/docs/video-skills-multimodal-devices/reference.html) 
 
 
## Usage

This lambda is meant to be used as the backend/endpoint of a multimodal video skill.

The lambda needs to be configured in the skill manifest. This can happen in two ways:
   * Use [developer portal](https://developer.amazon.com/alexa/console/ask)
   * Use the infrastructure CLI tool included in the project handles this for you.
        
The lambda needs to be hosted on AWS. The infrastructure CLI tool included in the project, pushes the lambda on AWS for you.
        
## Features
The reference lambda supports various features, such as:

<style>
.docs table.grid tr td {
  text-align: left;
}
.docs table.grid tr td:first-child {
  text-align: left;
}
</style>
<table class="grid">
   <colgroup>
      <col width="20%" />
      <col width="30%" />
      <col width="50%" />
   </colgroup>
   <thead>
      <tr>
         <th style="text-align:left">Feature</th>
         <th style="text-align:left">By</th>
         <th style="text-align:left">Example</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td markdown="span">Search</td>
         <td markdown="span">`Video Name`</td>
         <td markdown="span">Search for Stranger Things<br>Search for Psych Season 1<br>Search for Black Panther</td>
      </tr>
      <tr>
         <td markdown="span">Search</td>
         <td markdown="span">`Actor Name`</td>
         <td markdown="span">Search for movies by Liam Neeson<br>Search for movies by Jamie Foxx</td>
      </tr>
      <tr>
         <td markdown="span">Search</td>
         <td markdown="span">`Genre`</td>
         <td markdown="span">Search for Comedy movies<br>Search for Action movies<br>Search for Adventure movies</td>
      </tr>
      <tr>
         <td markdown="span">Search</td>
         <td markdown="span">Multiple video metadata fields, such as `Actor + Genre`</td>
         <td markdown="span">Search for Action movies by Liam Neeson<br>Search for Comedy TV Series by Jennifer Aniston<br><br>Note that on the search results page, you can also say something like:<br><br>Select the second one<br>Play number 1</td>
      </tr>
      <tr>
         <td markdown="span">Quick Play</td>
         <td markdown="span">`Video Name`</td>
         <td markdown="span">Watch Stranger Things<br>Watch Psych Season 1 Episode 1<br>Watch Black Panther</td>
      </tr>
      <tr>
         <td markdown="span">Quick Play</td>
         <td markdown="span">`Actor Name`</td>
         <td markdown="span">Watch movies by Liam Neeson<br>Watch movies by Jamie Foxx</td>
      </tr>
      <tr>
         <td markdown="span">Quick Play</td>
         <td markdown="span">`Genre`</td>
         <td markdown="span">Watch Comedy movies<br>Watch Action movies<br>Watch Adventure movies</td>
      </tr>
      <tr>
         <td markdown="span">Quick Play</td>
         <td markdown="span">Multiple video metadata fields, such as `Actor + Genre`</td>
         <td markdown="span"> Watch Action movies by Liam Neeson<br>Watch Comedy TV Series by Jennifer Aniston</td>
      </tr>
      <tr>
         <td markdown="span">Channel Navigation</td>
         <td markdown="span"></td>
         <td markdown="span">Tune to PBS<br>Tune to NBC</td>
      </tr>
      <tr>
         <td markdown="span">Browse and List Selection</td>
         <td markdown="span"></td>
         <td markdown="span">Explore different categories listed<br>Explore additional categories under <b>More Categories</b> by saying:<br><br>Select Highly Rated<br>Select More Categories</td>
      </tr>              
   </tbody>
</table>

Note that the transport controls are specified by the web player included in the reference software. Read the [web player documentation](../web-player/README.md) to learn more.

## Not Supported

   * Auto play Next Episode
   * Turning on/off Closed Captioning by Voice
   * Badging

## Development

This reference lambda by default uses the GraceNote catalog (catalog name 'ontv'). If you have a catalog that has already been ingested by Alexa, then you can start using your own catalog instead of GraceNote (ontv), by following these steps:
    
1.  Change the catalog name from `ontv` to your catalog name in `./lambda/utils/constants.js`.
2.  Change the catalog name in the skill manifest by either:
    * Using the infrastructure CLI tool and editing the skill manifest `<project-root>/video-skill/src/skill.json`. This has to be done before you deploy your skill. 
    * Or by using the [Developer Portal](https://developer.amazon.com/alexa/console/ask) if you have already deployed your skill.
3.  Replace the `database.js` with your own video database.
4.  Replace the methods in access class for database in `json-db-access` with your own implementation for 
      accessing and searching your own database. (Keep the method return type as same.)
     
### Customize

Customize number of Categories on Landing Page:
   * Given the screen size of the device, you can choose to display up to 5 categories on landing page by changing `NUM_CATEGORIES_ON_LANDING_PAGE` in `./lambda/utils/constants.js`.
 
You can use this lambda as a reference and customize it further according to your requirements.
    
## Sample Alexa Request Directives to Lambda

* [GetPlayableItems](https://developer.amazon.com/docs/video-skills-multimodal-devices/getplayableitems.html)
* [GetPlayableItemsMetadata](https://developer.amazon.com/docs/video-skills-multimodal-devices/getplayableitemsmetadata.html) 
* [GetDisplayableItems](https://developer.amazon.com/docs/video-skills-multimodal-devices/getdisplayableitems.html)
* [GetDisplayableItemsMetadata](https://developer.amazon.com/docs/video-skills-multimodal-devices/getdisplayableitemsmetadata.html)
* [GetNextPage](https://developer.amazon.com/docs/video-skills-multimodal-devices/getnextpage.html)
* [GetBrowseNodeItems](https://developer.amazon.com/docs/video-skills-multimodal-devices/getbrowsenodeitems.html)
* [Error Handling](https://developer.amazon.com/docs/video-skills-multimodal-devices/error-handling.html)
* [Badging](https://developer.amazon.com/docs/video-skills-multimodal-devices/badging.html)

## FAQs
**Q:** Why my lambda does not receive any requests from Alexa for my video skill?

**A:** Add the `Alexa Smart Home` trigger to your lambda configured with your skill id.
    
**Q:** Why does my lambda only receives Discover requests from Alexa, but no other directives?

**A:** Ensure that:
* You have specified the correct catalog in the skill manifest.
* You request entries present in your catalog, if other than GraceNote (ontv).
* The Discover response from your lambda is in the [format specified here](https://developer.amazon.com/docs/video-skills-multimodal-devices/sample-lambda-function.html).
* All the responses are in the form of a JSON object and not in form of a stringified JSON object.

## License

This library is licensed under the Amazon Software License.