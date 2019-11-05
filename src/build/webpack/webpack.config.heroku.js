const path = require('path');
const webpackConfig = require('./webpack.config.global.js');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

webpackConfig.mode = 'production';

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: `${__dirname}/../../../heroku/index.html`,
        inject: 'body',
        hash: true
    })
);

webpackConfig.output = {
    path: path.resolve(__dirname, './../../../heroku/dist'),
    filename: 'js/[name].js',
    publicPath: '/'
};

webpackConfig.optimization = {
    minimizer: [
        new TerserPlugin({
            sourceMap: true
        })
    ]
};

module.exports = webpackConfig;
