require('dotenv').config();
const mustacheExpress = require('mustache-express');
const envVariables = require('../envVariables');
const path = require('path');

const configureDevServer = () => ({
    setupMiddlewares: (middlewares, devServer) => {
        const { app } = devServer;
        app.engine('html', mustacheExpress());
        app.set('views', `${__dirname}/../../../dist`);
        app.set('view engine', 'mustache');

        app.get(`/getEnvVariables`, (req, res) => {
            res.set('content-type', 'application/javascript');
            res.json(envVariables());
        });
        app.get('/mockServiceWorker.js', (req, res) => {
            res.set('content-type', 'application/javascript');
            res.sendFile(path.resolve(`${__dirname}/../../mocks/mockServiceWorker.js`));
        });

        app.get(/^\/(?!.*dist).*$/, (req, res) => {
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
    historyApiFallback: true,
});

module.exports = configureDevServer;
