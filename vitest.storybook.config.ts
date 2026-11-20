import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import storybookViteConfig from './.storybook/vite.config.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
    storybookViteConfig,
    defineConfig({
        plugins: [storybookTest({ configDir: path.resolve(rootDir, '.storybook') })],
        test: {
            name: 'storybook',
            browser: {
                enabled: true,
                headless: true,
                provider: playwright({}),
                instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['./.storybook/vitest.setup.ts'],
            reporters: ['default', ['junit', { outputFile: 'storybook-junit.xml' }]],
        },
    }),
);
