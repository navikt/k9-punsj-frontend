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
        erSøkerIdBekreftet: true,
        valgtGosysKategori: '',
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
        søkerId: '29099000129',
        pleietrengendeId: '',
        annenPart: '',
        annenSokerIdent: null,
    },
};
