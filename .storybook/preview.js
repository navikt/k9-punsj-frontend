import IntlProvider from '../src/app/components/intl-provider/IntlProvider';

import '@navikt/ds-css';

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
        <IntlProvider locale="nb">
            <Story />
        </IntlProvider>
    ),
];
