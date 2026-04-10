import { render } from '@testing-library/react';
import { createIntl } from 'react-intl';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, Reducer } from 'redux';
import merge from 'lodash/merge';

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

type RootAction = Parameters<typeof rootReducer>[1];
const testRootReducer: Reducer<RootStateType, RootAction, Partial<RootStateType>> = rootReducer;

export const ReduxTestProvider: React.FunctionComponent<IReduxTestProvider> = ({ initialState, children }) => {
    const defaultState = createStore(testRootReducer).getState();
    const preloadedState = merge({}, defaultState, initialState) as RootStateType;
    const store = createStore(testRootReducer, preloadedState);

    return <Provider store={store}>{children}</Provider>;
};
