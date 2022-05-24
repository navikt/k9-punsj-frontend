require('dotenv').config();

const envVariables = () => {
    const appSettings =
        `window.appSettings = {OIDC_AUTH_PROXY: '${process.env.OIDC_AUTH_PROXY}', K9_LOS_URL: '${process.env.K9_LOS_URL}', OMP_KS_ENABLED: '${process.env.OMP_KS_ENABLED}', PLS_ENABLED: '${process.env.PLS_ENABLED}', PLS_FORHINDRE_INNSENDING_TIL_K9: '${process.env.PLS_FORHINDRE_INNSENDING_TIL_K9}'};`
            .trim()
            .replace(/ /g, '');
    try {
        return appSettings;
    } catch (e) {
        console.error(e);
    }
};

module.exports = envVariables;
