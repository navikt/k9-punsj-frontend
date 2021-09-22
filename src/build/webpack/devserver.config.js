require('dotenv').config();
const mustacheExpress = require('mustache-express');
const envVariables = require('../envVariables');

const configureDevServer = (decoratorFragments) => ({
    onBeforeSetupMiddleware: (devServer) => {
        const {app} = devServer;
        app.engine('html', mustacheExpress());
        app.set('views', `${__dirname}/../../../dist/dev`);
        app.set('view engine', 'mustache');
        app.get(`/getEnvVariables`, (req, res) => {
            res.set('content-type', 'application/javascript');
            res.send(`${envVariables()}`);
        });
        app.get(/^\/(?!.*dist).*$/, (req, res) => {
            res.render('index.html', Object.assign(decoratorFragments));
        });
    },
    devMiddleware: {
        publicPath: '/dist',
        stats: 'minimal',
    },
    static: ['app'],
    client: {
        overlay: {
            errors: true,
            warnings: false
        }
    }
});

module.exports = configureDevServer;
