const fsExtra = require('fs-extra');

function createEnvSettingsFile(settingsFile) {
    fsExtra.ensureFile(settingsFile).then((f) => {
        fsExtra.writeFileSync(
            settingsFile,
            `window.appSettings = {OIDC_AUTH_PROXY: '${process.env.OIDC_AUTH_PROXY}'};\r\nwindow.appSettings = {K9_LOS_URL: '${process.env.K9_LOS_URL}'};`
        );
    });
}

module.exports = createEnvSettingsFile;
