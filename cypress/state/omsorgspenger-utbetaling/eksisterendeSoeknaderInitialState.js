export const initialState = {
    OMSORGSPENGER_UTBETALING: {
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    fordelingState: {
        sakstype: 'OMSORGSPENGER_UTBETALING',
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingSjekkTilK9Response: false,
        isAwaitingLukkOppgaveResponse: false,
        lukkOppgaveDone: false,
        skalTilK9: true,
        erIdent1Bekreftet: true,
        valgtGosysKategori: '',
        kanIkkeGaaTilK9: [],
    },
    authState: {
        loggedIn: true,
        isLoading: false,
        userName: 'Bobby Binders',
    },
    felles: {
        dedupKey: '01GEEK0M0Y7NJS26KZBMQ5NCXN',
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
    },
    identState: {
        ident1: '29099000129',
        ident2: '',
        annenPart: '',
        annenSokerIdent: null,
    },
};
