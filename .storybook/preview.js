import IntlProvider from '../src/app/components/intl-provider/IntlProvider';
import { Modal } from '@navikt/ds-react';
import React, { useEffect } from 'react';
window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };

import '@navikt/ds-css';
import '../src/app/styles/globalStyles.less';
const SetAppElement = () => {
    useEffect(() => {
        Modal.setAppElement('#storyRoot');
    }, []);
    return null;
};

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const decorators = [
    (Story) => (
        <div id="storyRoot">
            <SetAppElement />
            <Story />
        </div>
    ),
    (Story) => (
        <IntlProvider locale="nb">
            <Story />
        </IntlProvider>
    ),
];
