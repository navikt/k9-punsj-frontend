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
        ignores: ['node_modules', 'dist'], // specify ignored files
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
            'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
            'import/no-extraneous-dependencies': [
                'warn',
                { devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'] },
            ],
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                },
            ],
            'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
            'react/require-default-props': 'off',
            'react/prop-types': 'off',
            'no-use-before-define': 'off',
            'no-shadow': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/destructuring-assignment': 'off',
            'default-param-last': 'off',
            'react/function-component-definition': 'off',
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
