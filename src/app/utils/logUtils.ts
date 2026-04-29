import { faro } from '@grafana/faro-web-sdk';

export async function logApiError(response: Response) {
    if (!response.ok && response.status !== 401) {
        // eslint-disable-next-line no-console
        console.error(`Error: ${response.status} for URL: ${response.url} with error`);
    }
}

export function logError(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error);

    // Rapporter React render-feil til Faro. Sentry.ErrorBoundary fanger feilen
    // før window.onerror, så Faros ErrorsInstrumentation får den ikke automatisk.
    try {
        faro?.api?.pushError(error instanceof Error ? error : new Error(String(error)));
    } catch {
        /* ignore — faro kan være uinitialisert (localhost, tester) */
    }
}
