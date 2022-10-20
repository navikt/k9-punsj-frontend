/** Brukes i jest.config.json */
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime.js';

configure({ adapter: new Adapter() });

