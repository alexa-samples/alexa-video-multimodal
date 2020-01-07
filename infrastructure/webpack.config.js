const webpack = require('webpack')
const WebpackOnBuildPlugin = require('on-build-webpack')
const chmod = require('chmod')

module.exports = {
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    filename: 'bin/alexa-video-infrastructure-cli'
  },
  entry: {
    app: './src/index.js'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }

    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node\n\n' +
        '// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.\n' +
        '// Licensed under the Amazon Software License\n' +
        '// http://aws.amazon.com/asl/\n',
      raw: true
    }),
    new WebpackOnBuildPlugin(function (stats) {
      chmod('./dist/bin/alexa-video-infrastructure-cli', 755)
    })
  ]
}
