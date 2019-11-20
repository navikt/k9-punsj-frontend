import {getEnvironmentVariable} from "./utils";

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
export const URL_BACKEND = !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined' && OICD_AUTH_PROXY + '/api/k9-punsj';

export enum ApiPath {
    MAPPER_FIND     = '/pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND   = '/fagsak/{ident}?ytelse=pleiepenger_sykt_barn',
    JOURNALPOST     = '/journalpost/{journalpost_id}',
    DOKUMENT        = '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}