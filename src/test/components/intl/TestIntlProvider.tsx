import * as React from 'react';
import { IntlProvider } from 'react-intl';

import messages from './testMessages.json';

const TestIntlProvider: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => (
    <IntlProvider locale="nb" messages={messages}>
        {children}
    </IntlProvider>
);

export default TestIntlProvider;
