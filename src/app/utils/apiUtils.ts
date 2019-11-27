import {ApiPath, URL_API, URL_AUTH_LOGIN} from 'app/apiConfig';
import {String}                           from 'typescript-string-operations';

export const apiUrl = (path: ApiPath, parameters?: any) =>
    URL_API + (!!parameters ? String.Format(path, parameters) : path);

export async function get(
    path: ApiPath,
    parameters?: any,
    callbackIfAuth?: (response: Response) => Promise<Response>
): Promise<Response> {
    const response = await fetch(apiUrl(path, parameters), {credentials: 'include'});
    if (response.status === 401) {
        login();
    } else if (!!callbackIfAuth) {
        await callbackIfAuth(response);
    }
    return response;
}

export const loginUrl = () => String.Format(URL_AUTH_LOGIN, {uri: encodeURIComponent(window.location.href)});

export function login() {
    window.location.href = loginUrl();
}