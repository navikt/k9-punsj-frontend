import Modal from 'nav-frontend-modal';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import { QueryClient, QueryClientProvider } from 'react-query';

import logger from 'redux-logger';
import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter from './containers/JournalpostRouter';
import { Locale } from './models/types';
import { thunk } from './state/middleware';
import { rootReducer } from './state/RootState';
import './styles/globalStyles.less';
import { getLocaleFromSessionStorage, setLocaleInSessionStorage } from './utils';
import SokIndex from './containers/sok/SokIndex';
import RedigeringRouter from './containers/redigering/RedigeringRouter';

const reduxDevtools = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const composeEnhancers = (window[reduxDevtools] as typeof compose) || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

const queryClient = new QueryClient();

// eslint-disable-next-line import/prefer-default-export
export const App: React.FunctionComponent = () => {
    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ApplicationWrapper
                    locale={locale}
                    onChangeLocale={(activeLocale: Locale) => {
                        setLocaleInSessionStorage(activeLocale);
                        setLocale(activeLocale);
                    }}
                >
                    <BrowserRouter>
                        <Switch>
                            <Route path="/rediger/">
                                <RedigeringRouter />
                            </Route>
                            <Route path="/journalpost/:journalpostid/">
                                <JournalpostRouter />
                            </Route>
                            <Route path="/">
                                <SokIndex />
                            </Route>
                        </Switch>
                    </BrowserRouter>
                </ApplicationWrapper>
            </QueryClientProvider>
        </Provider>
    );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');
render(<App />, root);
