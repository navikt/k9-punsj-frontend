const tsParser = require('@typescript-eslint/parser');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-config-prettier');
const eslintPluginReact = require('eslint-plugin-react');
const eslintImport = require('eslint-plugin-import');

module.exports = [
    {
        name: 'base-config',
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // specifying which files this configuration applies to
        ignores: ['node_modules/**/*', 'dist/**/*'], // specify ignored files
        languageOptions: {
            parser: tsParser,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
            'react-hooks': reactHooksPlugin,
            react: eslintPluginReact,
            import: eslintImport
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss'],
                    moduleDirectory: ['node_modules', 'src/']
                }
            },
            react: {
                version: 'detect'
            }
        },
        rules: {
            'react/no-unused-prop-types': 'warn',
            'react/forbid-prop-types': 0,
            '@typescript-eslint/no-use-before-define': ['error'],
            '@typescript-eslint/no-shadow': 'error',
            'import/no-unresolved': 'error',
            'import/no-extraneous-dependencies': [
                'warn',
                {
                    devDependencies: [
                        '**/*.{test,spec}.{ts,tsx,js}',
                        '**/{tests,mocks,test}/**/*.{ts,tsx,js}',
                        '**/*.stories.tsx',
                        'cypress/**/*.js'
                    ]
                }
            ],
            'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
            'no-use-before-define': 'off',
            'no-shadow': 'off',
            'default-param-last': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'import/prefer-default-export': 'off'
        }
    },
    {
        name: 'test-specific',
        files: ['*.spec.ts', '*.spec.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 0
        }
    },
    prettier
];
