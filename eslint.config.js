import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import pluginJs from '@eslint/js';

import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default [
    {
        ignores: ['node_modules', 'dist', '.yarn', 'src/app/build', '.storybook', 'storybook-static'],
    },
    {
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {},
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss'],
                    moduleDirectory: ['node_modules', 'src/'],
                },
            },
        },
    },

    {
        name: 'base-config',
        files: ['**/*.{js,mjs,ts,jsx,tsx}'],
        languageOptions: {
            parser: tsParser,
            // parserOptions: {
            //     project: './tsconfig.json', // Point to your tsconfig.json file
            //},
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
    pluginJs.configs.recommended,
    eslintPluginReact.configs.flat.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    importPlugin.flatConfigs.recommended,
    {
        rules: {
            'no-console': WARNING,
            'no-debugger': WARNING,
            'no-duplicate-imports': ERROR,
            'no-use-before-define': OFF,
            'no-shadow': OFF,
            'no-unused-vars': OFF,
            'no-undef': OFF,
            'react/no-unused-prop-types': WARNING,
            'react/prop-types': OFF,
            'react/forbid-prop-types': OFF,
            'react/react-in-jsx-scope': OFF,
            'react/display-name': OFF,
            '@typescript-eslint/no-use-before-define': [ERROR],
            '@typescript-eslint/no-shadow': ERROR,
            '@typescript-eslint/ban-ts-comment': OFF,
            '@typescript-eslint/no-explicit-any': OFF,
            'import/prefer-default-export': OFF,
            'import/no-unresolved': ERROR,
            'import/named': OFF,
        },
    },
    {
        name: 'test-specific',
        files: ['*.spec.ts', '*.spec.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': OFF,
            '@typescript-eslint/ban-ts-comment': OFF,
            'import/no-named-as-default-member': OFF,
        },
    },
    {
        name: 'server-specific',
        files: ['server/**/*.js'],
        rules: {
            'import/no-unresolved': OFF,
        },
    },
];
