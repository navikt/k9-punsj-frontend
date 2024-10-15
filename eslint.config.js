// eslint-disable-next-line import/no-unresolved
import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default [
    {
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
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
        ignores: ['node_modules/**/*', 'dist/**/*', '.yarn/**/*', '.yarn', 'src/app/build/**/*'], // specify ignored files
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',
            ecmaVersion: 'latest', // Ensure that ES2023 or latest is supported
        },
        plugins: {
            'react-hooks': reactHooksPlugin,
        },
    },
    eslintPluginReact.configs.flat.recommended,
    ...tseslint.configs.recommended,
    prettier,
    importPlugin.flatConfigs.recommended,
    {
        rules: {
            'react/no-unused-prop-types': WARNING,
            'no-console': WARNING,
            'no-debugger': WARNING,
            'import/no-unresolved': ERROR,
            'react/prop-types': OFF,
            'react/forbid-prop-types': OFF,
            'react/react-in-jsx-scope': OFF,
            'react/display-name': OFF,
            '@typescript-eslint/no-use-before-define': [ERROR],
            '@typescript-eslint/no-shadow': ERROR,
            'no-use-before-define': OFF,
            'no-shadow': OFF,
            'no-unused-vars': OFF,
            'default-param-last': OFF,
            '@typescript-eslint/no-explicit-any': OFF,
            'import/prefer-default-export': OFF,
        },
    },
    {
        name: 'test-specific',
        files: ['*.spec.ts', '*.spec.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': OFF,
            '@typescript-eslint/ban-ts-comment': OFF,
        },
    },
];
