require('dotenv').config();

const envVariables = () => {
    const appSettings =
        `window.appSettings = {OIDC_AUTH_PROXY: '${process.env.OIDC_AUTH_PROXY}', K9_LOS_URL: '${process.env.K9_LOS_URL}', OMP_KS_ENABLED: '${process.env.OMP_KS_ENABLED}', PLS_ENABLED: '${process.env.PLS_ENABLED}', OMP_MA_FEATURE_TOGGLE: '${process.env.OMP_MA_FEATURE_TOGGLE}', OMP_UT_FEATURE_TOGGLE: '${process.env.OMP_UT_FEATURE_TOGGLE}', SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE: '${process.env.SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE}'};`
            .trim()
            .replace(/ /g, '');
    try {
        return appSettings;
    } catch (e) {
        console.error(e);
    }
};

module.exports = envVariables;
