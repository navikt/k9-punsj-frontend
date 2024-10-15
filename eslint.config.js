import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintImport from 'eslint-plugin-import';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default [
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
            '@typescript-eslint': typescriptPlugin,
            'react-hooks': reactHooksPlugin,
            react: eslintPluginReact,
            import: eslintImport,
        },
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
        rules: {
            'react/no-unused-prop-types': WARNING,
            'no-console': WARNING,
            'no-debugger': WARNING,
            'react/prop-types': OFF,
            'react/forbid-prop-types': OFF,
            '@typescript-eslint/no-use-before-define': [ERROR],
            '@typescript-eslint/no-shadow': ERROR,
            'no-use-before-define': OFF,
            'no-shadow': OFF,
            'no-unused-vars': WARNING,
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
    prettier,
];
