/** Brukes i jest.config.json */
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import * as globalStorybookConfig from '../../.storybook/preview';
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime.js';
import { setProjectAnnotations } from '@storybook/react';

setProjectAnnotations(globalStorybookConfig);

window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };

configure({ adapter: new Adapter() });

