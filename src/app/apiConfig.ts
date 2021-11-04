import { getEnvironmentVariable } from 'app/utils/envUtils';

const OICD_AUTH_PROXY = getEnvironmentVariable('OIDC_AUTH_PROXY');
const IS_OICD_AUTH_PROXY_SET: boolean = !!OICD_AUTH_PROXY && OICD_AUTH_PROXY !== 'undefined';
const URL_BACKEND = IS_OICD_AUTH_PROXY_SET ? OICD_AUTH_PROXY : 'http://localhost:8101';
export const URL_API = `${URL_BACKEND}/api/k9-punsj`;

export enum ApiPath {
    EKSISTERENDE_SOKNADER_SOK = '/mapper',
    PSB_EKSISTERENDE_SOKNADER_FIND = '/pleiepenger-sykt-barn-soknad/mappe',
    PSB_SOKNAD_GET = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
    BARN_GET = '/barn',
    PSB_SOKNAD_CREATE = '/pleiepenger-sykt-barn-soknad',
    PSB_SOKNAD_UPDATE = '/pleiepenger-sykt-barn-soknad/oppdater',
    PSB_SOKNAD_VALIDER = '/pleiepenger-sykt-barn-soknad/valider',
    PSB_SOKNAD_SUBMIT = '/pleiepenger-sykt-barn-soknad/send',
    PSB_FAGSAKER_FIND = '/fagsak/find?ytelse=pleiepenger-sykt-barn',
    SJEKK_OM_SKAL_TIL_K9SAK = '/journalpost/skaltilk9sak',
    JOURNALPOST_SETT_PAA_VENT = '/journalpost/vent/{journalpostId}',
    JOURNALPOST_HENT = '/journalpost/hent',
    JOURNALPOST_GET = '/journalpost/{journalpostId}',
    JOURNALPOST_LUKK_OPPGAVE = '/journalpost/lukk/{journalpostId}',
    JOURNALPOST_OMFORDEL = '/journalpost/{journalpostId}/omfordel',
    JOURNALPOST_USIGNERT = '/journalpost/{journalpostId}/usignert',
    JOURNALPOST_KOPIERE = '/journalpost/kopier/{journalpostId}',
    DOKUMENT = '/journalpost/{journalpostId}/dokument/{dokumentId}',
    OMS_OVERFØR_DAGER = '/omsorgspenger-overfoer-dager-soknad',
    OPPRETT_GOSYS_OPPGAVE = '/gosys/opprettJournalforingsoppgave/',
    PSB_MAPPE_SOK = '/k9-sak/pleiepenger-sykt-barn-soknad',
    K9SAK_PERIODER = '/pleiepenger-sykt-barn-soknad/k9sak/info',
    GOSYS_GJELDER = '/gosys/gjelder',
    FINN_ARBEIDSGIVERE = '/arbeidsgivere',
    SØK_ORGNUMMER = '/arbeidsgiver',
    OMS_EKSISTERENDE_SOKNADER_FIND = '/omsorgspenger-soknad/mappe',
    OMS_FAGSAKER_FIND = '/fagsak/find?ytelse=pleiepenger-sykt-barn',
    OMS_MAPPE_SOK = '/k9-sak/omsorgspenger-soknad',
    OMS_SOKNAD_CREATE = '/omsorgspenger-soknad',
    OMS_SOKNAD_GET = '/omsorgspenger-soknad/mappe/{id}',
    OMS_SOKNAD_SUBMIT = '/omsorgspenger-soknad/send',
    OMS_SOKNAD_UPDATE = '/omsorgspenger-soknad/oppdater',
    OMS_SOKNAD_VALIDER = '/omsorgspenger-soknad/valider',
}

export const URL_AUTH_CHECK = `${URL_BACKEND}/me`;
export const URL_AUTH_LOGIN = `${URL_BACKEND}/login?redirect_uri={uri}`;
