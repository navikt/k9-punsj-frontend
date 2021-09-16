const path = require('path');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpackConfig = require('./webpack.config.global.js');
const CopyPlugin = require('copy-webpack-plugin');

require('dotenv').config();

webpackConfig.mode = 'development';

webpackConfig.plugins.push(
  new HtmlWebpackPlugin({
    template: './src/app/index.html',
    inject: 'body',
    alwaysWriteToDisk: true,
  })
);

webpackConfig.plugins.push(
  new HtmlWebpackHarddiskPlugin({
    outputPath: path.resolve(__dirname, '../../../dist/dev'),
  })
);

webpackConfig.plugins.push(
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: false,
  })
);

webpackConfig.plugins.push(
  new CopyPlugin({
    patterns: [{ from: 'src/app/mockServiceWorker.js' }],
  })
);

webpackConfig.module.rules.push({
  test: /\.js$/,
  use: 'source-map-loader',
  enforce: 'pre',
});

module.exports = Object.assign(webpackConfig, {
  devtool: 'eval-cheap-module-source-map',
});
