const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../webpack/webpack.config.heroku');
const fsExtra = require('fs-extra');

function createEnvSettingsFileForHeroku() {
    const settingsFile = path.resolve(__dirname, './../../../heroku/dist/js/settings.js');
    fsExtra.ensureFile(settingsFile).then((f) => {
        fsExtra.writeFileSync(
            settingsFile,
            `window.appSettings = {
                API_URL: 'https://pleiepenger.herokuapp.com/',
                LOGIN_URL: 'https://pleiepenger.herokuapp.com/',
                TOGGLE_FJERN_GRAD: 'on',
                TOGGLE_TILSYN: 'on',
                DEMO_MODE: 'on'
            };`
        );
    });
}

webpack(webpackConfig, (err, stats) => {
    if (err || (stats.compilation.errors && stats.compilation.errors.length > 0)) {
        let error = err || stats.compilation.errors;
        console.error(error);
        process.exit(1);
    }
});

createEnvSettingsFileForHeroku();
