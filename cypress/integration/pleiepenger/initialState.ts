const initialState = {
    fordelingState: {
        sakstype: 'PLEIEPENGER_SYKT_BARN',
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingSjekkTilK9Response: false,
        isAwaitingLukkOppgaveResponse: false,
        lukkOppgaveDone: false,
        skalTilK9: true,
        erIdent1Bekreftet: true,
        valgtGosysKategori: '',
    },
    authState: {
        loggedIn: true,
        isLoading: false,
        userName: 'Bobby Binders',
    },
    felles: {
        dedupKey: '01FMAT4RR8K7A7C0PSPBDKM566',
        journalpost: {
            journalpostId: '201',
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
        isAwaitingHentBarnResponse: false,
        barn: [],
        hentBarnSuccess: true,
    },
    journalposterPerIdentState: {
        journalposter: [],
        isJournalposterLoading: false,
    },
    identState: {
        ident1: '29099000129',
        ident2: '13079438906',
        annenSokerIdent: null,
    },
    opprettIGosys: {
        isAwaitingGosysOppgaveRequestResponse: false,
    },
    eksisterendeSoknaderState: {
        eksisterendeSoknaderSvar: {},
        isEksisterendeSoknaderLoading: true,
        isSoknadCreated: false,
        isAwaitingSoknadCreation: false,
    },
};

export default initialState;
