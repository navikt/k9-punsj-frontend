const webpackConfig = require('./webpack.config.global.js');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

webpackConfig.mode = 'production';

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: `${__dirname}/../../app/index.html`,
        inject: 'body',
        hash: true
    })
);

webpackConfig.optimization = {
    minimizer: [
        new TerserPlugin({
            sourceMap: true
        })
    ]
};

module.exports = webpackConfig;
