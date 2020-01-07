/**
 * Model Header class for Responses
 */
export class Header {
  /**
   * Constructor for Header
   *
   * @param {string} name Directive response name
   * @param {string} correlationToken Correlation token sent in request header
   * @param {string} messageId Unique message Id
   * @param {string} namespace Namespace
   * @param {string} payloadVersion Payload version
   */
  constructor (name, correlationToken, messageId, namespace, payloadVersion) {
    this.correlationToken = correlationToken
    this.messageId = messageId
    this.name = name
    this.namespace = namespace
    this.payloadVersion = payloadVersion
  }

  toJSON () {
    return {
      correlationToken: this.correlationToken,
      messageId: this.messageId,
      name: this.name,
      namespace: this.namespace,
      payloadVersion: this.payloadVersion
    }
  }
}
