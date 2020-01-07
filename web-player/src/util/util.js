/**
 * Utility functions for the web player
 */
export class Util {
  /**
   * Format a duration as a string hh:mm:ss
   *
   * @param {string|number} s Input in milliseconds
   * @returns {string} Formatted duration
   */
  static formatMilliseconds (s) {
    if (!s) {
      return ''
    }

    // Pad to 2 or 3 digits, default is 2
    const pad = (n, z) => {
      z = z || 2
      return ('00' + n).slice(-z)
    }

    const ms = s % 1000
    s = (s - ms) / 1000
    const secs = s % 60
    s = (s - secs) / 60
    const mins = s % 60
    const hrs = (s - mins) / 60

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs)
  }

  /**
   * Base64 encode a string
   *
   * @param {string} input The string to be encoded
   * @returns {*} The base 64 string result
   */
  static base64Encode (input) {
    return btoa(input)
  }

  /**
   * Base64 decode a string
   *
   * @param {string} input The base 64 string to be decoded
   * @returns {*} The string result
   */
  static base64Decode (input) {
    return atob(input)
  }
}
