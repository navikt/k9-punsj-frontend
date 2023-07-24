require('dotenv').config();
const mustacheExpress = require('mustache-express');
const express = require('express');
const envVariables = require('../envVariables');
const path = require('path');

const configureDevServer = (decoratorFragments) => ({
    setupMiddlewares: (middlewares, devServer) => {
        const { app } = devServer;
        app.engine('html', mustacheExpress());
        app.set('views', `${__dirname}/../../../dist`);
        app.set('view engine', 'mustache');
        app.use('/dist', express.static(path.resolve(__dirname, './../../../dist')));
        app.get(`/getEnvVariables`, (req, res) => {
            res.set('content-type', 'application/javascript');
            res.send(`${envVariables()}`);
        });
        app.get('/mockServiceWorker.js', (req, res) => {
            res.set('content-type', 'application/javascript');
            res.sendFile(path.resolve(`${__dirname}/../../mocks/mockServiceWorker.js`));
        });
        app.get('/*', (req, res) => {
            res.render('index.html', Object.assign(decoratorFragments));
        });

        return middlewares;
    },
    devMiddleware: {
        publicPath: '/',
        stats: 'minimal',
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
