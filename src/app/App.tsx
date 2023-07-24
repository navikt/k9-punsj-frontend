/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable no-underscore-dangle */
import { composeWithDevTools } from '@redux-devtools/extension';
import * as Sentry from '@sentry/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// eslint-disable-next-line camelcase
import { applyMiddleware, legacy_createStore } from 'redux';
import logger from 'redux-logger';

import '@navikt/ds-css';
import { Modal as DsModal } from '@navikt/ds-react';
import '@navikt/ft-plattform-komponenter/dist/style.css';

import { ApiPath } from './apiConfig';
import SendBrevIAvsluttetSak from './brevIAvsluttetSak/SendBrevIAvsluttetSak';
import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter from './containers/JournalpostRouter';
import RedigeringRouter from './containers/redigering/RedigeringRouter';
import SokIndex from './containers/sok/SokIndex';
import { Locale } from './models/types';
import OpprettJournalpost from './opprett-journalpost/OpprettJournalpost';
import { rootReducer } from './state/RootState';
import { thunk } from './state/middleware';
import './styles/globalStyles.less';
import { getLocaleFromSessionStorage, setLocaleInSessionStorage } from './utils';

const environment = window.location.hostname;

Sentry.init({
    dsn: 'https://574f7b8c024448b9b4e36c58f4bb3161@sentry.gc.nav.no/105',
    release: process.env.SENTRY_RELEASE || 'unknown',
    environment,
    integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
    beforeSend: (event) => {
        if (environment === 'localhost') {
            return null;
        }
        return event;
    },
});

function prepare() {
    if (process.env.NODE_ENV !== 'production') {
        return import('../mocks/browser').then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }));
    }

    return Promise.resolve();
}

// @ts-ignore
const store = window.Cypress
    ? // @ts-ignore
      legacy_createStore(rootReducer, window.__initialState__, composeWithDevTools(applyMiddleware(logger, thunk)))
    : legacy_createStore(rootReducer, composeWithDevTools(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
    queries: {
        refetchOnWindowFocus: false,
    },
});

// eslint-disable-next-line import/prefer-default-export
export const App: React.FunctionComponent = () => {
    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);

    React.useEffect(() => {
        DsModal?.setAppElement('#app');
        fetch(ApiPath.ENV_VARIABLES).then((response) => {
            response.json().then((data) => {
                const envVariables = data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
                const appSettings = {
                    OIDC_AUTH_PROXY: envVariables.OIDC_AUTH_PROXY,
                    K9_LOS_URL: envVariables.K9_LOS_URL,
                    OMP_KS_ENABLED: envVariables.OMP_KS_ENABLED,
                    PLS_ENABLED: envVariables.PLS_ENABLED,
                    OMP_MA_FEATURE_TOGGLE: envVariables.OMP_MA_FEATURE_TOGGLE,
                    OMP_UT_FEATURE_TOGGLE: envVariables.OMP_UT_FEATURE_TOGGLE,
                    SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE: envVariables.SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE,
                    OLP_ENABLED: envVariables.OLP_ENABLED,
                    OMP_AO_ENABLED: envVariables.OMP_AO_ENABLED,
                    POSTMOTTAK_TOGGLE: envVariables.POSTMOTTAK_TOGGLE,
                };
                window.appSettings = JSON.parse(JSON.stringify(appSettings));
            });
        });
    }, []);

    return (
        <Sentry.ErrorBoundary>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools initialIsOpen={false} />
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
                                <Route path="/opprett-journalpost">
                                    <OpprettJournalpost />
                                </Route>
                                <Route path="/brev-avsluttet-sak">
                                    <SendBrevIAvsluttetSak />
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

const container = document.getElementById('app');
const root = createRoot(container!);

// venter med å rendre applikasjonen til MSW er klar
// https://mswjs.io/docs/recipes/deferred-mounting
prepare().then(() => {
    root.render(<App />);
});

// @ts-ignore
if (window.Cypress) {
    // @ts-ignore
    window.__store__ = store;
}
