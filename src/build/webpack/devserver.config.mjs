import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { envVariables } from '@k9-punsj-frontend/server/envVariables.js';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';

// __dirname is not defined in ES module scope, so we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the proxy configuration using the new array format.
const proxyConfig =
    process.env.MSW_MODE === 'test'
        ? []
        : [
              {
                  context: ['/api/k9-punsj'],
                  target: 'http://localhost:8101',
                  changeOrigin: true,
              },
          ];

const configureDevServer = () => ({
    proxy: proxyConfig,
    setupMiddlewares: (middlewares, devServer) => {
        const { app } = devServer;
        const mockPdfBytes = createMockPdfBytes();

        app.engine('html', mustacheExpress());
        app.set('views', path.resolve(__dirname, '../../../dist'));
        app.set('view engine', 'mustache');
        app.get('/health/isAlive', (req, res) => {
            res.send('alive');
        });
        app.get('/health/isReady', (req, res) => {
            res.send('ready');
        });
        app.get('/me', async (req, res) => {
            res.json({
                name: 'Gizmo The Cat',
            });
        });
        app.get(`/envVariables`, async (req, res) => {
            res.set('content-type', 'application/javascript');
            res.json([
                {
                    key: 'IS_LOCAL',
                    value: 'true',
                },
                ...envVariables(),
            ]);
        });

        app.get('/mockServiceWorker.js', (req, res) => {
            res.set('content-type', 'application/javascript');
            res.set('service-worker-allowed', '/');
            res.sendFile(path.resolve(__dirname, '../../mocks/mockServiceWorker.js'));
        });

        if (process.env.MSW_MODE === 'test') {
            app.get(/^\/api\/k9-punsj\/journalpost\/[^/]+\/dokument\/[^/]+\/?$/, (req, res) => {
                res.set('content-type', 'application/pdf');
                res.set('content-disposition', 'inline; filename="mock-dokument.pdf"');
                res.set('cache-control', 'no-store');
                res.status(200).send(Buffer.from(mockPdfBytes));
            });
        }

        return middlewares;
    },
    static: {
        directory: path.resolve(__dirname, '../../../dist'),
        publicPath: '/',
        watch: true,
    },
    client: {
        overlay: {
            errors: true,
            warnings: false,
        },
    },

    historyApiFallback: {
        disableDotRule: true,
        index: '/',
    },
});

export default configureDevServer;
