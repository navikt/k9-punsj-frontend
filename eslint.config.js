import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default [
    {
        name: 'base-config',
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        ignores: ['node_modules/', 'dist/', 'build/', 'cypress/plugins/', 'cypress/support/', '.storybook/'],
        settings: {
            react: {
                version: 'detect',
            },
        },
        languageOptions: { globals: globals.browser },
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginReact.configs.flat.recommended,
    eslintConfigPrettier,
    {
        rules: {
            'react/no-unused-prop-types': WARNING,
            'react/forbid-prop-types': OFF,
            'react/prop-types': OFF,
            '@typescript-eslint/no-use-before-define': [ERROR],
            '@typescript-eslint/no-shadow': [ERROR],
            '@typescript-eslint/no-unused-vars': ['error'],
            'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
            'no-use-before-define': OFF,
            'no-shadow': OFF,
            'no-unused-vars': OFF,
            'no-undef': OFF,
            'default-param-last': OFF,
            '@typescript-eslint/no-explicit-any': OFF,
            '@typescript-eslint/ban-ts-comment': OFF,
        },
    },
    {
        name: 'test-specific',
        files: ['*.spec.ts', '*.spec.tsx'],
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': OFF,
            '@typescript-eslint/ban-ts-comment': OFF,
        },
    },
];
