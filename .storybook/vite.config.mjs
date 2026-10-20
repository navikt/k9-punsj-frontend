import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Egen Vite-konfig for Storybook, slik at appens dev-server og build-oppsett ikke lastes inn.
export default defineConfig({
    resolve: {
        alias: { app: path.resolve(rootDir, 'src/app') },
    },
    css: {
        postcss: rootDir,
    },
});
