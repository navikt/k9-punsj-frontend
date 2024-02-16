require('dotenv').config();
const mustacheExpress = require('mustache-express');
const path = require('path');
const envVariables = require('../envVariables');

// Lokal utvikling med mock trenger ikke proxy.
const proxyConfig =
    process.env.MSW_MODE === 'test'
        ? {}
        : {
              '/api/k9-punsj': {
                  target: 'http://localhost:8101',
                  changeOrigin: true,
              },
              '/me': { target: 'http://localhost:8101', changeOrigin: true },
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
        app.get(`/envVariables`, (req, res) => {
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

module.exports = configureDevServer;
