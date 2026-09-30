import { fileURLToPath } from 'url';
import { dirname } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpackConfig from './webpack.config.global.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

webpackConfig.mode = 'production';
webpackConfig.output = {
    ...webpackConfig.output,
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].js',
    publicPath: 'https://cdn.nav.no/k9saksbehandling/k9-punsj-frontend/dist/',
    crossOriginLoading: 'anonymous',
    clean: true,
};

webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: `${__dirname}/../../app/index.html`,
        inject: 'body',
        hash: true,
    }),
    {
        apply(compiler) {
            compiler.hooks.compilation.tap('CdnScriptCors', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap('CdnScriptCors', (data) => {
                    for (const script of data.assetTags.scripts) {
                        script.attributes.crossorigin = 'anonymous';
                    }
                    return data;
                });
            });
        },
    },
);

webpackConfig.optimization = {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin({ extractComments: false })],
};

export default Object.assign(webpackConfig, {
    devtool: 'source-map',
});
