import { render } from '@testing-library/react';
import merge from 'lodash/merge';
import React, { ReactNode } from 'react';
import { createIntl } from 'react-intl';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';

import IntlProvider from '../app/components/intl-provider/IntlProvider';
import { RootStateType, rootReducer } from '../app/state/RootState';

export const testIntl = createIntl({
    locale: 'nb',
    defaultLocale: 'nb',
    messages: {},
    onError: () => undefined,
});

export const renderWithIntl = (component: ReactNode) => render(<IntlProvider locale="nb">{component}</IntlProvider>);

type DeepPartial<T> = T extends (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

interface IReduxTestProvider {
    initialState?: DeepPartial<RootStateType>;
    children: React.ReactNode;
}

export const ReduxTestProvider: React.FunctionComponent<IReduxTestProvider> = ({ initialState, children }) => {
    const defaultState = createStore(rootReducer).getState();
    const preloadedState = merge({}, defaultState, initialState) as RootStateType;
    // Use type assertion to bypass TypeScript 6 stricter preloaded state checking
    const store = createStore(rootReducer, preloadedState as any);

    return <Provider store={store}>{children}</Provider>;
};
