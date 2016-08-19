/*
 * @Author: edconstdchen
 * @Date:   2016-08-10 22:36:57
 * @Last Modified by:   edvardchen
 * @Last Modified time: 2016-08-19 22:28:51
 */
const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  eslint: {
    configFile: '.eslintrc.yml',
  },
  target: 'node',
  cache: false,
  context: __dirname,
  debug: false,
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '.tmp/'),
    filename: 'index.js'
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loaders: ['json']
    }],
    preLoaders: [{
      test: /\.js$/,
      loaders: ['eslint-loader'],
      exclude: [/node_modules/]
    }],
    postLoaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
    }],
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
    ],
    extensions: ['', '.json', '.js']
  },
  externals: [nodeExternals()],
  node: {
    __dirname: true,
    fs: 'empty'
  }
};
