const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
module.exports = {
  output: {
    filename: 'web-player.js',
    path: __dirname + '/dist/web-player'
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  devtool: 'inline-source-map',
  mode: process.env.NODE_ENV !== 'development' ? 'production' : 'development',
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
        exclude: /node_modules|\.spec\.js$/,
        use: [
          'babel-loader',
          {
            loader: 'istanbul-instrumenter-loader',
            options: {
              esModules: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*$|$)/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.\n' +
        'Licensed under the Amazon Software License\n' +
        ' http://aws.amazon.com/asl/\n',
      raw: false,
      entryOnly: true
    }),
    new HtmlWebpackPlugin({
      title: 'Multi Modal Web Player Sample',
      inject: true,
      hash: true,
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css'
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'web-player'),
    compress: true,
    port: 9001,
    open: false
  }
}
