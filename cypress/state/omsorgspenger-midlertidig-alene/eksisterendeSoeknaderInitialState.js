export const initialState = {
    PLEIEPENGER_SYKT_BARN: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
        },
        punchState: {
            step: 0,
            søkerId: '29099000129',
            pleietrengendeId: null,
        },
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    PLEIEPENGER_I_LIVETS_SLUTTFASE: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
        },
        punchState: {
            step: 0,
            søkerId: '29099000129',
            pleietrengendeId: null,
        },
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    OMSORGSPENGER_KRONISK_SYKT_BARN: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
        },
        punchState: {
            step: 0,
            søkerId: '29099000129',
            pleietrengendeId: null,
        },
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    OMSORGSPENGER_MIDLERTIDIG_ALENE: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
        },
        punchState: {
            step: 0,
            søkerId: '29099000129',
            pleietrengendeId: null,
        },
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    OMSORGSPENGER_UTBETALING: {
        signaturState: {
            signert: null,
            isAwaitingUsignertRequestResponse: false,
        },
    },
    OMSORGSPENGER_OVERFØRING: {
        signatur: {
            skjema: {
                identitetsnummer: '',
                signert: null,
                sammeIdentSomRegistrert: null,
            },
        },
        punch: {
            skjema: {
                norskIdent: null,
                arbeidssituasjon: {
                    erArbeidstaker: false,
                    erFrilanser: false,
                    erSelvstendigNæringsdrivende: false,
                    metaHarFeil: null,
                },
                borINorge: null,
                omsorgenDelesMed: {
                    norskIdent: '',
                    antallOverførteDager: 0,
                    mottaker: null,
                    samboerSiden: null,
                },
                aleneOmOmsorgen: null,
                barn: [
                    {
                        norskIdent: null,
                        fødselsdato: null,
                    },
                ],
                mottaksdato: null,
            },
            innsendingsstatus: 'IkkeSendtInn',
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
        sakstype: 'OMSORGSPENGER_MIDLERTIDIG_ALENE',
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingLukkOppgaveResponse: false,
        lukkOppgaveDone: false,
        erSøkerIdBekreftet: true,
        valgtGosysKategori: '',
        dokumenttype: 'OMSORGSPENGER_MA',
    },
    authState: {
        loggedIn: true,
        isLoading: false,
        userName: 'Gizmo The Cat',
    },
    felles: {
        dedupKey: '01H026FTAHKCX8ADAB5F9CKJ7H',
        journalpost: {
            journalpostId: '205',
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
            gosysoppgaveId: null,
        },
        isJournalpostLoading: false,
    },
    journalposterPerIdentState: {
        journalposter: [],
        isJournalposterLoading: false,
    },
    identState: {
        søkerId: '29099000129',
        pleietrengendeId: '',
        annenPart: '07827599802',
        annenSokerIdent: null,
    },
    opprettIGosys: {
        isAwaitingGosysOppgaveRequestResponse: false,
    },
    eksisterendeSoknaderState: {
        eksisterendeSoknaderSvar: {},
        isEksisterendeSoknaderLoading: false,
        isSoknadCreated: false,
        isAwaitingSoknadCreation: false,
    },
    fordelingSettPåVentState: {},
    fordelingFerdigstillJournalpostState: {},
    eksisterendePLSSoknaderState: {
        eksisterendeSoknaderSvar: {},
        isEksisterendeSoknaderLoading: false,
        isSoknadCreated: false,
        isAwaitingSoknadCreation: false,
    },
    eksisterendeOMPKSSoknaderState: {
        eksisterendeSoknaderSvar: {},
        isEksisterendeSoknaderLoading: false,
        isSoknadCreated: false,
        isAwaitingSoknadCreation: false,
    },
    eksisterendeOMPMASoknaderState: {
        eksisterendeSoknaderSvar: {
            søker: '29099000129',
            fagsakTypeKode: 'OMP_MA',
            søknader: [],
        },
        isEksisterendeSoknaderLoading: false,
        isSoknadCreated: false,
        isAwaitingSoknadCreation: false,
    },
};
