const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpackConfig = require('./webpack.config.global.js');
const TerserPlugin = require('terser-webpack-plugin');

webpackConfig.mode = 'production';

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: `${__dirname}/../../app/index.html`,
        inject: 'body',
        hash: true,
    }),
);

webpackConfig.optimization = {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin({ extractComments: false })],
};

module.exports = Object.assign(webpackConfig, {
    devtool: 'source-map',
});
