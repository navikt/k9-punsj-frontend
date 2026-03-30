import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { loadRootEnv } from './load-env.mjs';

loadRootEnv();

const [{ default: webpackConfig }, { default: configureDevServer }] = await Promise.all([
    import('../webpack/webpack.config.dev.mjs'),
    import('../webpack/devserver.config.mjs'),
]);

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
