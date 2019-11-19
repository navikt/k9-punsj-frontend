import {ApiPath, URL_BACKEND} from "app/apiConfig";
import {String} from "typescript-string-operations";


export const apiUrl = (path: ApiPath, parameters?: any) => URL_BACKEND + String.Format(path, parameters);

export function get(path: ApiPath, parameters?: any) {
    return fetch(apiUrl(path, parameters));
}