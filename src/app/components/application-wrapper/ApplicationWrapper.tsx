import {Locale} from 'app/models/types/Locale';
import {Normaltekst} from 'nav-frontend-typografi';
import * as React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import IntlProvider from '../intl-provider/IntlProvider';
import LanguageToggle from '../language-toggle/LanguageToggle';

interface IApplicationWrapperProps {
    locale: Locale;
    onChangeLocale: (locale: Locale) => void;
}

const ApplicationWrapper: React.FunctionComponent<IApplicationWrapperProps> = ({ locale, onChangeLocale, children }) => {
    return (
        <IntlProvider locale={locale}>
            <Normaltekst tag="div">
                <LanguageToggle locale={locale} toggle={onChangeLocale} />
                <Router>{children}</Router>
            </Normaltekst>
        </IntlProvider>
    );
};

export default ApplicationWrapper;
