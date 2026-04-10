import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}

const storybookConfig: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
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

        const cssRule = config.module!.rules!.find(
            (rule) => rule && typeof rule === 'object' && rule.test && rule.test.toString().includes('.css'),
        );

        if (cssRule) {
            config.module!.rules = config.module!.rules!.filter((rule) => rule !== cssRule);
        }

        config.module!.rules!.push({
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: [tailwindcssPostcss, autoprefixer],
                        },
                    },
                },
            ],
            include: [
                path.resolve(__dirname, '../src'),
                path.resolve(__dirname, '../node_modules/@navikt/ds-css'),
                path.resolve(__dirname, './'),
            ],
        });

        return config;
    },
};

export default storybookConfig;
