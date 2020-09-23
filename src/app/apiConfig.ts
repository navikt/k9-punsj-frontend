import { getEnvironmentVariable } from 'app/utils/envUtils';

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
const IS_OICD_AUTH_PROXY_SET: boolean =
  !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined';
const URL_BACKEND = IS_OICD_AUTH_PROXY_SET
  ? OICD_AUTH_PROXY
  : 'http://localhost:8081';
export const URL_API = URL_BACKEND + '/api/k9-punsj';

export enum ApiPath {
  MAPPER_FIND = '/pleiepenger-sykt-barn-soknad/mapper',
  MAPPE_GET = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
  MAPPE_CREATE = '/pleiepenger-sykt-barn-soknad',
  MAPPE_UPDATE = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
  MAPPE_SUBMIT = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
  FAGSAKER_FIND = '/fagsak/{ident}?ytelse=pleiepenger-sykt-barn',
  JOURNALPOST_GET = '/journalpost/{journalpostId}',
  JOURNALPOST_OMFORDEL = '/journalpost/{journalpostId}/omfordel',
  JOURNALPOST_USIGNERT = '/journalpost/{journalpostId}/usignert',
  DOKUMENT = '/journalpost/{journalpostId}/dokument/{dokumentId}',
  OMS_OVERFØR_DAGER = '/omsorgspenger-overfoer-dager-soknad',
}

export const URL_AUTH_CHECK = URL_BACKEND + '/me';
export const URL_AUTH_LOGIN = URL_BACKEND + '/login?redirect_uri={uri}';
