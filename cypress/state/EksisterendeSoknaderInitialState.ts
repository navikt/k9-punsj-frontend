const EksisterendeSoknaderInitialState = {
    PLEIEPENGER_SYKT_BARN: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
        },
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },

    OMSORGSPENGER_FORDELING: {
        opprettIGosys: {
            isAwaitingGosysOppgaveRequestResponse: false,
        },
    },
    SØK: {
        soknaderSokState: {
            soknadSvar: [],
            isSoknaderLoading: false,
        },
        visningState: {
            step: 0,
            ident: '',
        },
    },
    fordelingState: {
        dokumenttype: 'PLEIEPENGER',
        sakstype: 'PLEIEPENGER_SYKT_BARN',
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
        dedupKey: '01FMAT4RR8K7A7C0PSPBDKM566',
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
        isAwaitingHentBarnResponse: false,
        barn: [],
        hentBarnSuccess: true,
    },
    journalposterPerIdentState: {
        journalposter: [],
        isJournalposterLoading: false,
    },
    identState: {
        søkerId: '29099000129',
        pleietrengendeId: '16017725002',
        barn: [],
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

export default EksisterendeSoknaderInitialState;
