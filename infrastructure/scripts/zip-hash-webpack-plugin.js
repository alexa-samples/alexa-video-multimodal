'use strict'
const RawSource = require('webpack-sources')['RawSource']
const AdmZip = require('adm-zip')

/**
 * A simple custom webpack plugin to zip the webpack build output and add a hash to it
 * e.g. index.js -> index.123abc.zip
 *
 * There is one possible options key and it's "outputFileName".
 * If it is missing the output will be index.[hash].zip.
 *
 */
class ZipHashPlugin {
  constructor (options) {
    this.options = options || {}
  }

  /**
   * The main method for the plugin
   *
   * @param compiler
   */
  apply (compiler) {
    const _this = this
    compiler.hooks.emit.tapAsync(ZipHashPlugin.name, function (compilation, callback) {
      const zip = new AdmZip()
      const hash = compilation.hash
      let numFiles = 0
      // iterate over all the files and add them to the zip
      for (const fileName in compilation.assets) {
        const source = compilation.assets[fileName].source()
        zip.addFile(fileName, Buffer.alloc(source.length, source))
        // remove the original asset
        delete compilation.assets[fileName]
        numFiles++
      }
      // Insert this list into the Webpack build as a new file asset:
      let finalName = 'index.' + hash + '.zip'
      if (_this.options['outputFileName']) {
        finalName = _this.options.outputFileName.replace('[hash]', hash)
      }
      if (numFiles > 0) {
        compilation.assets[finalName] = new RawSource(zip.toBuffer())
      }
      callback()
    })
  }
}

module.exports = ZipHashPlugin
