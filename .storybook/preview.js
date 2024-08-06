import IntlProvider from '../src/app/components/intl-provider/IntlProvider';
import React from 'react';

window.appSettings = { OIDC_AUTH_PROXY: 'undefined', K9_LOS_URL: 'undefined' };

import '@navikt/ds-css';
import '../src/app/styles/globalStyles.less';

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
            <Story />
        </div>
    ),
    (Story) => (
        <IntlProvider locale="nb">
            <Story />
        </IntlProvider>
    ),
];
