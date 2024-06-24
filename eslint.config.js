import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintImport from 'eslint-plugin-import';

export default [
    {
        name: 'base-config',
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // specifying which files this configuration applies to
        ignores: ['node_modules/**/*', 'dist/**/*'], // specify ignored files
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
            'react-hooks': reactHooksPlugin,
            react: eslintPluginReact,
            import: eslintImport,
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss'],
                    moduleDirectory: ['node_modules', 'src/'],
                },
            },
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
                        '**/*.test.ts',
                        '**/*.test.tsx',
                        '**/*.spec.ts',
                        '**/*.spec.tsx',
                        'tests/**/*.ts',
                        '**/mocks/*.ts',
                        '**/mocks/**/*.ts',
                        '**/test/**/*.js',
                        '**/test/*.js',
                        '**/test/**/*.ts',
                        '**/test/*.ts',
                        '**/test/**/*.tsx',
                        '**/test/*.tsx',
                        '**/*.stories.tsx',
                        'cypress/**/*.js',
                        '**/build/**/*.js',
                        'eslint.config.js',
                    ],
                },
            ],
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
    prettier,
];
