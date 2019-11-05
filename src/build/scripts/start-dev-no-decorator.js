const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack/webpack.config.dev');
const configureDevServer = require('../webpack/devserver.config');
const path = require('path');
const createEnvSettingsFile = require('./envSettings');

require('dotenv').config();

createEnvSettingsFile(path.resolve(`${__dirname}/../../../dist/js/settings.js`));

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, configureDevServer({}));

server.listen(8081, '127.0.0.1', () => console.log('Started server on http://localhost:8081/'));
