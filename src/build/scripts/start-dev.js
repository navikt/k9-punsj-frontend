const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const webpackConfig = require('../webpack/webpack.config.dev');
const configureDevServer = require('../webpack/devserver.config');
require('dotenv').config();

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(configureDevServer({}), compiler);
const port = 8080;

server.start(port, '127.0.0.1', (error) => {
    if (error) {
        console.log(error);
        return;
    }
    console.log(`Started server on http://localhost:${port}/`);
});
