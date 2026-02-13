import { String } from 'typescript-string-operations';

import { ApiProblemDetail, IError } from 'app/models/types';
import { ROUTES } from 'app/constants/routes';

import { canStringBeParsedToJSON } from './formatUtils';
import { getEnvironmentVariable } from './envUtils';
import { logApiError } from './logUtils';

// Denne funksjonen brukes for å formattere path parametere i path
// apiUrl(ApiPath.DOKUMENT, { journalpostId: '123', dokumentId: '456' })
// /journalpost/{journalpostId}/dokument/{dokumentId} vil returnere:
// /journalpost/123/dokument/456
export const apiUrl = (path: string, pathParameters?: any) =>
    pathParameters ? String.format(path, pathParameters) : path;

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

        if (!response.ok && response.status === 401) {
            return response;
        }

        if (!response.ok) {
            logApiError(response);
        }

        if (callbackIfAuth) {
            const data = await response.text();
            const jsonData = data && canStringBeParsedToJSON(data) ? JSON.parse(data) : undefined;
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
        if (!response.ok && response.status === 401) {
            return response;
        }

        if (!response.ok) {
            logApiError(response);
        }
        if (callbackIfAuth) {
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

        if (!response.ok && response.status === 401) {
            return response;
        }

        if (!response.ok) {
            logApiError(response);
        }

        if (callbackIfAuth) {
            await callbackIfAuth(response);
        }
        return response;
    });
}

// TODO Depricate
export function convertResponseToError(response: Partial<Response>): IError {
    const { status, statusText, url } = response;
    return { status, statusText, url };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const normalizeText = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
};

/**
 * Safely narrows unknown response data to a ProblemDetail like object.
 *
 * @param data response body from API
 * @returns ProblemDetail when body is object shaped, otherwise undefined
 */
export const parseProblemDetail = (data: unknown): ApiProblemDetail | undefined => {
    if (!isRecord(data)) return undefined;
    return data as ApiProblemDetail;
};

const getProblemDetailValue = (problemDetail: ApiProblemDetail | undefined, key: string): unknown => {
    if (!problemDetail) return undefined;
    const topLevelValue = problemDetail[key];
    if (topLevelValue !== undefined) return topLevelValue;

    if (isRecord(problemDetail.properties)) {
        return problemDetail.properties[key];
    }

    return undefined;
};

/**
 * Reads array property from ProblemDetail.
 * Supports both top level fields and `properties` fields.
 *
 * @param problemDetail parsed ProblemDetail
 * @param key property name to read
 * @returns array value for the key or empty array
 */
export const getProblemDetailArrayProperty = <T = unknown>(
    problemDetail: ApiProblemDetail | undefined,
    key: string,
): T[] => {
    const value = getProblemDetailValue(problemDetail, key);
    return Array.isArray(value) ? (value as T[]) : [];
};

/**
 * Extracts validation error list from ProblemDetail.
 * Reads `feil` from top level or from `properties.feil`.
 *
 * @param responseData raw API response body
 * @returns validation errors, empty array when missing
 */
export const getValidationErrorsFromProblemDetail = <T = unknown>(responseData?: unknown): T[] => {
    const problemDetail = parseProblemDetail(responseData);
    return getProblemDetailArrayProperty<T>(problemDetail, 'feil');
};

/**
 * Converts ProblemDetail response to internal `IError` shape for store usage.
 *
 * @param response fetch response metadata
 * @param responseData raw API response body
 * @returns normalized error payload
 */
export function convertProblemDetailToError(response: Partial<Response>, responseData?: unknown): IError {
    const { status, statusText, url } = response;

    const problemDetail = parseProblemDetail(responseData);
    const message =
        normalizeText(problemDetail?.detail) ||
        normalizeText(problemDetail?.title) ||
        statusText ||
        'Ukjent feil';

    const problemType = normalizeText(problemDetail?.type);

    return {
        status,
        statusText,
        url,
        message,
        feil: problemType,
        raw: responseData,
    };
}
