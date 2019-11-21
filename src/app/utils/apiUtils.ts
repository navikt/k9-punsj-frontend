import {ApiPath, URL_API} from 'app/apiConfig';
import {String}           from 'typescript-string-operations';

export const apiUrl = (path: ApiPath, parameters?: any) =>
    URL_API + (!!parameters ? String.Format(path, parameters) : path);

export function get(path: ApiPath, parameters?: any) {
    return fetch(apiUrl(path, parameters));
}