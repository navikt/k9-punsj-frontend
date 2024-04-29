import { String } from 'typescript-string-operations';

import { IError } from 'app/models/types';
import { ROUTES } from 'app/constants/routes';

import { canStringBeParsedToJSON } from './formatUtils';
import { getEnvironmentVariable } from './envUtils';
import { logApiError } from './logUtils';

export const apiUrl = (path: string, parameters?: any) => (parameters ? String.Format(path, parameters) : path);

const login = (): Promise<void> =>
    new Promise((resolve) => {
        const openAuthWindow =
            getEnvironmentVariable('IS_LOCAL') !== 'true'
                ? () =>
                      window.open(
                          `${window.location.origin}/oauth2/login?redirectUrl=${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
                          undefined,
                          'height=600,width=800',
                      )
                : () =>
                      window.open(
                          `http://localhost:8101/login?redirect_uri=${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
                          undefined,
                          'height=600,width=800',
                      );
        const authWindow = openAuthWindow();
        // Listen for a message from the auth window
        window.addEventListener(
            'message',
            function handler(event) {
                if (event.data === 'authComplete') {
                    authWindow?.close();
                    window.removeEventListener('message', handler);
                    resolve();
                }
            },
            false,
        );
    });

async function retryOnAuthFailure(operation: () => Promise<Response>): Promise<Response> {
    const response = await operation();
    if (response.status === 401) {
        await login();
        return operation(); // Retry the operation
    }
    if (!response.ok) {
        logApiError(response);
    }
    return response;
}

export function get(
    path: string,
    parameters?: any,
    headers?: HeadersInit,
    callbackIfAuth?: (response: Response, responseData?: any) => Promise<Response> | void,
): Promise<Response> {
    return retryOnAuthFailure(async () => {
        const response = await fetch(apiUrl(path, parameters), {
            credentials: 'include',
            headers: new Headers(headers),
        });

        if (response.ok && callbackIfAuth) {
            const data = await response.text();
            const jsonData = data ? JSON.parse(data) : undefined;
            await callbackIfAuth(response, jsonData);
        }
        return response;
    });
}

export function post<BodyType>(
    path: string,
    parameters?: any,
    headers?: HeadersInit,
    body?: BodyType,
    callbackIfAuth?: (response: Response, responseData?: any) => Promise<Response> | void,
): Promise<Response> {
    return retryOnAuthFailure(async () => {
        const response = await fetch(apiUrl(path, parameters), {
            method: 'post',
            credentials: 'include',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers },
        });

        if (response.ok && callbackIfAuth) {
            const data = await response.text();
            const jsonData = data && canStringBeParsedToJSON(data) ? JSON.parse(data) : undefined;
            await callbackIfAuth(response, jsonData);
        }
        return response;
    });
}

export function put(
    path: string,
    parameters?: any,
    body?: any,
    callbackIfAuth?: (response: Response) => Promise<Response> | void,
): Promise<Response> {
    return retryOnAuthFailure(async () => {
        const response = await fetch(apiUrl(path, parameters), {
            method: 'put',
            credentials: 'include',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok && callbackIfAuth) {
            await callbackIfAuth(response);
        }
        return response;
    });
}

export function convertResponseToError(response: Partial<Response>): IError {
    const { status, statusText, url } = response;
    return { status, statusText, url };
}
