export const PleiepengerPunsjInitialState = {
    PLEIEPENGER_SYKT_BARN: {
        punchFormState: {
            isSoknadLoading: false,
            isComplete: false,
            isValid: false,
            awaitingSettPaaVentResponse: false,
            isPerioderLoading: false,
            perioder: [],
            soknad: {
                soeknadId: '3be63d45-a543-4314-b6bf-9c68ab8e9838',
                soekerId: '29099000129',
                journalposter: ['200'],
                mottattDato: '2020-10-12',
                klokkeslett: '12:53',
                barn: {
                    norskIdent: '16017725002',
                    foedselsdato: null,
                },
                soeknadsperiode: null,
                opptjeningAktivitet: null,
                arbeidstid: null,
                beredskap: null,
                nattevaak: null,
                tilsynsordning: null,
                uttak: null,
                omsorg: null,
                bosteder: null,
                lovbestemtFerie: null,
                lovbestemtFerieSomSkalSlettes: null,
                soknadsinfo: null,
                utenlandsopphold: null,
                harInfoSomIkkeKanPunsjes: false,
                harMedisinskeOpplysninger: false,
                trekkKravPerioder: [],
                begrunnelseForInnsending: null,
            },
        },
        punchState: {
            step: 1,
            søkerId: '29099000129',
            pleietrengendeId: '16017725002',
        },
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
            step: 1,
            ident: '',
        },
    },
    fordelingState: {
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
        userName: 'Gizmo The Cat',
    },
    felles: {
        dedupKey: '01FMCYSMNFKNKMVX53Y3XQ35ZE',
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
};
