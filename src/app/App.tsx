import { composeWithDevTools } from '@redux-devtools/extension';
import * as Sentry from '@sentry/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import {
    Navigate,
    Route,
    Routes,
    createRoutesFromChildren,
    matchRoutes,
    useLocation,
    useNavigationType,
} from 'react-router-dom';

import { applyMiddleware, legacy_createStore } from 'redux';
import logger from 'redux-logger';
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import {
    withSentryReactRouterV6Routing,
    breadcrumbsIntegration,
    reactRouterV6BrowserTracingIntegration,
} from '@sentry/react';

import '@navikt/ds-css';
import '@navikt/ft-plattform-komponenter/dist/style.css';

import SendBrevIAvsluttetSak from './brevIAvsluttetSak/SendBrevIAvsluttetSak';
import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter from './containers/JournalpostRouter';
import SokIndex from './containers/sok/SokIndex';
import withEnvVariables from './containers/withAppSettings';
import { Locale } from './models/types';
import OpprettJournalpost from './opprett-journalpost/OpprettJournalpost';
import { rootReducer } from './state/RootState';
import { thunk } from './state/middleware';
import './styles/globalStyles.less';
import { getLocaleFromSessionStorage, setLocaleInSessionStorage } from './utils';
import JournalpostLoader from './containers/JournalpostLoader';
import { ROUTES } from './constants/routes';
import { logError } from './utils/logUtils';
import AuthCallback from './auth/AuthCallback';

const environment = window.location.hostname;

async function prepare() {
    if (window.location.hostname.includes('nav.no')) {
        if (window.nais?.app && window.nais?.telemetryCollectorURL) {
            initializeFaro({
                url: window.nais?.telemetryCollectorURL,
                app: window.nais?.app,
                instrumentations: [...getWebInstrumentations({ captureConsole: true }), new TracingInstrumentation()],
            });
        }
        Sentry.init({
            dsn: 'https://574f7b8c024448b9b4e36c58f4bb3161@sentry.gc.nav.no/105',
            release: process.env.SENTRY_RELEASE || 'unknown',
            environment,
            tracesSampleRate: 1.0,
            integrations: [
                breadcrumbsIntegration({ console: false }),
                reactRouterV6BrowserTracingIntegration({
                    useEffect: React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),
            ],
            beforeSend: (event) => event,
        });
    }
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
const SentryRoutes = withSentryReactRouterV6Routing(Routes);

export const App: React.FunctionComponent = () => {
    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);

    return (
        <Sentry.ErrorBoundary onError={logError}>
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
                        <SentryRoutes>
                            <Route
                                path={ROUTES.JOURNALPOST_ROOT}
                                element={<JournalpostLoader renderOnLoadComplete={() => <JournalpostRouter />} />}
                            />
                            <Route path={ROUTES.OPPRETT_JOURNALPOST} element={<OpprettJournalpost />} />
                            <Route path={ROUTES.BREV_AVSLUTTET_SAK} element={<SendBrevIAvsluttetSak />} />
                            <Route path={ROUTES.HOME} element={<SokIndex />} />
                            <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
                            <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
                        </SentryRoutes>
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
const AppWithEnvVariables = withEnvVariables(App);
prepare().then(() => {
    root.render(<AppWithEnvVariables />);
});

// @ts-ignore
if (window.Cypress) {
    // @ts-ignore
    window.__store__ = store;
}
