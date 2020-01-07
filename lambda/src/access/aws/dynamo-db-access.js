import DynamoDB from 'aws-sdk/clients/dynamodb'

/**
 * Access class to the DynamoDB pagination database on AWS, which gets created as part of the infrastructure
 * cli deploy process
 */
export class DynamoDbAccess {
  /**
   * Fetches data from DynamoDB for a key
   *
   * @param {object} key Key to look up in the database
   * @param {string} tableName The table to query
   * @returns {Promise<object>} Item
   */
  static getItem (key, tableName) {
    // Create the DynamoDB service object
    const params = {
      Key: key,
      TableName: tableName
    }
    return this.ddb.getItem(params).promise()
  }

  /**
   * Fetches data from DynamoDB for a set of keys
   *
   * @param {object} keys Keys to look up in the database
   * @param {string} tableName The table to query
   * @returns {Promise<object>} Item
   */
  static batchGetItem (keys, tableName) {
    // Create the DynamoDB service object
    const params = { RequestItems: {

    } }
    params.RequestItems[tableName] = {
      Keys: keys
    }
    return this.ddb.batchGetItem(params).promise()
  }

  /**
   * Insert an item into the DynamoDB table
   *
   * @param {object} item The item to put into the table
   * @param {string} tableName The DynamoDB table name
   * @returns {Promise<object>} A promise with the reponse
   */
  static putItem (item, tableName) {
    // Create the DynamoDB service object
    const params = {
      TableName: tableName,
      Item: item
    }
    return this.ddb.putItem(params).promise()
  }

  /**
   * Get an instance of the DynamoDB client API
   * Mainly used for unit testing.
   *
   * @returns {object} DynamoDB client API object
   */
  static get ddb () {
    return this._ddb ? this._ddb : new DynamoDB({ apiVersion: '2012-08-10', region: process.env.AWS_REGION })
  }

  /**
   * Set an instance the the DynamoDB client API
   * Mainly used for unit testing.
   *
   * @param {object} ddb DynamoDB client API object
   */
  static set ddb (ddb) {
    this._ddb = ddb
  }
}
