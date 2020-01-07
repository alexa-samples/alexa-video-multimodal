const webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({

    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'test/**/*.spec.js',
      'src/**/*.js',
      'src/**/*.html'
    ],

    exclude: [
      'src/index.js',
      'src/device-shim.js'
    ],

    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.spec.js': ['webpack'],
      'src/**/*.html': ['html2js']
    },

    reporters: [
      'progress',
      'coverage-istanbul'
    ],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['FirefoxHeadless'],

    singleRun: true,
    webpack: webpackConfig,

    concurrency: Infinity,
    coverageIstanbulReporter: {
      dir: 'coverage',
      reports: ['html', 'text-summary'],
      fixWebpackSourcePaths: true,
      combineBrowserReports: false,
      skipFilesWithNoCoverage: false

    },
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    },

    html2JsPreprocessor: {
      stripPrefix: 'src/'
    }
  })
}
