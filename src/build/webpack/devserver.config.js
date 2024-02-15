require('dotenv').config();
const mustacheExpress = require('mustache-express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const envVariables = require('../envVariables');

const configureDevServer = () => ({
    proxy: {
        '/k9-punsj/api': {
            target: 'http://localhost:8101',
            pathRewrite: { '^/k9-punsj/api': '/api/k9-punsj' },
            changeOrigin: true,
        },
        '/me': { target: 'http://localhost:8101', changeOrigin: true },
    },
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

        return middlewares;
    },
    onAfterSetupMiddleware: (devServer) => {
        const { app } = devServer;
        app.get(/^\/(?!.*dist).*$/, (req, res) => {
            res.render('index.html');
        });
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
