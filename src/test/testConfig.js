/** Brukes i jest.config.json */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime.js';

window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };

configure({ adapter: new Adapter() });
