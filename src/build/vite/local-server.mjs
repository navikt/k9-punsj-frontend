import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { envVariables } from '@k9-punsj-frontend/server/envVariables.js';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';
import { faviconPath } from './pod-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mockServiceWorkerPath = path.resolve(__dirname, '../../mocks/mockServiceWorker.js');
const mswBrowserPath = path.resolve(__dirname, '../../mocks/browser.ts');
const faroConfigPath = path.resolve(__dirname, '../webpack/faroConfig.js');
const mockPdfPath = /^\/api\/k9-punsj\/journalpost\/[^/]+\/dokument\/[^/]+\/?$/;

const sendJson = (res, body) => {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
};

const sendFile = async (res, filePath, headers) => {
    const content = await readFile(filePath);
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    res.end(content);
};

export const localServer = () => ({
    name: 'k9-punsj:local-server',
    apply: 'serve',
    transformIndexHtml() {
        // Statisk modulscript holder load-hendelsen tilbake, slik at Cypress finner window.msw etter cy.visit
        return [
            {
                tag: 'script',
                attrs: { type: 'module', src: `/@fs/${mswBrowserPath.replaceAll('\\', '/')}` },
                injectTo: 'body',
            },
        ];
    },
    configureServer(server) {
        const mockPdfBytes = createMockPdfBytes();

        server.middlewares.use(async (req, res, next) => {
            const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;

            try {
                switch (pathname) {
                    case '/health/isAlive':
                        res.end('alive');
                        return;
                    case '/health/isReady':
                        res.end('ready');
                        return;
                    case '/me':
                        sendJson(res, { name: 'Gizmo The Cat' });
                        return;
                    case '/envVariables':
                        sendJson(res, [{ key: 'IS_LOCAL', value: 'true' }, ...envVariables()]);
                        return;
                    case '/mockServiceWorker.js':
                        await sendFile(res, mockServiceWorkerPath, {
                            'content-type': 'application/javascript',
                            'service-worker-allowed': '/',
                        });
                        return;
                    case '/dist/js/nais.js':
                        await sendFile(res, faroConfigPath, { 'content-type': 'application/javascript' });
                        return;
                    case '/dist/favicon.png':
                        await sendFile(res, faviconPath, { 'content-type': 'image/png' });
                        return;
                    default:
                        break;
                }

                if (process.env.MSW_MODE === 'test' && mockPdfPath.test(pathname)) {
                    res.statusCode = 200;
                    res.setHeader('content-type', 'application/pdf');
                    res.setHeader('content-disposition', 'inline; filename="mock-dokument.pdf"');
                    res.setHeader('cache-control', 'no-store');
                    res.end(Buffer.from(mockPdfBytes));
                    return;
                }
            } catch (error) {
                next(error);
                return;
            }

            next();
        });
    },
});
