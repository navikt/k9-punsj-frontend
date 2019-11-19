import {getEnvironmentVariable} from "./utils";

export const URL_BACKEND = getEnvironmentVariable('OIDC_AUTH_PROXY') + '/api';

export enum ApiPath {
    MAPPER_FIND     = '/pleiepenger-sykt-barn-soknad/mapper/{ident}',
    FAGSAKER_FIND   = '/fagsak/{ident}?ytelse=pleiepenger_sykt_barn',
    JOURNALPOST     = '/journalpost/{journalpost_id}',
    DOKUMENT        = '/journalpost/{journalpost_id}/dokument/{dokument_id}'
}