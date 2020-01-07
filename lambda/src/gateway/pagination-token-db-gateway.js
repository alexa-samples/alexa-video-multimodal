import { DynamoDbAccess } from '../access/aws/dynamo-db-access'
import { getLogger } from 'log4js'

export class PaginationTokenDbGateway {
  /**
   * Fetches data from DynamoDB for 'token' key
   *
   * @param {string} token Key to get paginated items
   * @param {string} projectName Lambda name
   * @returns {Promise<Array>} Paginated items
   */
  static getPaginationTokenItems (token, projectName) {
    const tableName = projectName + '-pagination-table'
    const key = {
      token: { S: token }
    }
    return DynamoDbAccess.getItem(key, tableName)
      .then(data => {
        let itemData = []
        try {
          itemData = data.Item.data.S.split(',')
        } catch (e) {
          this.logger.error('Data is not present in DynamoDB database', e)
        }
        return Promise.resolve(itemData)
      })
      .catch(err => {
        this.logger.error('Error', err)
      })
  }

  /**
   * Insert 'data' in DynamoDB with 'token' as key
   *
   * @param {string} token Key for paginated items
   * @param {number} ttl Time to live for the database item
   * @param {Array} data Data items to put in database
   * @param {string} projectName Lambda name
   * @returns {Promise<object>} The put requests response
   */
  static putPaginationTokenItem (token, ttl, data, projectName) {
    const tableName = projectName + '-pagination-table'
    const item = {
      token: { S: token },
      ttl: { N: ttl + '' },
      data: { S: data.join() }
    }
    return DynamoDbAccess.putItem(item, tableName)
      .catch(err => {
        this.logger.error('Error', err)
      })
  }

  static get logger () {
    return getLogger('pagination-token-db-gateway')
  }
}
