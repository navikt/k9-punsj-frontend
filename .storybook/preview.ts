import type { Preview } from '@storybook/react';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import './preview.css';

const setupMsw = async () => {
    const worker = setupWorker();
    await worker.start();

    if (!navigator.serviceWorker.controller) {
        const reloadKey = 'storybook-msw-control-reload';
        if (sessionStorage.getItem(reloadKey)) {
            sessionStorage.removeItem(reloadKey);
            throw new Error('MSW service worker did not take control of the Storybook preview after reload');
        }

        sessionStorage.setItem(reloadKey, 'true');
        await new Promise<void>((_resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject(new Error('Storybook preview did not reload to activate the MSW service worker'));
            }, 10_000);
            window.addEventListener('pagehide', () => window.clearTimeout(timeout), { once: true });
            window.location.reload();
        });
    }

    sessionStorage.removeItem('storybook-msw-control-reload');
    return worker;
};

const preview: Preview = {
    loaders: [mswLoader(setupMsw)],
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
