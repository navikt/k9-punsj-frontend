const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const Promise = require('promise');
const compression = require('compression');
const helmet = require('helmet');
const createEnvSettingsFile = require('./src/build/scripts/envSettings');

const server = express();
server.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", process.env.OIDC_AUTH_PROXY],
            frameSrc: ['self', process.env.OIDC_AUTH_PROXY]
        },
    }
}));

const rootPath = __dirname;

server.use(compression());
server.set('views', `${rootPath}/dist`);
server.set('view engine', 'mustache');
server.engine('html', mustacheExpress());

createEnvSettingsFile(path.resolve(`${rootPath}/dist/js/settings.js`));

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
