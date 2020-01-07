/**
 * Model Error Payload class for creating error payload response
 */
export class ErrorPayload {
  constructor (type, message) {
    this.type = type
    this.message = message
  }

  toJSON () {
    return {
      type: this.type,
      message: this.message
    }
  }
}
