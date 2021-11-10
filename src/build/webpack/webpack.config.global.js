const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

const webpackConfig = {
    entry: [`${__dirname}/../../app/App.tsx`],
    output: {
        path: path.resolve(__dirname, './../../../dist'),
        filename: 'js/[name].js',
        publicPath: '/dist',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.less'],
        alias: {
            app: path.resolve(__dirname, './../../app'),
            common: path.resolve(__dirname, './../../common'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                include: [path.resolve(__dirname, './../../app')],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                globalVars: {
                                    coreModulePath: '"~"',
                                    nodeModulesPath: '"~"',
                                },
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: 'svg-sprite-loader',
            },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        ],
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css?[fullhash]-[chunkhash]-[name]',
        }),
        new SpriteLoaderPlugin({
            plainSprite: true,
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nb|nn|en/),
        new CopyPlugin({ patterns: [{ from: 'src/app/favicon.png' }] }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
            OIDC_AUTH_PROXY: null,
            K9_LOS_URL: 'http://localhost:8030',
        }),
    ],
};
module.exports = webpackConfig;
