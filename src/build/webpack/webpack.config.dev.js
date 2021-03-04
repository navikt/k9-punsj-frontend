const path = require('path');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpackConfig = require('./webpack.config.global.js');

require('dotenv').config();

webpackConfig.mode = 'development';

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: './src/app/index.html',
        inject: 'body',
        alwaysWriteToDisk: true
    })
);

webpackConfig.plugins.push(
    new HtmlWebpackHarddiskPlugin({
        outputPath: path.resolve(__dirname, '../../../dist/dev')
    })
);

webpackConfig.plugins.push(
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: false,
  })
);

webpackConfig.module.rules.push({
    test: /\.js$/,
    use: 'source-map-loader',
    enforce: 'pre'
});

module.exports = Object.assign(webpackConfig, {
    devtool: 'cheap-module-eval-source-map',
});
