import * as React from 'react';
import { IntlProvider } from 'react-intl';

const messages = require('./testMessages.json');

const TestIntlProvider: React.FunctionComponent = ({ children }) => {
    return (
        <IntlProvider locale="nb" messages={messages}>
            {children}
        </IntlProvider>
    );
};

export default TestIntlProvider;
