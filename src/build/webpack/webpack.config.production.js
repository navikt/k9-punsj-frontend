const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpackConfig = require('./webpack.config.global.js');

webpackConfig.mode = 'production';

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: `${__dirname}/../../app/index.html`,
        inject: 'body',
        hash: true
    })
);

webpackConfig.optimization = {
  minimizer: [new CssMinimizerPlugin()]
};

module.exports = Object.assign(webpackConfig, {
    devtool: 'source-map',
});
