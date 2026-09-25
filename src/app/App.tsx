import { init, pushEvent } from '@nais/apm';
import { ApmErrorBoundary } from '@nais/apm/react';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router';
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
import { filterTelemetry, routeTemplate } from './utils/telemetryPrivacy';

import '@navikt/ds-css';
import './styles/globals.css';

const RouteTelemetry = () => {
    const { pathname } = useLocation();
    React.useEffect(() => {
        const route = routeTemplate(pathname);
        if (route && window.nais?.telemetryCollectorURL) {
            pushEvent('punsj_route_change', { route });
        }
    }, [pathname]);
    return null;
};

const waitForNaisConfig = async (): Promise<void> => {
    const naisReady = window.__naisReady;

    if (naisReady) {
        await naisReady;
    }
};

const prepare = async () => {
    if (window.location.hostname.includes('nav.no')) {
        await waitForNaisConfig();

        if (window.nais?.app?.name && window.nais?.telemetryCollectorURL) {
            init({
                app: window.nais.app.name,
                namespace: 'k9saksbehandling',
                telemetryUrl: window.nais.telemetryCollectorURL,
                version: process.env.APP_VERSION || window.nais.app.version || 'unknown',
                environment: window.location.hostname,
                beforeSend: filterTelemetry,
                tracing: false,
            });
        }
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
export const App: React.FC = () => {
    const [locale] = React.useState<Locale>(localeFromSessionStorage);

    return (
        <ApmErrorBoundary>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ApplicationWrapper locale={locale}>
                        <RouteTelemetry />
                        <Routes>
                            <Route
                                path={ROUTES.JOURNALPOST_ROOT}
                                element={<JournalpostLoader renderOnLoadComplete={() => <JournalpostRouter />} />}
                            />
                            <Route path={ROUTES.OPPRETT_JOURNALPOST} element={<OpprettJournalpost />} />
                            <Route path={ROUTES.BREV_AVSLUTTET_SAK} element={<SendBrevIAvsluttetSak />} />
                            <Route path={ROUTES.HOME} element={<Home />} />
                            <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
                            <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
                        </Routes>
                    </ApplicationWrapper>
                </QueryClientProvider>
            </Provider>
        </ApmErrorBoundary>
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
