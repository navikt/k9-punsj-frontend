const BASE_PATHS = {
    K9_PUNSJ: '/api/k9-punsj',
    K9_FORMIDLING: '/api/k9-formidling',
};

export const ApiPath = {
    // generelt
    ME: `/me`,
    ENV_VARIABLES: `/envVariables`,
    LOGIN: `/oauth2/login`,

    // punsj backend
    EKSISTERENDE_SOKNADER_SOK: `${BASE_PATHS.K9_PUNSJ}/mapper`,
    BARN_GET: `${BASE_PATHS.K9_PUNSJ}/barn`,
    PSB_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/mappe`,
    PSB_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/mappe/{id}`,
    PSB_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad`,
    PSB_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/oppdater`,
    PSB_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/valider`,
    PSB_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/send`,
    JOURNALPOST_SETT_PAA_VENT: `${BASE_PATHS.K9_PUNSJ}/journalpost/vent/{journalpostId}`,
    JOURNALPOST_HENT: `${BASE_PATHS.K9_PUNSJ}/journalpost/hent`,
    JOURNALPOST_GET: `${BASE_PATHS.K9_PUNSJ}/journalpost/{journalpostId}`,
    JOURNALPOST_MOTTAK: `${BASE_PATHS.K9_PUNSJ}/journalpost/mottak`,
    JOURNALPOST_SETT_BEHANDLINGSÅR: `${BASE_PATHS.K9_PUNSJ}/journalpost/settBehandlingsAar/{journalpostId}`,
    JOURNALPOST_LUKK_OPPGAVE: `${BASE_PATHS.K9_PUNSJ}/journalpost/lukk/{journalpostId}`,
    JOURNALPOST_LUKK_DEBUGG: `${BASE_PATHS.K9_PUNSJ}/journalpost/lukkDebugg/{journalpostId}`,
    JOURNALPOST_OMFORDEL: `${BASE_PATHS.K9_PUNSJ}/journalpost/{journalpostId}/omfordel`,
    JOURNALPOST_USIGNERT: `${BASE_PATHS.K9_PUNSJ}/journalpost/{journalpostId}/usignert`,
    JOURNALPOST_KOPIERE: `${BASE_PATHS.K9_PUNSJ}/journalpost/kopier/{journalpostId}`,
    JOURNALPOST_FERDIGSTILL: `${BASE_PATHS.K9_PUNSJ}/journalpost/ferdigstill`,
    DOKUMENT: `${BASE_PATHS.K9_PUNSJ}/journalpost/{journalpostId}/dokument/{dokumentId}`,
    OMS_OVERFØR_DAGER: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-overfoer-dager-soknad`,
    OPPRETT_GOSYS_OPPGAVE: `${BASE_PATHS.K9_PUNSJ}/gosys/opprettJournalforingsoppgave/`,
    PSB_K9SAK_PERIODER: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-sykt-barn-soknad/k9sak/info`,
    GOSYS_GJELDER: `${BASE_PATHS.K9_PUNSJ}/gosys/gjelder`,
    FINN_ARBEIDSGIVERE: `${BASE_PATHS.K9_PUNSJ}/arbeidsgivere`,
    FINN_ARBEIDSGIVERE_HISTORIKK: `${BASE_PATHS.K9_PUNSJ}/arbeidsgivere-historikk`,
    OMS_FINN_ARBEIDSFORHOLD: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/k9sak/arbeidsforholdIder`,
    SØK_ORGNUMMER: `${BASE_PATHS.K9_PUNSJ}/arbeidsgiver`,
    OMS_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/mappe`,
    OMS_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad`,
    OMS_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/mappe/{id}`,
    OMS_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/send`,
    OMS_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/oppdater`,
    OMS_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-soknad/valider`,
    OMP_KS_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad/mappe`,
    OMP_KS_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad/mappe/{id}`,
    OMP_KS_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad`,
    OMP_KS_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad/oppdater`,
    OMP_KS_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad/valider`,
    OMP_KS_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-kronisk-sykt-barn-soknad/send`,
    OMP_MA_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad/mappe`,
    OMP_MA_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad/mappe/{id}`,
    OMP_MA_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad`,
    OMP_MA_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad/oppdater`,
    OMP_MA_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad/valider`,
    OMP_MA_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-midlertidig-alene-soknad/send`,
    OMP_AO_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad/mappe`,
    OMP_AO_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad/mappe/{id}`,
    OMP_AO_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad`,
    OMP_AO_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad/oppdater`,
    OMP_AO_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad/valider`,
    OMP_AO_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/omsorgspenger-alene-om-omsorgen-soknad/send`,
    OMP_UT_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/mappe`,
    OMP_UT_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/mappe/{id}`,
    OMP_UT_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad`,
    OMP_UT_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/oppdater`,
    OMP_UT_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/valider`,
    OMP_UT_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/send`,
    OMP_UT_K9_PERIODER: `${BASE_PATHS.K9_PUNSJ}/omsorgspengerutbetaling-soknad/k9sak/info`,
    PERSON: `${BASE_PATHS.K9_PUNSJ}/person`,
    PLS_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/mappe`,
    PLS_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/mappe/{id}`,
    PLS_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad`,
    PLS_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/oppdater`,
    PLS_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/valider`,
    PLS_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/send`,
    PLS_K9SAK_PERIODER: `${BASE_PATHS.K9_PUNSJ}/pleiepenger-livets-sluttfase-soknad/k9sak/info`,
    OPPRETT_NOTAT: `${BASE_PATHS.K9_PUNSJ}/notat/opprett`,
    HENT_FAGSAK_PÅ_IDENT: `${BASE_PATHS.K9_PUNSJ}/saker/hent`,
    OLP_EKSISTERENDE_SOKNADER_FIND: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/mappe`,
    OLP_SOKNAD_GET: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/mappe/{id}`,
    OLP_SOKNAD_CREATE: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad`,
    OLP_SOKNAD_UPDATE: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/oppdater`,
    OLP_SOKNAD_VALIDER: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/valider`,
    OLP_SOKNAD_SUBMIT: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/send`,
    OLP_K9_PERIODER: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/k9sak/info`,
    OLP_INSTITUSJONER: `${BASE_PATHS.K9_PUNSJ}/opplaeringspenger-soknad/institusjoner`,
    BREV_AKTØRID: `${BASE_PATHS.K9_PUNSJ}/brev/aktorId`,
    BREV_BESTILL: `${BASE_PATHS.K9_PUNSJ}/brev/bestill`,

    // Formidling backend
    BREV_MALER: `${BASE_PATHS.K9_FORMIDLING}/brev/maler`,
    BREV_FORHAANDSVIS: `${BASE_PATHS.K9_FORMIDLING}/brev/forhaandsvis`,
};
