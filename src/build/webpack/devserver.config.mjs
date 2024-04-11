/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
// eslint-disable-next-line import/extensions
import { envVariables } from '@k9-punsj-frontend/server/envVariables.js';

dotenv.config();

// __dirname is not defined in ES module scope, so we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const proxyConfig =
    process.env.MSW_MODE === 'test'
        ? {}
        : {
              '/api/k9-punsj': {
                  target: 'http://localhost:8101',
                  changeOrigin: true,
              },
          };

const configureDevServer = () => ({
    proxy: proxyConfig,
    setupMiddlewares: (middlewares, devServer) => {
        const { app } = devServer;
        app.engine('html', mustacheExpress());
        app.set('views', `${__dirname}/../../../dist`);
        app.set('view engine', 'mustache');
        app.get('/health/isAlive', (req, res) => {
            res.send('alive');
        });
        app.get('/health/isReady', (req, res) => {
            res.send('ready');
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
            res.sendFile(path.resolve(`${__dirname}/../../mocks/mockServiceWorker.js`));
        });
        app.get(/^\/(?!.*dist)(?!api).*$/, (req, res) => {
            res.render('index.html');
        });

        return middlewares;
    },
    static: ['app'],
    client: {
        overlay: {
            errors: true,
            warnings: false,
        },
    },
});

export default configureDevServer;
