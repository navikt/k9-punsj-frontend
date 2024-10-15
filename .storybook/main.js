/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
    typescript: {
        reactDocgen: false,
    },
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
            include: [path.resolve(__dirname, '../')],
        });
        config.resolve.alias = {
            app: path.resolve(__dirname, '../src/app'),
        };
        config.resolve.plugins = [
            ...(config.resolve.plugins || []),
            new TsconfigPathsPlugin({
                extensions: config.resolve.extensions,
            }),
        ];
        return config;
    },
    docs: {
        autodocs: true,
    },
};
