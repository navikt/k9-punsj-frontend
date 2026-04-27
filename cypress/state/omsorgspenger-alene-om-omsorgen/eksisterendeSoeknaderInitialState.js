export const initialState = {
    fordelingState: {
        sakstype: 'OMSORGSPENGER_ALENE_OM_OMSORGEN',
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingLukkOppgaveResponse: false,
        lukkOppgaveDone: false,
        erSøkerIdBekreftet: true,
        valgtGosysKategori: '',
        dokumenttype: 'OMSORGSPENGER_AO',
    },
    authState: {
        loggedIn: true,
        isLoading: false,
        userName: 'Bobby Binders',
    },
    felles: {
        dedupKey: '01H3EMPK7QGQDGQ5SEV33Q362D',
        journalpost: {
            journalpostId: '200',
            norskIdent: '17420373147',
            dokumenter: [
                {
                    dokumentId: '470164680',
                },
                {
                    dokumentId: '470164681',
                },
            ],
            venter: null,
            punsjInnsendingType: null,
            kanSendeInn: true,
            erSaksbehandler: true,
            journalpostStatus: 'MOTTATT',
            kanOpprettesJournalføringsoppgave: true,
            kanKopieres: true,
        },
        isJournalpostLoading: false,
        barn: [
            {
                fornavn: 'Geir-Paco',
                etternavn: 'Gundersen',
                identitetsnummer: '24420167209',
            },
            {
                fornavn: 'Hallo',
                etternavn: 'Hansen',
                identitetsnummer: '18410162721',
            },
            {
                fornavn: 'Tom',
                etternavn: 'Tanks',
                identitetsnummer: '24420167209',
            },
        ],
        isAwaitingHentBarnResponse: false,
        hentBarnSuccess: true,
        harHentBarnResponse: true,
    },
    identState: {
        søkerId: '17420373147',
        pleietrengendeId: '24420167209',
        annenPart: '',
        annenSokerIdent: null,
    },
};
