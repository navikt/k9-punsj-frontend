/** Brukes i jest.config.json */
import { setProjectAnnotations } from '@storybook/react';
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime.js';

import * as globalStorybookConfig from '../../.storybook/preview';

setProjectAnnotations(globalStorybookConfig);

window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };
