import { render } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { createIntl } from 'react-intl';

import IntlProvider from '../app/components/intl-provider/IntlProvider';

export const testIntl = createIntl({
    locale: 'nb',
    defaultLocale: 'nb',
    messages: {},
    onError: () => undefined,
});

export const renderWithIntl = (component: ReactNode) => render(<IntlProvider locale="nb">{component}</IntlProvider>);
