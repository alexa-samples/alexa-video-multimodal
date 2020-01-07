import * as log4js from 'log4js'
import os from 'os'
import fs from 'fs'
import path from 'path'
import * as ini from 'ini'

/**
 * Filesystem access functions
 */
export class FilesystemAccess {
  /**
   * Check if a file or directory exits
   *
   * @param {string} p Absolute path to file
   * @returns {boolean} true if it exists
   */
  static checkIfFileOrDirectoryExists (p) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Checking if "' + p + '" exists')
    if (fs.existsSync(p)) {
      logger.debug('"' + p + '" exists')
      return true
    } else {
      logger.debug('"' + p + '" doest not exist')
      return false
    }
  }

  /**
   * Get the current working directory of the program
   *
   * @returns {string} Current working directory
   */
  static getCurrentWorkingDirectory () {
    return process.cwd()
  }

  /**
   * Get the home directory of the user running the program
   *
   * @returns {string} Home directory
   */
  static getHomeDirectory () {
    return os.homedir()
  }

  /**
   * Given an array of strings, join them to form a path with the os specific separator
   *
   * @param {Array} parts A list of strings to join with the os path separator
   * @returns {string} Path
   */
  static constructPath (parts) {
    return parts.join(path.sep)
  }

  /**
   * Ensure a file exits (touch)
   *
   * @param {string} p Absolute path to file
   */
  static touch (p) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Touch file "' + p + '"')
    fs.closeSync(fs.openSync(p, 'w'))
  }

  /**
   * Read a file and return its contents
   *
   * @param {string} p Absolute path to file
   * @returns {string} File contents
   */
  static readFile (p) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Reading file "' + p + '"')
    return fs.readFileSync(p, 'utf8')
  }

  /**
   * Write to a file
   *
   * @param {string} p Absolute path to file
   * @param {string} content File contents
   */
  static writeFile (p, content) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Writing to file "' + p + '"')
    const file = fs.openSync(p, 'w')
    fs.writeFileSync(file, content, {})
    fs.closeSync(file)
  }

  /**
   * Make a directory
   *
   * @param {string} dir The absolute path to the directory to be created
   */
  static mkdir (dir) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Making directory "' + dir + '"')
    fs.mkdirSync(dir)
  }

  /**
   * Chmod a file
   *
   * @param {string} p Absolute path to file
   * @param {number} posixPermissions Posix permissions
   */
  static chmod (p, posixPermissions) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Chmod file "' + p + '" with "' + posixPermissions + '"')
    fs.chmodSync(p, posixPermissions)
  }

  /**
   * Read and parse an ini file
   *
   * @param {string} p Absolute path to file
   * @returns {object} Ini file contents
   */
  static readIniFile (p) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Reading ini file "' + p + '"')
    try {
      const raw = FilesystemAccess.readFile(p)
      return ini.parse(raw)
    } catch (err) {
      throw new Error('Cannot parse ini file "' + p + '"' + err)
    }
  }

  /**
   * Write an ini file
   *
   * @param {string} p Absolute path to file
   * @param {object} content Ini file contents
   */
  static writeIniFile (p, content) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Writing ini file "' + p + '"')
    try {
      FilesystemAccess.writeFile(p, ini.stringify(content))
    } catch (err) {
      throw new Error('Cannot write ini file "' + p + '"' + err)
    }
  }

  /**
   * Read and parse a JSON file
   *
   * @param {string} p Absolute path to file
   * @param {boolean} ignoreError Do not exit process if there is a parsing error (suppresses error message too)
   * @returns {object} JSON file contents
   */
  static readJsonFile (p, ignoreError = false) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Reading json file "' + p + '"')
    try {
      const raw = FilesystemAccess.readFile(p)
      return JSON.parse(raw)
    } catch (err) {
      if (!ignoreError) {
        throw new Error('Cannot parse json file "' + p + '"' + err)
      }
    }
  }

  /**
   * Write a JSON file
   *
   * @param {string} p Absolute path to file
   * @param {object} content Content to be written
   */
  static writeJsonFile (p, content) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Writing json file "' + p + '"')
    FilesystemAccess.writeFile(p, JSON.stringify(content, null, 4))
  }

  /**
   * Given a file, return a read stream
   *
   * @param {string} f Absolute path to file
   * @returns {*} Read stream
   */
  static createReadStream (f) {
    const logger = log4js.getLogger('filesystem-util')
    logger.debug('Creating read stream for file "' + f + '"')
    return fs.createReadStream(f)
  }

  /**
   * List all files in a directory
   *
   * @param {string} dir Absolute path to directory
   * @returns {Array} List of string of files
   */
  static listFiles (dir) {
    return fs.readdirSync(dir)
  }
}
