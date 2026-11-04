import type { Preview } from '@storybook/react';
import { mswLoader } from 'msw-storybook-addon/csf3';
import './preview.css';

const preview: Preview = {
    loaders: [mswLoader()],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
