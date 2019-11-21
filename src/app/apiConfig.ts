import {getEnvironmentVariable} from './utils';

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
const IS_OICD_AUTH_PROXY_SET: boolean = !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined';
const URL_BACKEND = IS_OICD_AUTH_PROXY_SET ? OICD_AUTH_PROXY : 'http://localhost:8081';
export const URL_API = IS_OICD_AUTH_PROXY_SET ? URL_BACKEND + '/api/k9-punsj' : 'http://localhost:4000';

export enum ApiPath {
    MAPPER_FIND     = '/pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND   = '/fagsak/{ident}?ytelse=pleiepenger_sykt_barn',
    JOURNALPOST     = '/journalpost/{journalpost_id}',
    DOKUMENT        = '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}

export const URL_AUTH_CHECK = URL_BACKEND + '/me';
export const URL_AUTH_LOGIN = URL_BACKEND + '/login?redirect_uri=' + window.location.href;