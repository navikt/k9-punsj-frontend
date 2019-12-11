import {getEnvironmentVariable} from './utils';

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
const IS_OICD_AUTH_PROXY_SET: boolean = !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined';
const URL_BACKEND = IS_OICD_AUTH_PROXY_SET ? OICD_AUTH_PROXY : 'http://localhost:8081';
export const URL_API = URL_BACKEND + '/api/k9-punsj';
// export const URL_API = IS_OICD_AUTH_PROXY_SET ? URL_BACKEND + '/api/k9-punsj' : 'http://localhost:5000'; // 'http://localhost:7081/api';

export enum ApiPath {
    MAPPER_FIND             = '/pleiepenger-sykt-barn-soknad/mapper',
    MAPPE_GET               = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
    MAPPE_CREATE            = '/pleiepenger-sykt-barn-soknad',
    MAPPE_UPDATE            = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
    MAPPE_SUBMIT            = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
    FAGSAKER_FIND           = '/fagsak/{ident}?ytelse=pleiepenger-sykt-barn',
    JOURNALPOST_GET         = '/journalpost/{journalpost_id}',
    JOURNALPOST_OMFORDEL    = '/journalpost/{journalpost_id}/omfordel',
    DOKUMENT                = '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}

export const URL_AUTH_CHECK = URL_BACKEND + '/me';
export const URL_AUTH_LOGIN = URL_BACKEND + '/login?redirect_uri={uri}';