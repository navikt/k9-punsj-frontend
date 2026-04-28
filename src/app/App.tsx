import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import {
    breadcrumbsIntegration,
    reactRouterV6BrowserTracingIntegration,
    withSentryReactRouterV6Routing,
} from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
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
import logger from 'redux-logger';
import AuthCallback from './auth/AuthCallback';
import ApplicationWrapper from './components/application-wrapper/ApplicationWrapper';
import { ROUTES } from './constants/routes';
import JournalpostLoader from './containers/JournalpostLoader';
import JournalpostRouter from './containers/JournalpostRouter';
import withEnvVariables from './containers/withAppSettings';
import { Home } from './home/Home';
import { Locale } from './models/types';
import OpprettJournalpost from './opprett-journalpost/OpprettJournalpost';
import SendBrevIAvsluttetSak from './send-brev-i-avsluttetSak/SendBrevIAvsluttetSak';
import { rootReducer } from './state/RootState';
import { getLocaleFromSessionStorage } from './utils';
import { logError } from './utils/logUtils';

import '@navikt/ds-css';
import './styles/globals.css';

const environment = window.location.hostname;

const waitForNaisConfig = async (): Promise<void> => {
    const naisReady = window.__naisReady;

    if (naisReady) {
        await naisReady;
    }
};

const prepare = async () => {
    if (window.location.hostname.includes('nav.no')) {
        await waitForNaisConfig();

        if (window.nais?.app && window.nais?.telemetryCollectorURL) {
            initializeFaro({
                url: window.nais?.telemetryCollectorURL,
                app: {
                    ...window.nais.app,
                    version: process.env.SENTRY_RELEASE || 'local',
                },
                instrumentations: [
                    ...getWebInstrumentations({ captureConsole: true }),
                    new TracingInstrumentation({
                        instrumentationOptions: {
                            propagateTraceHeaderCorsUrls: [/https:\/\/[^/]+\.nav\.no\/.*/],
                        },
                    }),
                ],
                beforeSend: (item) => {
                    // Strip query parametere fra URL for å unngå PII-lekkasjer (fnr, tokens m.m.)
                    if (item.meta?.page?.url) {
                        try {
                            const url = new URL(item.meta.page.url);
                            url.search = '';
                            item.meta.page.url = url.toString();
                        } catch {
                            /* ignore */
                        }
                    }
                    return item;
                },
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
        try {
            const { worker } = await import('../mocks/browser');

            await worker.start({
                onUnhandledRequest: 'bypass',
                serviceWorker: {
                    url: '/mockServiceWorker.js',
                    options: {
                        scope: '/',
                    },
                },
            });
            return worker;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('MSW initialization failed:', error);
        }
    }
    return Promise.resolve();
};

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        const defaultMiddleware = getDefaultMiddleware();
        return process.env.NODE_ENV !== 'production' ? defaultMiddleware.concat(logger) : defaultMiddleware;
    },
    // @ts-ignore
    preloadedState: window.Cypress ? window.__initialState__ : undefined,
    devTools: process.env.NODE_ENV !== 'production',
});

const localeFromSessionStorage = getLocaleFromSessionStorage();

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
    queries: {
        refetchOnWindowFocus: false,
    },
});
const SentryRoutes = withSentryReactRouterV6Routing(Routes);

export const App: React.FC = () => {
    const [locale] = React.useState<Locale>(localeFromSessionStorage);

    return (
        <Sentry.ErrorBoundary onError={logError}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ApplicationWrapper locale={locale}>
                        <SentryRoutes>
                            <Route
                                path={ROUTES.JOURNALPOST_ROOT}
                                element={<JournalpostLoader renderOnLoadComplete={() => <JournalpostRouter />} />}
                            />
                            <Route path={ROUTES.OPPRETT_JOURNALPOST} element={<OpprettJournalpost />} />
                            <Route path={ROUTES.BREV_AVSLUTTET_SAK} element={<SendBrevIAvsluttetSak />} />
                            <Route path={ROUTES.HOME} element={<Home />} />
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
