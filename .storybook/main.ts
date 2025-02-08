import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { join, dirname } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}

const storybookConfig: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@storybook/addon-interactions'),
        'storybook-addon-fetch-mock',
    ],
    framework: {
        name: getAbsolutePath('@storybook/react-webpack5'),
        options: {},
    },
    webpackFinal: async (config) => {
        config.resolve!.alias = {
            ...config.resolve!.alias,
            app: path.resolve(__dirname, '../src/app'),
        };

        // Находим существующее правило для CSS файлов
        const cssRule = config.module!.rules!.find(
            (rule) => rule && typeof rule === 'object' && rule.test && rule.test.toString().includes('.css'),
        );

        // Удаляем существующее правило для CSS
        if (cssRule) {
            config.module!.rules = config.module!.rules!.filter((rule) => rule !== cssRule);
        }

        // Добавляем новые правила
        config.module!.rules!.push(
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [tailwindcss, autoprefixer],
                            },
                        },
                    },
                ],
                include: [
                    path.resolve(__dirname, '../src'),
                    path.resolve(__dirname, '../node_modules/@navikt/ds-css'),
                    path.resolve(__dirname, './'),
                ],
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
                include: path.resolve(__dirname, '../src'),
            },
        );

        return config;
    },
};

export default storybookConfig;
