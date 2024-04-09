/* eslint-disable no-underscore-dangle */
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// Since __dirname is not available in ESM, we need to construct paths differently
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
                            plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
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
                    'css-loader',
                    'postcss-loader',
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
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css?[fullhash]-[chunkhash]-[name]',
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /nb|nn|en/),
        new CopyPlugin({
            patterns: [{ from: 'src/app/favicon.png' }],
        }),
        new webpack.EnvironmentPlugin({ SENTRY_RELEASE: null }),
    ],
    externals: { '../build/webpack/faroConfig': 'false' },
};

export default webpackConfig;
