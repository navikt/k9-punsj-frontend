import { render } from '@testing-library/react';
import { createIntl } from 'react-intl';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';

import IntlProvider from '../app/components/intl-provider/IntlProvider';
import { RootStateType, rootReducer } from '../app/state/RootState';

export const testIntl = createIntl({ locale: 'nb', defaultLocale: 'nb', messages: {} });

export const renderWithIntl = (component: ReactNode) => render(<IntlProvider locale="nb">{component}</IntlProvider>);

interface IReduxTestProvider {
    initialState?: Partial<RootStateType>;
    children: React.ReactNode;
}

export const ReduxTestProvider: React.FunctionComponent<IReduxTestProvider> = ({ initialState, children }) => {
    const store = createStore(rootReducer, initialState as any);

    return <Provider store={store}>{children}</Provider>;
};
