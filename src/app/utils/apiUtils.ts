import { String } from 'typescript-string-operations';

import { IError } from 'app/models/types';

export const apiUrl = (path: string | string, parameters?: any) =>
    parameters ? String.Format(path, parameters) : path;

export async function get(path: string, parameters?: any, headers?: HeadersInit): Promise<Response> {
    const response = await fetch(apiUrl(path, parameters), {
        credentials: 'include',
        headers: new Headers(headers),
    });
    return response;
}

export async function post<BodyType>(
    path: string,
    parameters?: any,
    headers?: HeadersInit,
    body?: BodyType,
): Promise<Response> {
    try {
        const response = await fetch(apiUrl(path, parameters), {
            method: 'post',
            credentials: 'include',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers },
        });

        return response;
    } catch (error) {
        return error;
    }
}

export async function put(path: string, parameters?: any, body?: any): Promise<Response> {
    const response = await fetch(apiUrl(path, parameters), {
        method: 'put',
        credentials: 'include',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
    return response;
}

export function convertResponseToError(response: Partial<Response>): IError {
    const { status, statusText, url } = response;
    return { status, statusText, url };
}
