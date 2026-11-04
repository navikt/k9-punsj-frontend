import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
    globalIgnores([
        'dist/**',
        '.yarn/**',
        'src/app/build/**',
        '.storybook/**',
        'storybook-static/**',
        'playwright-report/**',
        'test-results/**',
        'src/mocks/mockServiceWorker.js',
    ]),
    {
        name: 'javascript',
        files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
        extends: [js.configs.recommended],
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        rules: {
            'no-console': 'warn',
            'no-duplicate-imports': 'error',
        },
    },
    {
        name: 'imports',
        files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
        extends: [importX.flatConfigs.recommended],
        settings: {
            ...importX.flatConfigs.typescript.settings,
            'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.json' })],
        },
    },
    {
        name: 'node',
        files: [
            '*.{js,mjs,cjs}',
            'server/**/*.{js,mjs,cjs}',
            'src/build/**/*.{js,mjs,cjs}',
            '.github/**/*.{js,mjs,cjs}',
            'cypress/plugins/**/*.{js,mjs,cjs}',
            'playwright.config.ts',
        ],
        languageOptions: { globals: globals.node },
        settings: { 'import-x/resolver-next': [createNodeResolver()] },
    },
    {
        name: 'browser',
        files: ['src/**/*.{js,jsx,ts,tsx}', 'cypress/**/*.{js,ts}', 'e2e/**/*.{ts,tsx}'],
        languageOptions: { globals: globals.browser },
    },
    {
        name: 'typescript',
        files: ['**/*.{ts,tsx}'],
        extends: [tseslint.configs.recommended, importX.flatConfigs.typescript],
        rules: {
            // TypeScript validerer standardeksporter med allowSyntheticDefaultImports, også for CommonJS.
            'import-x/default': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/no-shadow': 'error',
            // Eksisterende kode bruker any og TypeScript-direktiver; strengere typer ryddes separat.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
    {
        name: 'react',
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        extends: [
            eslintReact.configs['recommended-typescript'],
            eslintReact.configs['disable-rsc'],
            eslintReact.configs['disable-naming-convention'],
            reactHooks.configs.flat.recommended,
        ],
        rules: {
            '@eslint-react/jsx-no-children-prop': 'error',
            '@eslint-react/jsx-no-comment-textnodes': 'error',
            '@eslint-react/dom-no-unknown-property': 'error',
            '@eslint-react/dom-no-unsafe-target-blank': 'error',
            // Reacts offisielle plugin håndterer disse reglene uten doble meldinger.
            '@eslint-react/error-boundaries': 'off',
            '@eslint-react/exhaustive-deps': 'off',
            '@eslint-react/purity': 'off',
            '@eslint-react/rules-of-hooks': 'off',
            '@eslint-react/set-state-in-effect': 'off',
            '@eslint-react/set-state-in-render': 'off',
            '@eslint-react/static-components': 'off',
            '@eslint-react/unsupported-syntax': 'off',
            '@eslint-react/use-memo': 'off',
            // Eksisterende effekter i skjemaene krever egen gjennomgang før regelen kan stoppe CI.
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
    {
        name: 'vitest',
        files: ['src/**/*.spec.{ts,tsx}', 'src/test/**', 'testSetup.js'],
        languageOptions: { globals: globals.vitest },
    },
    {
        name: 'cypress',
        files: ['cypress/**/*.{js,ts}'],
        languageOptions: {
            globals: {
                ...globals.mocha,
                cy: 'readonly',
                Cypress: 'readonly',
                expect: 'readonly',
                assert: 'readonly',
            },
        },
        settings: {
            'import-x/resolver-next': [createTypeScriptImportResolver({ project: './cypress/tsconfig.json' })],
        },
    },
    prettier,
);
