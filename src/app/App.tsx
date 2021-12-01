/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-underscore-dangle */

import * as Sentry from '@sentry/react';
import Modal from 'nav-frontend-modal';
import * as React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import logger from 'redux-logger';
import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter from './containers/JournalpostRouter';
import RedigeringRouter from './containers/redigering/RedigeringRouter';
import SokIndex from './containers/sok/SokIndex';
import { Locale } from './models/types';
import { thunk } from './state/middleware';
import { rootReducer } from './state/RootState';
import './styles/globalStyles.less';
import { getLocaleFromSessionStorage, setLocaleInSessionStorage } from './utils';

const environment = window.location.hostname;

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://574f7b8c024448b9b4e36c58f4bb3161@sentry.gc.nav.no/105',
        // release: process.env.SENTRY_RELEASE || 'unknown',
        environment,
        integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
        beforeSend: (event) => {
            if (environment === 'localhost') {
                return null;
            }
            return event;
        },
    });
}

function prepare() {
    if (process.env.NODE_ENV !== 'production') {
        return import('../mocks/browser').then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }));
    }

    return Promise.resolve();
}

const reduxDevtools = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const composeEnhancers = (window[reduxDevtools] as typeof compose) || compose;

// @ts-ignore
const store = window.Cypress
    ? // @ts-ignore
      createStore(rootReducer, window.__initialState__, composeEnhancers(applyMiddleware(logger, thunk)))
    : createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

const queryClient = new QueryClient();

// eslint-disable-next-line import/prefer-default-export
export const App: React.FunctionComponent = () => {
    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);

    return (
        <Sentry.ErrorBoundary>
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
        </Sentry.ErrorBoundary>
    );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');

// venter med å rendre applikasjonen til MSW er klar
// https://mswjs.io/docs/recipes/deferred-mounting
prepare().then(() => {
    render(<App />, root);
});

// @ts-ignore
if (window.Cypress) {
    // @ts-ignore
    window.__store__ = store;
}
