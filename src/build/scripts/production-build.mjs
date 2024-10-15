import webpack from 'webpack';
import webpackConfig from '../webpack/webpack.config.production.mjs';

webpack(webpackConfig, (err, stats) => {
    if (err || (stats.compilation.errors && stats.compilation.errors.length > 0)) {
        const error = err || stats.compilation.errors;
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    }
});
