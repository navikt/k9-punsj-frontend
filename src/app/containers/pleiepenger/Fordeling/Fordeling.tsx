import React, { useEffect, useState } from 'react';

import { Alert, Button, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Dispatch } from 'redux';

import { finnFagsaker } from 'app/api/api';
import { ROUTES } from 'app/constants/routes';
import { DokumenttypeForkortelse, FordelingDokumenttype, JaNei, dokumenttyperForPsbOmsOlp } from 'app/models/enums';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    setErSøkerIdBekreftetAction,
} from 'app/state/actions';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';

import FormPanel from '../../../components/FormPanel';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { setDokumenttypeAction, setFagsakAction } from '../../../state/actions/FordelingActions';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../../../state/actions/GosysOppgaveActions';
import { resetIdentState, setAnnenPartAction, setIdentFellesAction } from '../../../state/actions/IdentActions';
import { resetBarnAction } from '../../../state/reducers/FellesReducer';
import {
    finnForkortelseForDokumenttype,
    getDokumenttypeFraForkortelse,
    getPathFraDokumenttype,
    getPathFraForkortelse,
} from '../../../utils';

import AnnenPart from './Komponenter/AnnenPart';
import DokumentTypeVelger from './Komponenter/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import JournalpostAlleredeBehandlet from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import KlassifiserModal from './Komponenter/KlassifiserModal';
import KopiereJournalpostTilSammeSøker from './Komponenter/KopiereJournalpostTilSammeSøker/KopiereJournalpostTilSammeSøker';
import Pleietrengende from './Komponenter/Pleietrengende';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgAvBehandlingsÅr from './Komponenter/ValgAvBehandlingsÅr';
import VentLukkBrevModal from './Komponenter/VentLukkBrevModal';
import FagsakSelect from './FagsakSelect';
import HåndterInntektsmeldingUtenKrav from '../HåndterInntektsmeldingUtenKrav';
import { OkGaaTilLosModal } from '../OkGaaTilLosModal';
import {
    isDokumenttypeMedBehandlingsår,
    isDokumenttypeMedBehandlingsårValg,
    isDokumenttypeMedPleietrengende,
    isFagsakMedValgtBehandlingsår,
    isJournalførKnapperDisabled,
    isRedirectVidereDisabled,
    isSakstypeMedPleietrengende,
} from './fordelingUtils';

import './fordeling.less';

// TODO Flytte til felles sted?
// TODO Sjekke alle useEffect

