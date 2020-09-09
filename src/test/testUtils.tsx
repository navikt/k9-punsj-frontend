import React from 'react';
import { IntlShape } from 'react-intl';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { rootReducer, RootStateType } from '../app/state/RootState';

// @ts-ignore
export const testIntl: IntlShape = {
  formatMessage(descriptor: { id: string }): string {
    return descriptor.id;
  },
};

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
