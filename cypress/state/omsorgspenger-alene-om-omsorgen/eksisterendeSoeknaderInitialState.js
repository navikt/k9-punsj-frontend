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
            norskIdent: '29099000129',
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
                identitetsnummer: '02021477330',
            },
            {
                fornavn: 'Hallo',
                etternavn: 'Hansen',
                identitetsnummer: '03091477490',
            },
            {
                fornavn: 'Tom',
                etternavn: 'Tanks',
                identitetsnummer: '09081478047',
            },
        ],
        isAwaitingHentBarnResponse: false,
        hentBarnSuccess: true,
        harHentBarnResponse: true,
    },
    identState: {
        søkerId: '29099000129',
        pleietrengendeId: '02021477330',
        annenPart: '',
        annenSokerIdent: null,
    },
};