const Fordeling: React.FC = () => {
    const navigate = useNavigate();

    const dispatch = useDispatch<Dispatch<any>>();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost as IJournalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);
    const opprettIGosysState = useSelector((state: RootStateType) => state.opprettIGosys);

    const omfordel = (journalpostid: string, norskIdent: string, gosysKategori: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent, gosysKategori));
    const resetBarn = () => dispatch(resetBarnAction());
    const setDokumenttype = (dokumenttype?: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype));
    const setFagsak = (fagsak?: Fagsak) => dispatch(setFagsakAction(fagsak));
    const setIdentAction = (søkerId: string, pleietrengendeId?: string | null, annenSokerIdent?: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent));
    const lukkJournalpostOppgave = (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak));
    const resetOmfordelAction = () => dispatch(opprettGosysOppgaveResetAction());
    const lukkOppgaveReset = () => dispatch(lukkOppgaveResetAction());
    const resetIdentStateAction = () => dispatch(resetIdentState());
    const setAnnenPart = (annenPart: string) => dispatch(setAnnenPartAction(annenPart));
    const setErSøkerIdBekreftet = (erBekreftet: boolean) => dispatch(setErSøkerIdBekreftetAction(erBekreftet));

    const [visKlassifiserModal, setVisKlassifiserModal] = useState(false);
    const [fortsettEtterKlassifiseringModal, setFortsettEtterKlassifiseringModal] = useState(false);
    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [visGaaTilLos, setVisGaaTilLos] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [valgtFagsakLokal, setValgtFagsakLokal] = useState<FagsakForSelect | undefined>(undefined);
    const [fagsaker, setFagsaker] = useState<FagsakForSelect[]>([]);
    const [reserverSaksnummerTilNyFagsak, setReserverSaksnummerTilNyFagsak] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const [disableRadios, setDisableRadios] = useState<boolean | undefined>(undefined);
    const [barnMedFagsak, setBarnMedFagsak] = useState<FagsakForSelect | undefined>(undefined);
    const [ingenInfoOmPleitrengende, setIngenInfoOmPleitrengende] = useState<boolean>(false);
    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);
    const [åpenBrevModal, setÅpenBrevModal] = useState(false);

    const harFagsaker = fagsaker?.length > 0;

    const { fagsak, dokumenttype, isAwaitingLukkOppgaveResponse, lukkOppgaveDone } = fordelingState;
    const { dedupKey } = fellesState;

    const {
        journalpostId,
        erFerdigstilt,
        norskIdent,
        sak,
        kanOpprettesJournalføringsoppgave,
        punsjInnsendingType,
        kanSendeInn,
        erSaksbehandler,
    } = journalpost;

    const dokumenttypeMedPleietrengende = isDokumenttypeMedPleietrengende(dokumenttype);
    const dokumenttypeMedBehandlingsårValg = isDokumenttypeMedBehandlingsårValg(dokumenttype);
    const dokumenttypeMedBehandlingsår = isDokumenttypeMedBehandlingsår(dokumenttype);
    const dokumenttypeMedAnnenPart = dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA;

    const sakstypeMedPleietrengende = isSakstypeMedPleietrengende(sak?.sakstype);

    const fagsakMedValgtBehandlingsår = isFagsakMedValgtBehandlingsår(
        fagsaker,
        dokumenttypeMedBehandlingsårValg,
        reserverSaksnummerTilNyFagsak,
        behandlingsAar,
    );

    const jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende =
        !erFerdigstilt && !!sak?.fagsakId && !!norskIdent && !(!sakstypeMedPleietrengende || !!sak.pleietrengendeIdent);

    const jpErFerdigstiltOgUtenPleietrengende =
        erFerdigstilt && !!sak?.fagsakId && !!norskIdent && !(!sakstypeMedPleietrengende || !!sak.pleietrengendeIdent);

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visFagsakSelect =
        gjelderPsbOmsOlp && harFagsaker && identState.søkerId.length === 11 && !jpErFerdigstiltOgUtenPleietrengende;

    const visPleietrengendeComponent =
        gjelderPsbOmsOlp &&
        !isFetchingFagsaker &&
        (reserverSaksnummerTilNyFagsak ||
            jpErFerdigstiltOgUtenPleietrengende ||
            jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende) &&
        !ingenInfoOmPleitrengende;

    const visPleietrengende =
        visSokersBarn && dokumenttypeMedPleietrengende && !IdentRules.erUgyldigIdent(identState.søkerId);

    // Sjekk ang fagsak?.reservert && !fagsak?.gyldigPeriode
    const visValgAvBehandlingsaar =
        dokumenttypeMedBehandlingsårValg &&
        identState.søkerId.length === 11 &&
        (reserverSaksnummerTilNyFagsak || (fagsak?.reservert && !fagsak?.behandlingsår)) &&
        !erFerdigstilt;

    const erInntektsmeldingUtenKrav = punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const toSøkereIngenAnnenSøker =
        !erFerdigstilt && toSokereIJournalpost && identState.søkerId && !identState.annenSokerIdent;

    const toSøkereIngenPleietrengende =
        !erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        dokumenttypeMedPleietrengende &&
        !identState.pleietrengendeId;

    const toSøkereIngenBehandlingÅr =
        !erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        dokumenttypeMedBehandlingsårValg &&
        !behandlingsAar;

    const toSøkereIngenAnnenPartMA =
        !erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        dokumenttypeMedAnnenPart &&
        !identState.annenPart;

    const journalførKnapperDisabled = isJournalførKnapperDisabled(
        journalpost,
        identState,
        ingenInfoOmPleitrengende,
        barnetHarIkkeFnr,
        toSokereIJournalpost,
        harFagsaker,
        reserverSaksnummerTilNyFagsak,
        dokumenttypeMedPleietrengende,
        dokumenttypeMedBehandlingsårValg,
        dokumenttypeMedAnnenPart,
        fagsakMedValgtBehandlingsår,
        fagsak,
        behandlingsAar,
        barnMedFagsak,
    );

    const redirectVidereDisabled = isRedirectVidereDisabled(identState, dokumenttypeMedPleietrengende, barnMedFagsak);

    /**
     * Sette fordelingState når side åpnes hvis journalpost er ikke ferdistilt men har sakstype som støttes
     */
    useEffect(() => {
        if (!erFerdigstilt) {
            if (sak?.sakstype) {
                if (sak?.sakstype === DokumenttypeForkortelse.OMP) {
                    setDokumenttype(FordelingDokumenttype.OMSORGSPENGER);
                } else {
                    const dokumenttypeFraForkortelse = getDokumenttypeFraForkortelse(sak?.sakstype);

                    if (dokumenttypeFraForkortelse) {
                        setDokumenttype(dokumenttypeFraForkortelse);
                    }
                }
            }

            /**
             * Dette håndterer feil tilfeller når saksbehandler prøvde å journalføre journalposten. Reservert saksnummer opprettet, men det sjedde feil under journalføring.
             * Men ikke sikker at dette er riktig løsning. Kanskje det trenges å vise en annen feilmelding.
             */
            if (sak?.behandlingsår) {
                setBehandlingsAar(sak.behandlingsår);
            }

            if (sak?.fagsakId) {
                setIdentAction(norskIdent!, sak.pleietrengendeIdent);

                if (sak?.sakstype === DokumenttypeForkortelse.OMP_MA && sak.relatertPersonIdent) {
                    setAnnenPart(sak.relatertPersonIdent);
                }

                setErSøkerIdBekreftet(true);
                setRiktigIdentIJournalposten(JaNei.JA);
                setFagsak(sak);
                setDisableRadios(true);

                if (jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende) {
                    setVisSokersBarn(true);
                }
            }
        }
    }, []);

    // Redirect til ferdigstilt side hvis journalpost er ferdigstilt eller/og reservert sak og fagsak ytelse type er satt og pleietrengende ident er satt (hvis det trenges)
    useEffect(() => {
        if (
            erFerdigstilt &&
            !!sak?.sakstype &&
            kanSendeInn &&
            erSaksbehandler &&
            !!norskIdent &&
            (!sakstypeMedPleietrengende || !!sak.pleietrengendeIdent)
        ) {
            const fagsakYtelsePath = getPathFraForkortelse(sak?.sakstype);

            // Ved feil. kanskje det trenges ikke fordi det kan ikke være ferdigstilt journalpost med reservert saksnummer med Annet sakstype
            if (!fagsakYtelsePath && sak?.sakstype !== DokumenttypeForkortelse.OMP) {
                setDokumenttype(FordelingDokumenttype.ANNET);
                setDisableRadios(true);
                setSokersIdent(norskIdent);
                setIdentAction(norskIdent, identState.pleietrengendeId);
                return;
            }

            // Sakstype på korrigering og omp_ut er samme i ferdistilt journalpost, derfor bruker trenger å velge dokumenttype igjen
            if (sak?.sakstype === DokumenttypeForkortelse.OMP) {
                setDokumenttype(FordelingDokumenttype.OMSORGSPENGER);
                setFagsak(sak);
                setIdentAction(norskIdent);
                setErSøkerIdBekreftet(true);
                setRiktigIdentIJournalposten(JaNei.JA);
                setDisableRadios(true);
                setBehandlingsAar(sak.behandlingsår);
                return;
            }

            // Set fordeling state ved ferdistilt (journalført) sak
            setDokumenttype(getDokumenttypeFraForkortelse(sak?.sakstype));
            setErSøkerIdBekreftet(true);
            setIdentAction(norskIdent, sak?.pleietrengendeIdent);
            setAnnenPart(sak?.relatertPersonIdent || '');
            setFagsak(sak);

            // Redirect to ferdigstilt side
            navigate(`${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpostId)}/${fagsakYtelsePath}`);
        }
    }, []);

    /**
     * Fylle opp fordeling state ved ferdigstilt journalpost med reservert saksnummer.
     *
     * Brukes kun for å velge barn/pleietrengende ident. Barn/pleietrengende indent oppdateres ikke i journalposten.
     * Den kun legges til i fordeling state og til ny søknad. Pleitrengende ident oppdateres i journalposten etter innsending av søknad.
     */

    useEffect(() => {
        if (jpErFerdigstiltOgUtenPleietrengende) {
            const dokumenttypeFraForkortelse = getDokumenttypeFraForkortelse(sak?.sakstype);

            // Ved feil
            if (!dokumenttypeFraForkortelse) {
                return;
            }

            setDisableRadios(true);
            setDokumenttype(getDokumenttypeFraForkortelse(sak?.sakstype));
            setRiktigIdentIJournalposten(JaNei.JA);
            setErSøkerIdBekreftet(true);
            setIdentAction(norskIdent);
            setVisSokersBarn(true);
            // TODO
            setFagsak(sak);
        }
    }, []);

    /**
     * Reset fagsak ved endring av dokumenttype eller søkerId når journalpost ikke er ferdigstilt
     * TODO: create function for this and use it in handleDokumenttype and handleSøkerIdChange
     */
    useEffect(() => {
        if (!erFerdigstilt && !sak?.fagsakId && fagsak) {
            setFagsak(undefined);
            setReserverSaksnummerTilNyFagsak(false);
            setIngenInfoOmPleitrengende(false);
            if (fagsak.sakstype === DokumenttypeForkortelse.OMP_MA) {
                setAnnenPart('');
            }
        }
    }, [dokumenttype, identState.søkerId]);

    // TODO TESTE DETTTE - det ser ut er bug her
    useEffect(() => {
        if (reserverSaksnummerTilNyFagsak && fagsaker) {
            setBarnMedFagsak(fagsaker.find((f) => f.pleietrengende?.identitetsnummer === identState.pleietrengendeId));
        }
        if (!reserverSaksnummerTilNyFagsak) {
            setBarnMedFagsak(undefined);
        }
    }, [identState.pleietrengendeId]);

    useEffect(() => {
        if (opprettIGosysState.gosysOppgaveRequestSuccess) {
            setVisGaaTilLos(true);
        }
    }, [fellesState.isAwaitingKopierJournalPostResponse, opprettIGosysState.gosysOppgaveRequestSuccess]);

    // Henter fagsaker ved endring av søkerId, dokumenttype eller gjelderPsbOmsOlp
    // Hvis det er ingen fagsaker, viser vi pleietrengende component
    useEffect(() => {
        if (
            (!erFerdigstilt || jpErFerdigstiltOgUtenPleietrengende) &&
            !sak?.fagsakId &&
            identState.søkerId &&
            dokumenttype &&
            gjelderPsbOmsOlp
        ) {
            setHenteFagsakFeilet(false);
            setIsFetchingFagsaker(true);
            setFagsak(undefined);
            finnFagsaker(identState.søkerId, (response, data: FagsakForSelect[]) => {
                setIsFetchingFagsaker(false);
                if (response.status === 200) {
                    const dokumenttypeForkortelse = finnForkortelseForDokumenttype(dokumenttype);
                    const filtrerteFagsaker = data.filter(
                        (fsak) => !dokumenttypeForkortelse || fsak.sakstype === dokumenttypeForkortelse,
                    );
                    setFagsaker(filtrerteFagsaker);
                    if (filtrerteFagsaker.length === 0 && !jpErFerdigstiltOgUtenPleietrengende) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                    if (filtrerteFagsaker.length === 0 && dokumenttypeMedAnnenPart) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

    const handleSøkerIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ident = event.target.value.replace(/\D+/, '');

        if (identState.søkerId.length > 0 && ident.length < sokersIdent.length) {
            setIdentAction('', identState.pleietrengendeId, identState.annenSokerIdent);
            setErSøkerIdBekreftet(false);
            setVisSokersBarn(false);
        }

        if (ident.length === 11) {
            setIdentAction(ident, identState.pleietrengendeId, identState.annenSokerIdent);
            setErSøkerIdBekreftet(true);
            setVisSokersBarn(true);
        }
        setSokersIdent(ident);
    };

    const handleSøkerIdBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIdentAction(event.target.value, identState.pleietrengendeId);
        setErSøkerIdBekreftet(true);
        setVisSokersBarn(true);
    };

    // Redirect bruker til fortsett side hvis journalpost er klassifisert, med reservert saksnummer uten fagsak ytelse type
    // Dette er ikke nødvendig hvis vi henter fagsak ytelse type fra api ved reservert saksnummer
    // i dette tilfellet må bruker velge pleietrengende igjen!!! Men hva hvis bruker har valgt pleietrengende og har reservert saksnummer?
    const handleRedirectVidere = () => {
        if (dokumenttype) {
            if (!fagsak) {
                setFagsak(sak);
            }
            const pathFraDokumenttype = getPathFraDokumenttype(dokumenttype);

            if (pathFraDokumenttype) {
                navigate(
                    `${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpostId)}/${pathFraDokumenttype}`,
                );
            }
        }
    };

    const handleDokumenttype = (type: FordelingDokumenttype) => {
        if (type === FordelingDokumenttype.ANNET) {
            if (!identState.søkerId && !!norskIdent) {
                setSokersIdent(norskIdent); // lokal useState
                setIdentAction(norskIdent, identState.pleietrengendeId); // Redux
            } else {
                setSokersIdent(identState.søkerId); // lokal useState
            }
        } else {
            setSokersIdent(''); // lokal useState
        }

        if (!erFerdigstilt && !sak?.fagsakId) {
            setRiktigIdentIJournalposten(undefined); // lokal useState
            setReserverSaksnummerTilNyFagsak(false); // lokal useState
            setBehandlingsAar(undefined); // lokal useState
            setToSokereIJournalpost(false); // lokal useState
            resetBarn(); // Redux felles state liste med barn
            resetIdentStateAction(); // Reset kun annenSøkerIdent, pleitrengendeId og annenPart
        }

        setDokumenttype(type); // Redux state
    };

    const setValgtFagsak = (fagsakId: string) => {
        const selectedFagsak = fagsaker.find((f) => f.fagsakId === fagsakId);

        setIdentAction(
            identState.søkerId,
            selectedFagsak?.pleietrengende?.identitetsnummer || '',
            identState.annenSokerIdent,
        );

        // Set fagsak for å vise fagsak info
        setValgtFagsakLokal(selectedFagsak);

        // Dette brukes for å sette pleietrengende ident og relatertPerson i fagsak state fordi data struktur er forskjellig i fagsak og journalpost.sak
        // Kanskje det trenges å endre data struktur i journalpost.sak i backend
        const nyValgtFagsakMedPleietrengendeIdent = selectedFagsak
            ? ({
                  ...selectedFagsak,
                  pleietrengendeIdent: selectedFagsak?.pleietrengende?.identitetsnummer,
                  relatertPersonIdent: selectedFagsak?.relatertPerson?.identitetsnummer,
                  relatertPerson: undefined,
                  pleietrengende: undefined,
              } as Fagsak)
            : undefined;

        // Brukes i felles state
        setFagsak(nyValgtFagsakMedPleietrengendeIdent);

        if (
            selectedFagsak?.sakstype === DokumenttypeForkortelse.OMP_MA &&
            selectedFagsak.relatertPerson?.identitetsnummer
        ) {
            setAnnenPart(selectedFagsak.relatertPerson.identitetsnummer);
        }

        if (dokumenttypeMedBehandlingsår) {
            setBehandlingsAar(selectedFagsak ? selectedFagsak.behandlingsår : undefined);
        }
    };

    if (opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <Loader size="large" />;
    }

    if (opprettIGosysState.gosysOppgaveRequestSuccess && visGaaTilLos) {
        return (
            <Modal
                key="opprettigosysokmodal"
                onClose={() => {
                    resetOmfordelAction();
                    setVisGaaTilLos(false);
                }}
                aria-label="settpaaventokmodal"
                open={!!opprettIGosysState.gosysOppgaveRequestSuccess}
                data-test-id="opprettIGosysOkModal"
            >
                <OkGaaTilLosModal melding="fordeling.opprettigosys.utfort" />
            </Modal>
        );
    }

    if (isAwaitingLukkOppgaveResponse) {
        return <Loader size="large" />;
    }

    if (lukkOppgaveDone) {
        return (
            <Modal
                key="lukkoppgaveokmodal"
                onClose={() => {
                    lukkOppgaveReset();
                }}
                aria-label="settpaaventokmodal"
                open={lukkOppgaveDone}
            >
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    return (
        <div className="fordeling-container">
            {kanSendeInn && erSaksbehandler && (
                <FormPanel>
                    {erInntektsmeldingUtenKrav && (
                        <>
                            <VerticalSpacer thirtyTwoPx />
                            <Heading level="1" size="medium">
                                <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.tittel" />
                            </Heading>
                            <VerticalSpacer twentyPx />
                        </>
                    )}

                    <div className="fordeling-page">
                        {jpErFerdigstiltOgUtenPleietrengende && (
                            <Alert size="small" variant="info" className="mb-5">
                                <FormattedMessage id="fordeling.infobox.jpErFerdigstiltOgUtenPleietrengende" />
                            </Alert>
                        )}
                        {!!opprettIGosysState.gosysOppgaveRequestError && (
                            <Alert size="small" variant="error" className="mb-5" data-test-id="opprettIGosysFeil">
                                <FormattedMessage id="fordeling.omfordeling.feil" />
                            </Alert>
                        )}
                        {erInntektsmeldingUtenKrav && (
                            <>
                                <Alert size="small" variant="warning" className="fordeling-alertstripeFeil">
                                    <ul className="punkliste">
                                        <li>
                                            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.infoboks.punkt.1" />
                                        </li>
                                        <li>
                                            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.infoboks.punkt.2" />
                                        </li>
                                        <li>
                                            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.infoboks.punkt.3" />
                                        </li>
                                        <li>
                                            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.infoboks.punkt.4" />
                                        </li>
                                    </ul>
                                </Alert>
                                <VerticalSpacer thirtyTwoPx />
                            </>
                        )}
                        <div>
                            {!erInntektsmeldingUtenKrav && (
                                <DokumentTypeVelger
                                    handleDokumenttype={(type: FordelingDokumenttype) => {
                                        handleDokumenttype(type);
                                    }}
                                    valgtDokumentType={dokumenttype as string}
                                    disableRadios={disableRadios}
                                />
                            )}
                            {dokumenttype === FordelingDokumenttype.ANNET && (
                                <InnholdForDokumenttypeAnnet
                                    journalpost={journalpost}
                                    lukkJournalpostOppgave={lukkJournalpostOppgave}
                                    kanJournalforingsoppgaveOpprettesiGosys={!!kanOpprettesJournalføringsoppgave}
                                    handleSøkerIdBlur={handleSøkerIdBlur}
                                    handleSøkerIdChange={handleSøkerIdChange}
                                    sokersIdent={sokersIdent}
                                    identState={identState}
                                    fordelingState={fordelingState}
                                    omfordel={omfordel}
                                />
                            )}
                            {(erInntektsmeldingUtenKrav || dokumenttype !== FordelingDokumenttype.OMSORGSPENGER) && (
                                <SokersIdent
                                    dokumenttype={dokumenttype}
                                    journalpost={journalpost}
                                    handleSøkerIdChange={handleSøkerIdChange}
                                    sokersIdent={sokersIdent}
                                    identState={identState}
                                    setVisSokersBarn={setVisSokersBarn}
                                    setSokersIdent={setSokersIdent}
                                    setIdentAction={setIdentAction}
                                    setErSøkerIdBekreftet={setErSøkerIdBekreftet}
                                    riktigIdentIJournalposten={riktigIdentIJournalposten}
                                    setRiktigIdentIJournalposten={setRiktigIdentIJournalposten}
                                    erInntektsmeldingUtenKrav={erInntektsmeldingUtenKrav}
                                    disableRadios={disableRadios}
                                />
                            )}

                            <ToSoekere
                                journalpost={journalpost}
                                identState={identState}
                                toSokereIJournalpost={toSokereIJournalpost}
                                setIdentAction={setIdentAction}
                                setToSokereIJournalpost={setToSokereIJournalpost}
                                dokumenttype={dokumenttype}
                                disabled={disableRadios}
                            />

                            {erInntektsmeldingUtenKrav && identState.søkerId ? (
                                <HåndterInntektsmeldingUtenKrav
                                    søkerId={identState.søkerId}
                                    journalpost={journalpost}
                                />
                            ) : (
                                <VerticalSpacer twentyPx />
                            )}

                            {visFagsakSelect && (
                                <FagsakSelect
                                    reserverSaksnummerTilNyFagsak={reserverSaksnummerTilNyFagsak}
                                    fagsaker={fagsaker}
                                    identState={identState}
                                    ingenInfoOmBarnIDokument={ingenInfoOmPleitrengende}
                                    setReserverSaksnummerTilNyFagsak={setReserverSaksnummerTilNyFagsak}
                                    setIdentAction={setIdentAction}
                                    setValgtFagsak={setValgtFagsak}
                                    valgtFagsak={valgtFagsakLokal}
                                    setBehandlingsAar={setBehandlingsAar}
                                    setAnnenPart={setAnnenPart}
                                />
                            )}

                            <div className="mt-5 mb-5">
                                <AnnenPart
                                    identState={identState}
                                    showComponent={
                                        dokumenttypeMedAnnenPart &&
                                        (reserverSaksnummerTilNyFagsak || (!!fagsak && !fagsak.relatertPersonIdent))
                                    }
                                    setAnnenPart={setAnnenPart}
                                />
                            </div>
                            {visValgAvBehandlingsaar && (
                                <ValgAvBehandlingsÅr behandlingsAar={behandlingsAar} onChange={setBehandlingsAar} />
                            )}
                            {henteFagsakFeilet && (
                                <ErrorMessage>
                                    <FormattedMessage id="fordeling.error.henteFagsakFeilet" />
                                </ErrorMessage>
                            )}
                            {isFetchingFagsaker && <Loader />}
                            {visPleietrengendeComponent && (
                                <Pleietrengende
                                    toSokereIJournalpost={toSokereIJournalpost}
                                    pleietrengendeHarIkkeFnrFn={(harBarnetFnr: boolean) =>
                                        setBarnetHarIkkeFnr(harBarnetFnr)
                                    }
                                    visPleietrengende={visPleietrengende}
                                    jpErFerdigstiltOgUtenPleietrengende={jpErFerdigstiltOgUtenPleietrengende}
                                    skalHenteBarn={
                                        dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE
                                    }
                                />
                            )}
                            {!!barnMedFagsak && !erFerdigstilt && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="pleietrengendeHarFagsak"
                                >
                                    <FormattedMessage
                                        id="fordeling.error.pleietrengendeHarFagsak"
                                        values={{
                                            pleietrengendeId: barnMedFagsak.pleietrengende?.identitetsnummer,
                                            fagsakId: barnMedFagsak.fagsakId,
                                        }}
                                    />
                                </Alert>
                            )}

                            {toSøkereIngenAnnenSøker && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenAnnenSøker"
                                >
                                    <FormattedMessage id="fordeling.alert.toSøkere.ingenAnnenSøker" />
                                </Alert>
                            )}

                            {toSøkereIngenPleietrengende && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenPleietrengende"
                                >
                                    <FormattedMessage id="fordeling.alert.toSøkere.ingenPleietrengende" />
                                </Alert>
                            )}

                            {toSøkereIngenBehandlingÅr && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenBehandlingÅr"
                                >
                                    <FormattedMessage id="fordeling.alert.toSøkere.ingenBehandlingÅr" />
                                </Alert>
                            )}

                            {toSøkereIngenAnnenPartMA && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenAnnenPartMA"
                                >
                                    <FormattedMessage id="fordeling.alert.toSøkere.ingenAnnenPartMA" />
                                </Alert>
                            )}

                            {!!barnMedFagsak && erFerdigstilt && (
                                <>
                                    {!fellesState.kopierJournalpostSuccess && (
                                        <Alert size="small" variant="warning">
                                            <FormattedMessage
                                                id="fordeling.error.pleietrengendeHarFerdistiltFagsak"
                                                values={{
                                                    pleietrengendeId: barnMedFagsak.pleietrengende?.identitetsnummer,
                                                    fagsakId: barnMedFagsak.fagsakId,
                                                }}
                                            />
                                        </Alert>
                                    )}

                                    <div className="md-5">
                                        <KopiereJournalpostTilSammeSøker barnMedFagsak={barnMedFagsak} />
                                    </div>
                                </>
                            )}
                            {!erFerdigstilt &&
                                !fagsak &&
                                !journalførKnapperDisabled &&
                                (identState.pleietrengendeId ||
                                    dokumenttypeMedBehandlingsårValg ||
                                    dokumenttypeMedAnnenPart) && (
                                    <Alert
                                        size="small"
                                        variant="info"
                                        className="mb-4"
                                        data-test-id="jornalførUtenFagsak"
                                    >
                                        <FormattedMessage id="fordeling.infobox.jornalførUtenFagsak" />
                                    </Alert>
                                )}

                            {fagsakMedValgtBehandlingsår && (
                                <Alert
                                    size="small"
                                    variant="info"
                                    className="mb-4"
                                    data-test-id="alertFagsakMedValgtBehandlingsår"
                                >
                                    <FormattedMessage id="fordeling.infobox.alertFagsakMedValgtBehandlingsår" />
                                </Alert>
                            )}

                            {gjelderPsbOmsOlp && !isFetchingFagsaker && !erFerdigstilt && (
                                <div className="flex">
                                    <div className="mr-4">
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => {
                                                setFortsettEtterKlassifiseringModal(true);
                                                setVisKlassifiserModal(true);
                                            }}
                                            disabled={journalførKnapperDisabled || redirectVidereDisabled}
                                            data-test-id="journalførOgFortsett"
                                        >
                                            <FormattedMessage id="fordeling.knapp.journalfør.fortsett" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => {
                                            setFortsettEtterKlassifiseringModal(false);
                                            setVisKlassifiserModal(true);
                                        }}
                                        disabled={journalførKnapperDisabled}
                                        data-test-id="journalførOgVent"
                                    >
                                        <FormattedMessage id="fordeling.knapp.journalfør.vent" />
                                    </Button>
                                </div>
                            )}

                            {gjelderPsbOmsOlp && !isFetchingFagsaker && erFerdigstilt && !barnMedFagsak && (
                                <div className="flex">
                                    <div className="mr-4">
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={handleRedirectVidere}
                                            disabled={redirectVidereDisabled}
                                        >
                                            <FormattedMessage id="fordeling.knapp.ferdistiltJpReservertSaksnummer.fortsett" />
                                        </Button>
                                    </div>

                                    {sakstypeMedPleietrengende && (
                                        <Button size="small" variant="secondary" onClick={() => setÅpenBrevModal(true)}>
                                            <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.btn" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {visKlassifiserModal && (
                            <KlassifiserModal
                                dedupkey={dedupKey}
                                toSøkere={toSokereIJournalpost}
                                fortsett={fortsettEtterKlassifiseringModal}
                                behandlingsAar={behandlingsAar}
                                lukkModal={() => setVisKlassifiserModal(false)}
                                setFagsak={(s: Fagsak) => setFagsak(s)}
                            />
                        )}

                        {!!sak?.fagsakId && !!dokumenttype && (
                            <VentLukkBrevModal open={åpenBrevModal} onClose={() => setÅpenBrevModal(false)} />
                        )}

                        <VerticalSpacer sixteenPx />
                    </div>
                </FormPanel>
            )}

            {!kanSendeInn && !!erSaksbehandler && (
                <FormPanel>
                    <div className="fordeling-page">
                        <JournalpostAlleredeBehandlet />
                    </div>
                </FormPanel>
            )}

            {!erSaksbehandler && (
                <div>
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="fordeling.ikkesaksbehandler" />
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default Fordeling;
