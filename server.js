const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const Promise = require('promise');
const compression = require('compression');
const helmet = require('helmet');
const envVariables = require('./envVariables');

const server = express();
server.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", process.env.OIDC_AUTH_PROXY, 'https://sentry.gc.nav.no'],
                frameSrc: ["'self'", process.env.OIDC_AUTH_PROXY],
                fontSrc: ["'self'", 'data:'],
                imgSrc: ["'self'", 'data:'],
            },
        },
    })
);

const rootPath = __dirname;

server.use(compression());
server.set('views', `${rootPath}/dist`);
server.set('view engine', 'mustache');
server.engine('html', mustacheExpress());

const renderApp = () =>
    new Promise((resolve, reject) => {
        server.render('index.html', {}, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });

const startServer = (html) => {
    server.get(`/getEnvVariables`, (req, res) => {
        res.set('content-type', 'application/javascript');
        res.send(`${envVariables()}`);
    });
    server.use('/dist/js', express.static(path.resolve(rootPath, 'dist/js')));
    server.use('/dist/css', express.static(path.resolve(rootPath, 'dist/css')));
    server.use('/dist/favicon.png', express.static(path.resolve(rootPath, 'dist/favicon.png')));

    server.get('/health/isAlive', (req, res) => res.sendStatus(200));
    server.get('/health/isReady', (req, res) => res.sendStatus(200));

    server.get(/^\/(?!.*dist).*$/, (req, res) => {
        res.send(html);
    });

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`App listening on port: ${port}`);
    });
};

const logError = (errorMessage, details) => console.log(errorMessage, details);

renderApp().then(startServer, (error) => logError('Failed to render app', error));
