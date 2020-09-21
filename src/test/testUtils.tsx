import React, { ReactNode } from 'react';
import { IntlShape } from 'react-intl';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { rootReducer, RootStateType } from '../app/state/RootState';
import IntlProvider from '../app/components/intl-provider/IntlProvider';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// @ts-ignore
export const testIntl: IntlShape = {
  formatMessage(descriptor: { id: string }): string {
    return descriptor.id;
  },
};

export const renderWithIntl = (component: ReactNode) =>
  render(<IntlProvider locale="nb">{component}</IntlProvider>);

export const renderWithRouterAndIntl = (
  component: ReactNode,
  history: any = createMemoryHistory({})
) =>
  render(
    <Router history={history}>
      <IntlProvider locale="nb">{component}</IntlProvider>
    </Router>
  );

interface IReduxTestProvider {
  initialState?: RootStateType;
}

export const ReduxTestProvider: React.FunctionComponent<IReduxTestProvider> = ({
  initialState,
  children,
}) => {
  const store = createStore(rootReducer, initialState);

  return <Provider store={store}>{children}</Provider>;
};
