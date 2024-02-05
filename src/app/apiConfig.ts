import { getEnvironmentVariable } from 'app/utils/envUtils';

const OICD_AUTH_PROXY = () => getEnvironmentVariable('OIDC_AUTH_PROXY') as string;
const K9_PUNSJ_API_URL = () => getEnvironmentVariable('K9_PUNSJ_API_URL') as string;
const IS_OICD_AUTH_PROXY_SET = () => !!OICD_AUTH_PROXY() && OICD_AUTH_PROXY() !== 'undefined';
export const URL_BACKEND = () => {
    if (K9_PUNSJ_API_URL()) {
        return K9_PUNSJ_API_URL();
    }
    if (IS_OICD_AUTH_PROXY_SET()) {
        return OICD_AUTH_PROXY();
    }
    return 'http://localhost:8101';
};
export const URL_API = () => (K9_PUNSJ_API_URL() ? `${K9_PUNSJ_API_URL()}/api` : `${URL_BACKEND()}/api/k9-punsj`);

export enum ApiPath {
    ENV_VARIABLES = '/envVariables',
    EKSISTERENDE_SOKNADER_SOK = '/mapper',
    BARN_GET = '/barn',
    PSB_EKSISTERENDE_SOKNADER_FIND = '/pleiepenger-sykt-barn-soknad/mappe',
    PSB_SOKNAD_GET = '/pleiepenger-sykt-barn-soknad/mappe/{id}',
    PSB_SOKNAD_CREATE = '/pleiepenger-sykt-barn-soknad',
    PSB_SOKNAD_UPDATE = '/pleiepenger-sykt-barn-soknad/oppdater',
    PSB_SOKNAD_VALIDER = '/pleiepenger-sykt-barn-soknad/valider',
    PSB_SOKNAD_SUBMIT = '/pleiepenger-sykt-barn-soknad/send',
    JOURNALPOST_SETT_PAA_VENT = '/journalpost/vent/{journalpostId}',
    JOURNALPOST_HENT = '/journalpost/hent',
    JOURNALPOST_GET = '/journalpost/{journalpostId}',
    JOURNALPOST_MOTTAK = '/journalpost/mottak',
    JOURNALPOST_SETT_BEHANDLINGSÅR = '/journalpost/settBehandlingsAar/{journalpostId}',
    JOURNALPOST_LUKK_OPPGAVE = '/journalpost/lukk/{journalpostId}',
    JOURNALPOST_LUKK_DEBUGG = '/journalpost/lukkDebugg/{journalpostId}',
    JOURNALPOST_OMFORDEL = '/journalpost/{journalpostId}/omfordel',
    JOURNALPOST_USIGNERT = '/journalpost/{journalpostId}/usignert',
    JOURNALPOST_KOPIERE = '/journalpost/kopier/{journalpostId}',
    JOURNALPOST_FERDIGSTILL = '/journalpost/ferdigstill',
    DOKUMENT = '/journalpost/{journalpostId}/dokument/{dokumentId}',
    OMS_OVERFØR_DAGER = '/omsorgspenger-overfoer-dager-soknad',
    OPPRETT_GOSYS_OPPGAVE = '/gosys/opprettJournalforingsoppgave/',
    K9SAK_PERIODER = '/pleiepenger-sykt-barn-soknad/k9sak/info',
    GOSYS_GJELDER = '/gosys/gjelder',
    FINN_ARBEIDSGIVERE = '/arbeidsgivere',
    OMS_FINN_ARBEIDSFORHOLD = '/omsorgspenger-soknad/k9sak/arbeidsforholdIder',
    SØK_ORGNUMMER = '/arbeidsgiver',
    OMS_EKSISTERENDE_SOKNADER_FIND = '/omsorgspenger-soknad/mappe',
    OMS_MAPPE_SOK = '/k9-sak/omsorgspenger-soknad',
    OMS_SOKNAD_CREATE = '/omsorgspenger-soknad',
    OMS_SOKNAD_GET = '/omsorgspenger-soknad/mappe/{id}',
    OMS_SOKNAD_SUBMIT = '/omsorgspenger-soknad/send',
    OMS_SOKNAD_UPDATE = '/omsorgspenger-soknad/oppdater',
    OMS_SOKNAD_VALIDER = '/omsorgspenger-soknad/valider',
    OMP_KS_EKSISTERENDE_SOKNADER_FIND = '/omsorgspenger-kronisk-sykt-barn-soknad/mappe',
    OMP_KS_SOKNAD_GET = '/omsorgspenger-kronisk-sykt-barn-soknad/mappe/{id}',
    OMP_KS_SOKNAD_CREATE = '/omsorgspenger-kronisk-sykt-barn-soknad',
    OMP_KS_SOKNAD_UPDATE = '/omsorgspenger-kronisk-sykt-barn-soknad/oppdater',
    OMP_KS_SOKNAD_VALIDER = '/omsorgspenger-kronisk-sykt-barn-soknad/valider',
    OMP_KS_SOKNAD_SUBMIT = '/omsorgspenger-kronisk-sykt-barn-soknad/send',
    OMP_MA_EKSISTERENDE_SOKNADER_FIND = '/omsorgspenger-midlertidig-alene-soknad/mappe',
    OMP_MA_SOKNAD_GET = '/omsorgspenger-midlertidig-alene-soknad/mappe/{id}',
    OMP_MA_SOKNAD_CREATE = '/omsorgspenger-midlertidig-alene-soknad',
    OMP_MA_SOKNAD_UPDATE = '/omsorgspenger-midlertidig-alene-soknad/oppdater',
    OMP_MA_SOKNAD_VALIDER = '/omsorgspenger-midlertidig-alene-soknad/valider',
    OMP_MA_SOKNAD_SUBMIT = '/omsorgspenger-midlertidig-alene-soknad/send',
    OMP_AO_EKSISTERENDE_SOKNADER_FIND = '/omsorgspenger-alene-om-omsorgen-soknad/mappe',
    OMP_AO_SOKNAD_GET = '/omsorgspenger-alene-om-omsorgen-soknad/mappe/{id}',
    OMP_AO_SOKNAD_CREATE = '/omsorgspenger-alene-om-omsorgen-soknad',
    OMP_AO_SOKNAD_UPDATE = '/omsorgspenger-alene-om-omsorgen-soknad/oppdater',
    OMP_AO_SOKNAD_VALIDER = '/omsorgspenger-alene-om-omsorgen-soknad/valider',
    OMP_AO_SOKNAD_SUBMIT = '/omsorgspenger-alene-om-omsorgen-soknad/send',
    OMP_UT_EKSISTERENDE_SOKNADER_FIND = '/omsorgspengerutbetaling-soknad/mappe',
    OMP_UT_SOKNAD_GET = '/omsorgspengerutbetaling-soknad/mappe/{id}',
    OMP_UT_SOKNAD_CREATE = '/omsorgspengerutbetaling-soknad',
    OMP_UT_SOKNAD_UPDATE = '/omsorgspengerutbetaling-soknad/oppdater',
    OMP_UT_SOKNAD_VALIDER = '/omsorgspengerutbetaling-soknad/valider',
    OMP_UT_SOKNAD_SUBMIT = '/omsorgspengerutbetaling-soknad/send',
    OMP_UT_K9_PERIODER = '/omsorgspengerutbetaling-soknad/k9sak/info',
    BREV_BESTILL = '/brev/bestill',
    BREV_AKTØRID = '/brev/aktorId',
    PERSON = '/person',
    PLS_EKSISTERENDE_SOKNADER_FIND = '/pleiepenger-livets-sluttfase-soknad/mappe',
    PLS_SOKNAD_GET = '/pleiepenger-livets-sluttfase-soknad/mappe/{id}',
    PLS_SOKNAD_CREATE = '/pleiepenger-livets-sluttfase-soknad',
    PLS_SOKNAD_UPDATE = '/pleiepenger-livets-sluttfase-soknad/oppdater',
    PLS_SOKNAD_VALIDER = '/pleiepenger-livets-sluttfase-soknad/valider',
    PLS_SOKNAD_SUBMIT = '/pleiepenger-livets-sluttfase-soknad/send',
    PLS_K9SAK_PERIODER = '/pleiepenger-livets-sluttfase-soknad/k9sak/info',
    OPPRETT_NOTAT = '/notat/opprett',
    HENT_FAGSAK_PÅ_IDENT = '/saker/hent',
    OLP_EKSISTERENDE_SOKNADER_FIND = '/opplaeringspenger-soknad/mappe',
    OLP_SOKNAD_GET = '/opplaeringspenger-soknad/mappe/{id}',
    OLP_SOKNAD_CREATE = '/opplaeringspenger-soknad',
    OLP_SOKNAD_UPDATE = '/opplaeringspenger-soknad/oppdater',
    OLP_SOKNAD_VALIDER = '/opplaeringspenger-soknad/valider',
    OLP_SOKNAD_SUBMIT = '/opplaeringspenger-soknad/send',
    OLP_K9_PERIODER = '/opplaeringspenger-soknad/k9sak/info',
}

export const URL_AUTH_CHECK = () => `${URL_BACKEND()}/me`;
export const URL_AUTH_LOGIN = () =>
    K9_PUNSJ_API_URL() ? `/oauth2/login` : `${URL_BACKEND()}/oauth2/login/login?redirect_uri={uri}`;
