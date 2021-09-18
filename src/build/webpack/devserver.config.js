require('dotenv').config();
const mustacheExpress = require('mustache-express');
const envVariables = require('../envVariables');

const configureDevServer = (decoratorFragments) => ({
    before: (app) => {
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
    contentBase: ['app'],
    watchContentBase: true,
    quiet: false,
    noInfo: false,
    stats: 'minimal',
    publicPath: '/dist'
});

module.exports = configureDevServer;
