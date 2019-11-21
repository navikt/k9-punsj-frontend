import {Locale}                                  from 'app/models/types';
import * as React                                from 'react';
import {addLocaleData, IntlProvider as Provider} from 'react-intl';
import * as nbLocaleData                         from 'react-intl/locale-data/nb';
import * as nnLocaleData                         from 'react-intl/locale-data/nn';

const bokmalstekster = require('../../i18n/nb.json');
const nynorsktekster = require('../../i18n/nn.json');

addLocaleData([...nbLocaleData, ...nnLocaleData]);

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
