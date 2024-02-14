import { String } from 'typescript-string-operations';

import { IError } from 'app/models/types';

import { canStringBeParsedToJSON } from './formatUtils';

export const apiUrl = (path: string, parameters?: any) => (parameters ? String.Format(path, parameters) : path);

export async function get(
    path: string,
    parameters?: any,
    headers?: HeadersInit,
    callbackIfAuth?: (response: Response, responseData?: any) => Promise<Response> | void,
): Promise<Response> {
    const response = await fetch(apiUrl(path, parameters), {
        credentials: 'include',
        headers: new Headers(headers),
    });
    if (callbackIfAuth) {
        const data = await response.text();
        const jsonData = data ? JSON.parse(data) : undefined;
        await callbackIfAuth(response, jsonData);
    }
    return response;
}

export async function post<BodyType>(
    path: string,
    parameters?: any,
    headers?: HeadersInit,
    body?: BodyType,
    callbackIfAuth?: (response: Response, responseData?: any) => Promise<Response> | void,
): Promise<Response> {
    try {
        const response = await fetch(apiUrl(path, parameters), {
            method: 'post',
            credentials: 'include',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers },
        });
        if (callbackIfAuth) {
            const data = await response.text();
            const jsonData = data && canStringBeParsedToJSON(data) ? JSON.parse(data) : undefined;
            await callbackIfAuth(response, jsonData);
        }
        return response;
    } catch (error) {
        return error;
    }
}

export async function put(
    path: string,
    parameters?: any,
    body?: any,
    callbackIfAuth?: (response: Response) => Promise<Response> | void,
): Promise<Response> {
    const response = await fetch(apiUrl(path, parameters), {
        method: 'put',
        credentials: 'include',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
    if (callbackIfAuth) {
        await callbackIfAuth(response);
    }
    return response;
}

export function convertResponseToError(response: Partial<Response>): IError {
    const { status, statusText, url } = response;
    return { status, statusText, url };
}
