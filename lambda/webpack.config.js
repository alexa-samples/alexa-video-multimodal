const webpack = require('webpack')
const ZipHashPlugin = require('./scripts/zip-hash-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

module.exports = {
  output: {
    filename: 'index.js',
    libraryTarget: 'umd'
  },
  devtool: 'inline-source-map',
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  target: 'node',
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
      banner: '// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.\n' +
        '// Licensed under the Amazon Software License\n' +
        '// http://aws.amazon.com/asl/\n',
      raw: true
    }),
    new LodashModuleReplacementPlugin(),
    new ZipHashPlugin({
      outputFileName: 'lambda/lambda.[hash].zip'
    })
  ]
}
