import { captureException } from '@nais/apm';
import { apiRouteTemplate } from './telemetryPrivacy';

export async function logApiError(response: Response, method: 'GET' | 'POST' | 'PUT') {
    if (
        !response.ok &&
        response.status !== 401 &&
        Number.isInteger(response.status) &&
        response.status >= 400 &&
        response.status <= 599
    ) {
        const route = apiRouteTemplate(response.url);
        captureException(new Error(`HTTP ${response.status}`), {
            context: { method, ...(route ? { route } : {}) },
        });
    }
}
