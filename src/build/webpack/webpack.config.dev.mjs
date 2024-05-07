import webpack from 'webpack';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { config as dotenvConfig } from 'dotenv';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import webpackConfig from './webpack.config.global.mjs';

dotenvConfig();

webpackConfig.mode = 'development';

webpackConfig.devServer = {
    hot: true,
};

/* eslint-disable no-underscore-dangle */

// __dirname is not defined in ES module scope, so we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: './src/app/index.html',
        inject: 'body',
        alwaysWriteToDisk: true,
    }),
    new CopyPlugin({
        patterns: [{ from: 'src/build/webpack/faroConfig.js', to: 'js/nais.js' }],
    }),
    new HtmlWebpackHarddiskPlugin({
        outputPath: path.resolve(__dirname, '../../../dist'),
    }),
    new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: false,
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.EnvironmentPlugin({ MSW_MODE: 'development' }),
);

webpackConfig.module.rules.push({
    test: /\.js$/,
    use: 'source-map-loader',
    enforce: 'pre',
    exclude: /@babel(?:\/|\\{1,2})runtime|@mswjs/,
});

webpackConfig.ignoreWarnings = [/Failed to parse source map/];

export default Object.assign(webpackConfig, {
    devtool: 'eval-cheap-module-source-map',
});
