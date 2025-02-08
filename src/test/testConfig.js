/** Brukes i jest.config.json */

import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime.js';

window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };
