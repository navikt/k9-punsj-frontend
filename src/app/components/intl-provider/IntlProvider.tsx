import * as React from 'react';
import { IntlProvider as Provider } from 'react-intl';

import { Locale } from 'app/models/types';

import bokmalstekster from '../../i18n/nb.json';
import nynorsktekster from '../../i18n/nn.json';

export interface IIntlProviderProps {
    locale: Locale;
    children: React.ReactNode;
}

const IntlProvider: React.FunctionComponent<IIntlProviderProps> = ({ locale, children }) => {
    const messages = locale === 'nb' ? bokmalstekster : nynorsktekster;
    return (
        <Provider locale={locale} messages={messages}>
            {children}
        </Provider>
    );
};

export default IntlProvider;
