import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default [
    {
        name: 'base-config',
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        ignores: ['node_modules/**/*', 'dist/**/*'],
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
            'react-hooks': reactHooksPlugin,
            react: eslintPluginReact,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/no-unused-prop-types': 'warn',
            'react/forbid-prop-types': 0,
            '@typescript-eslint/no-use-before-define': ['error'],
            '@typescript-eslint/no-shadow': 'error',
            'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
            'no-use-before-define': 'off',
            'no-shadow': 'off',
            'default-param-last': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'import/prefer-default-export': 'off',
        },
    },
    {
        name: 'test-specific',
        files: ['*.spec.ts', '*.spec.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 0,
        },
    },
    prettierConfig,
];
