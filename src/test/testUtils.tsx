import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React, { ReactNode } from 'react';
import { IntlShape } from 'react-intl';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createStore } from 'redux';

import IntlProvider from '../app/components/intl-provider/IntlProvider';
import { RootStateType, rootReducer } from '../app/state/RootState';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const testIntl: IntlShape = {
    formatMessage(descriptor: { id: string }): string {
        return descriptor.id;
    },
};

export const renderWithIntl = (component: ReactNode) => render(<IntlProvider locale="nb">{component}</IntlProvider>);

export const renderWithRouterAndIntl = (component: ReactNode, history: any = createMemoryHistory({})) =>
    render(
        <Router history={history}>
            <IntlProvider locale="nb">{component}</IntlProvider>
        </Router>,
    );

interface IReduxTestProvider {
    initialState?: RootStateType;
}

export const ReduxTestProvider: React.FunctionComponent<IReduxTestProvider> = ({ initialState, children }) => {
    const store = createStore(rootReducer, initialState);

    return <Provider store={store}>{children}</Provider>;
};
