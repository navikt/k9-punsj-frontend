import moment from 'moment';
import Modal from 'nav-frontend-modal';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';

import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter from './containers/JournalpostRouter';
import { Locale } from './models/types';
import logger from 'redux-logger';
import { thunk } from './state/middleware';
import { rootReducer } from './state/RootState';
import './styles/globalStyles.less';
import {
  getLocaleFromSessionStorage,
  setLocaleInSessionStorage,
} from './utils';
import SokIndex from "./containers/sok/SokIndex";
import RedigeringRouter from "./containers/redigering/RedigeringRouter";

const reduxDevtools = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const composeEnhancers = (window[reduxDevtools] as typeof compose) || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(logger, thunk))
);

const localeFromSessionStorage = getLocaleFromSessionStorage();

export const App: React.FunctionComponent = () => {
  const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);
  moment.locale(localeFromSessionStorage);

  return (
    <Provider store={store}>
      <ApplicationWrapper
        locale={locale}
        onChangeLocale={(activeLocale: Locale) => {
          setLocaleInSessionStorage(activeLocale);
          setLocale(activeLocale);
        }}
      >
        <BrowserRouter>
          <Switch>
            <Route path="/rediger/" children={RedigeringRouter} />
            <Route path="/journalpost/:journalpostid/" children={JournalpostRouter} />
            <Route path="/" children={SokIndex} />
          </Switch>
        </BrowserRouter>
      </ApplicationWrapper>
    </Provider>
  );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');
render(<App />, root);
