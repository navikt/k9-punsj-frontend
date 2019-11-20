import {getEnvironmentVariable} from './utils';

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
export const URL_BACKEND = !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined' && OICD_AUTH_PROXY + '/api/k9-punsj';

export enum ApiPath {
    MAPPER_FIND     = '/pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND   = '/fagsak/{ident}?ytelse=pleiepenger_sykt_barn',
    JOURNALPOST     = '/journalpost/{journalpost_id}',
    DOKUMENT        = '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}

const URL_AUTH = 'http://localhost:8081';
export const URL_AUTH_CHECK = URL_AUTH + '/me';
export const URL_AUTH_LOGIN = URL_AUTH + '/login?redirect_uri=' + window.location.href;