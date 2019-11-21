import {ApiPath, URL_API, URL_AUTH_LOGIN} from 'app/apiConfig';
import {String}                           from 'typescript-string-operations';

export const apiUrl = (path: ApiPath, parameters?: any) =>
    URL_API + (!!parameters ? String.Format(path, parameters) : path);

export function get(path: ApiPath, parameters?: any) {
    return fetch(apiUrl(path, parameters)).then(response => {
        if (response.status === 401) {
            login();
        }
        return response;
    });
}

export const loginUrl = () => String.Format(URL_AUTH_LOGIN, {uri: window.location.href});

export function login() {
    window.location.href = loginUrl();
}