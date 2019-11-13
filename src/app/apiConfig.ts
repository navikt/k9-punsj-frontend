import {String} from 'typescript-string-operations';

let URL_BACKEND = 'http://localhost:8080/api/';

export enum ApiPath {
    MAPPER_FIND = 'pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND = 'fagsak/{ident}?ytelse=pleiepenger_sykt_barn'
}
const useMockData = true;

if (useMockData) {
    URL_BACKEND = 'http://localhost:4000/';
}

const apiUrl = (path: ApiPath, parameters?: any) => URL_BACKEND + String.Format(path, parameters);

export function get(path: ApiPath, parameters?: any) {
    return fetch(apiUrl(path, parameters));
}