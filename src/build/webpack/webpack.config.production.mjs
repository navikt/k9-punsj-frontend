/* eslint-disable no-underscore-dangle */
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpackConfig from './webpack.config.global.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export default Object.assign(webpackConfig, {
    devtool: 'source-map',
});
