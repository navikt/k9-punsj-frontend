import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { localServer } from './src/build/vite/local-server.mjs';
import { podAssets } from './src/build/vite/pod-assets.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(rootDir, 'src/app');

// Må samsvare med CDN-opplastingen i deploy-workflowene: dist/js -> /k9-punsj-frontend/dist/js
const CDN_BASE = 'https://cdn.nav.no/k9saksbehandling/k9-punsj-frontend/dist/';

export default defineConfig(({ command, mode }) => {
    const isBuild = command === 'build';

    return {
        root: appDir,
        base: isBuild ? CDN_BASE : '/',
        publicDir: false,
        envDir: rootDir,
        plugins: [react(), podAssets(), localServer()],
        resolve: {
            alias: { app: appDir },
        },
        css: {
            postcss: rootDir,
        },
        // Kun disse verdiene skal inn i nettleserbunten, ikke hele process.env
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
            'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION ?? null),
            'process.env.MSW_MODE': JSON.stringify(process.env.MSW_MODE ?? 'development'),
        },
        test: {
            root: rootDir,
            environment: 'jsdom',
            globals: true,
            include: ['src/**/*.spec.{ts,tsx}'],
            setupFiles: ['./testSetup.js', './src/test/testConfig.js'],
        },
        server: {
            host: '127.0.0.1',
            port: 8080,
            strictPort: true,
            fs: { allow: [rootDir] },
            proxy:
                process.env.MSW_MODE === 'test'
                    ? undefined
                    : { '/api/k9-punsj': { target: 'http://localhost:8101', changeOrigin: true } },
        },
        build: {
            outDir: path.resolve(rootDir, 'dist'),
            emptyOutDir: true,
            assetsDir: 'js',
            sourcemap: true,
            chunkSizeWarningLimit: 2000,
            rolldownOptions: {
                output: {
                    entryFileNames: 'js/[name].[hash].js',
                    chunkFileNames: 'js/[name].[hash].js',
                    assetFileNames: 'js/[name].[hash][extname]',
                },
            },
        },
    };
});
