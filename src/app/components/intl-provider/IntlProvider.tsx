import {Locale}                   from 'app/models/types';
import * as React                 from 'react';
import {IntlProvider as Provider} from 'react-intl';

const bokmalstekster = require('../../i18n/nb.json');
const nynorsktekster = require('../../i18n/nn.json');

export interface IIntlProviderProps {
    locale: Locale;
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
