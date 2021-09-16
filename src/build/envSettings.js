require('dotenv').config();

const envSettings = () => {
  const appSettings = `window.appSettings = {OIDC_AUTH_PROXY: '${process.env.OIDC_AUTH_PROXY}', K9_LOS_URL: '${process.env.K9_LOS_URL}'};`.trim().replace(/ /g, '');
  try {
    return appSettings;
  } catch (e) {
    console.error(e);
  }
}

module.exports = envSettings;