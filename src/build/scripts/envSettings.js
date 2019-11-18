const fsExtra = require('fs-extra');

function createEnvSettingsFile(settingsFile) {
    fsExtra.ensureFile(settingsFile).then((f) => {
        fsExtra.writeFileSync(
            settingsFile,
            `window.appSettings = {OIDC_AUTH_PROXY: '${process.env.OIDC_AUTH_PROXY}'};`
        );
    });
}

module.exports = createEnvSettingsFile;
