const path = require('path');
const webpack = require('webpack');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpackConfig = require('./webpack.config.global.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

require('dotenv').config();

webpackConfig.mode = 'development';

webpackConfig.devServer = {
    hot: true,
};

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: './src/app/index.html',
        inject: 'body',
        alwaysWriteToDisk: true,
    }),
    new CopyPlugin({
        patterns: [{ from: 'src/build/webpack/faroConfig.js', to: 'js/nais.js' }],
    }),
);

webpackConfig.plugins.push(
    new HtmlWebpackHarddiskPlugin({
        outputPath: path.resolve(__dirname, '../../../dist'),
    }),
);

webpackConfig.plugins.push(
    new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: false,
    }),
);

webpackConfig.plugins.push(new ReactRefreshWebpackPlugin());
webpackConfig.plugins.push(new webpack.EnvironmentPlugin({ MSW_MODE: 'development' }));

webpackConfig.module.rules.push({
    test: /\.js$/,
    use: 'source-map-loader',
    enforce: 'pre',
    exclude: /@babel(?:\/|\\{1,2})runtime|@mswjs/,
});

webpackConfig.ignoreWarnings = [/Failed to parse source map/];

module.exports = Object.assign(webpackConfig, {
    devtool: 'eval-cheap-module-source-map',
});
