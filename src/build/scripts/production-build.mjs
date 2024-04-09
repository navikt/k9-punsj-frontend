import webpack from 'webpack';
import webpackConfig from '../webpack/webpack.config.dev.mjs';

webpack(webpackConfig, (err, stats) => {
    if (err || (stats.compilation.errors && stats.compilation.errors.length > 0)) {
        const error = err || stats.compilation.errors;
        console.error(error);
        process.exit(1);
    }
});
