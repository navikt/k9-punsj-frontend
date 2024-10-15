import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { config } from 'dotenv';
import webpackConfig from '../webpack/webpack.config.dev.mjs';
import configureDevServer from '../webpack/devserver.config.mjs';

config();

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(configureDevServer({}), compiler);
const port = 8080;

server.start(port, '127.0.0.1', (error) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return;
    }
    // eslint-disable-next-line no-console
    console.log(`Started server on http://localhost:${port}/`);
});
