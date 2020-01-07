/**
 * Model Event wrapper class for Responses
 */
export class Event {
  /**
   * Constructor for Event
   *
   * @param {object} header Header object
   * @param {object} payload Payload object
   */
  constructor (header, payload) {
    this.header = header
    this.payload = payload
  }

  toJSON () {
    return {
      event: {
        header: this.header,
        payload: this.payload
      }
    }
  }
}
