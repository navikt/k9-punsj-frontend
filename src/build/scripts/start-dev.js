const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack/webpack.config.dev');
const configureDevServer = require('../webpack/devserver.config');
require('dotenv').config();

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, configureDevServer({}));
const port = 8080;

server.listen(port, '127.0.0.1', (error) => {
  if (error) {
    console.log(error);
    return;
  }
  console.log(`Started server on http://localhost:${port}/`);
});
