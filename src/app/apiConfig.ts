import {String} from 'typescript-string-operations';

const URL_BACKEND = process.env.OIDC_AUTH_PROXY + '/api/k9-punsj';

export enum ApiPath {
    MAPPER_FIND =   '/pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND = '/fagsak/{ident}?ytelse=pleiepenger_sykt_barn',
    JOURNALPOST =   '/journalpost/{journalpost_id}',
    DOKUMENT =      '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}

export const apiUrl = (path: ApiPath, parameters?: any) => URL_BACKEND + String.Format(path, parameters);

export function get(path: ApiPath, parameters?: any) {
    return fetch(apiUrl(path, parameters));
}