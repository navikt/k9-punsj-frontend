import React, { useEffect, useState } from 'react';

import { Alert, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { finnFagsaker } from 'app/api/api';
import { DokumenttypeForkortelse, FordelingDokumenttype, JaNei, dokumenttyperForPsbOmsOlp } from 'app/models/enums';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    setErSøkerIdBekreftetAction,
} from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';
import { ROUTES } from 'app/constants/routes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import FormPanel from '../components/FormPanel';
import VerticalSpacer from '../components/VerticalSpacer';
import { IGosysOppgaveState } from '../models/types/GosysOppgaveState';
import { IIdentState } from '../models/types/IdentState';
import { setDokumenttypeAction, setFagsakAction } from '../state/actions/FordelingActions';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../state/actions/GosysOppgaveActions';
import { resetIdentState, setAnnenPartAction, setIdentFellesAction } from '../state/actions/IdentActions';
import { IFellesState, resetBarnAction } from '../state/reducers/FellesReducer';
import {
    finnForkortelseForDokumenttype,
    getDokumenttypeFraForkortelse,
    getPathFraDokumenttype,
    getPathFraForkortelse,
} from '../utils';
import HåndterInntektsmeldingUtenKrav from 'app/ytelser/pleiepenger/HåndterInntektsmeldingUtenKrav';
import { OkGaaTilLosModal } from 'app/components/gå-til-los-modal/OkGaaTilLosModal';
import FagsakSelect from './components/FagsakSelect';
import DokumentTypeVelger from './components/dokumentTypeVelger/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './components/InnholdForDokumenttypeAnnet';
import { JournalpostAlleredeBehandlet } from './components/journalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import SokersIdent from './components/SokersIdent';
import ToSoekere from './components/ToSoekere';
import ValgAvBehandlingsÅr from './components/ValgAvBehandlingsÅr';
import KlassifiserModal from './components/KlassifiserModal';
import { Pleietrengende } from './components/pleietrengende/Pleietrengende';
import { KopiereJournalpostTilSammeSøker } from './components/kopiereJournalpostTilSammeSøker/KopiereJournalpostTilSammeSøker';
import AnnenPart from './components/AnnenPart';
import {
    gjelderPsbOmsOlp,
    isDokumenttypeMedBehandlingsårValg,
    isDokumenttypeOMS,
    isFagsakMedValgtBehandlingsår,
    isFagsakSelectVisible,
    isJournalførKnapperDisabled,
    isPleietrengendeComponentVisible,
    isSakstypeMedPleietrengende,
    isValgAvBehandlingsårVisible,
    isVidereKnappDisabled,
    jpErFerdigstiltOgUtenPleietrengende,
    jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende,
    kanJournalforingsoppgaveOpprettesiGosys,
} from './utils/fordelingUtils';
import FordelingKnapper from './components/FordelingKnapper';

import './fordeling.less';

export interface IFordelingStateProps {
    journalpost: IJournalpost;
    fordelingState: IFordelingState;
    identState: IIdentState;
    opprettIGosysState: IGosysOppgaveState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IFordelingDispatchProps {
    setDokumenttype: typeof setDokumenttypeAction;
    setFagsakAction: typeof setFagsakAction;
    omfordel: typeof omfordelAction;
    setIdentAction: typeof setIdentFellesAction;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    resetOmfordelAction: typeof opprettGosysOppgaveResetAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
    setErSøkerIdBekreftet: typeof setErSøkerIdBekreftetAction;
    resetIdentStateAction: typeof resetIdentState;
    setAnnenPart: typeof setAnnenPartAction;
    resetBarn: typeof resetBarnAction;
}

export type IFordelingProps = IFordelingStateProps & IFordelingDispatchProps;

// TODO Sjekke alle useEffect

const FordelingComponent: React.FC<IFordelingProps> = (props: IFordelingProps) => {
    const {
        fordelingState,
        fellesState,
        identState,
        journalpost,
        opprettIGosysState,
        lukkJournalpostOppgave,
        resetOmfordelAction,
        lukkOppgaveReset,
        setIdentAction,
        setErSøkerIdBekreftet,
        setFagsakAction: setFagsak,
        resetIdentStateAction,
        setDokumenttype,
        omfordel,
        setAnnenPart,
        resetBarn,
    } = props;

    const navigate = useNavigate();

    const [visKlassifiserModal, setVisKlassifiserModal] = useState(false);
    const [fortsettEtterKlassifiseringModal, setFortsettEtterKlassifiseringModal] = useState(false);
    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [visGaaTilLos, setVisGaaTilLos] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [reserverSaksnummerTilNyFagsak, setReserverSaksnummerTilNyFagsak] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const [disableRadios, setDisableRadios] = useState<boolean | undefined>(undefined);
    const [barnMedFagsak, setBarnMedFagsak] = useState<Fagsak | undefined>(undefined);
    const [ingenInfoOmPleitrengende, setIngenInfoOmPleitrengende] = useState<boolean>(false);
    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);

    const { fagsak: valgtFagsak, dokumenttype } = fordelingState;
    const harFagsaker = fagsaker?.length > 0;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const jpKanSendesInn = journalpost?.kanSendeInn && journalpost?.erSaksbehandler;
    const jpKanIkkeSendesInn = !journalpost?.kanSendeInn && journalpost?.erSaksbehandler;
    const harIkkeTilgang = !journalpost?.erSaksbehandler;

    /**
     * Sette fordelingState når side åpnes hvis journalpost er ikke ferdistilt men har sakstype som støttes
     */
    useEffect(() => {
        if (!journalpost.erFerdigstilt) {
            if (journalpost.sak?.sakstype) {
                if (journalpost.sak?.sakstype === DokumenttypeForkortelse.OMP) {
                    setDokumenttype(FordelingDokumenttype.OMSORGSPENGER);
                } else {
                    const dokumenttypeFraForkortelse = getDokumenttypeFraForkortelse(journalpost.sak?.sakstype);
                    if (dokumenttypeFraForkortelse) {
                        setDokumenttype(dokumenttypeFraForkortelse);
                    }
                }
            }

            /**
             * Dette håndterer feil tilfeller når saksbehandler prøvde å journalføre journalposten. Reservert saksnummer opprettet, men det sjedde feil under journalføring.
             * Men ikke sikker at dette er riktig løsning. Kanskje det trenges å vise en annen feilmelding.
             */
            if (journalpost.sak?.behandlingsår) {
                setBehandlingsAar(journalpost.sak.behandlingsår);
            }
            if (journalpost.sak?.fagsakId) {
                setIdentAction(journalpost.norskIdent!, journalpost.sak.pleietrengendeIdent);
                if (
                    journalpost.sak?.sakstype === DokumenttypeForkortelse.OMP_MA &&
                    journalpost.sak.relatertPersonIdent
                ) {
                    setAnnenPart(journalpost.sak.relatertPersonIdent);
                }
                setErSøkerIdBekreftet(true);
                setRiktigIdentIJournalposten(JaNei.JA);
                setFagsak(journalpost.sak);
                setDisableRadios(true);
                if (jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende(journalpost)) {
                    setVisSokersBarn(true);
                }
            }
        }
    }, []);

    // Redirect til ferdigstilt side hvis journalpost er ferdigstilt eller/og reservert sak og fagsak ytelse type er satt og pleietrengende ident er satt (hvis det trenges)
    useEffect(() => {
        if (
            journalpost.erFerdigstilt &&
            !!journalpost.sak?.sakstype &&
            journalpost?.kanSendeInn &&
            journalpost?.erSaksbehandler &&
            !!journalpost?.norskIdent &&
            (!isSakstypeMedPleietrengende(journalpost) || !!journalpost.sak.pleietrengendeIdent)
        ) {
            const fagsakYtelsePath = getPathFraForkortelse(journalpost.sak?.sakstype);

            // Ved feil. kanskje det trenges ikke fordi det kan ikke være ferdigstilt journalpost med reservert saksnummer med Annet sakstype
            if (!fagsakYtelsePath && journalpost.sak?.sakstype !== DokumenttypeForkortelse.OMP) {
                setDokumenttype(FordelingDokumenttype.ANNET);
                setDisableRadios(true);
                setSokersIdent(journalpost?.norskIdent);
                setIdentAction(journalpost?.norskIdent, identState.pleietrengendeId);
                return;
            }

            // Sakstype på korrigering og omp_ut er samme i ferdistilt journalpost, derfor bruker trenger å velge dokumenttype igjen
            if (journalpost.sak?.sakstype === DokumenttypeForkortelse.OMP) {
                setDokumenttype(FordelingDokumenttype.OMSORGSPENGER);
                setFagsak(journalpost.sak);
                setIdentAction(journalpost.norskIdent!);
                setErSøkerIdBekreftet(true);
                setRiktigIdentIJournalposten(JaNei.JA);
                setDisableRadios(true);
                setBehandlingsAar(journalpost.sak.behandlingsår);
                return;
            }

            // Set fordeling state ved ferdistilt (journalført) sak
            setDokumenttype(getDokumenttypeFraForkortelse(journalpost.sak?.sakstype));
            setErSøkerIdBekreftet(true);
            setIdentAction(journalpost.norskIdent!, journalpost.sak?.pleietrengendeIdent);
            setAnnenPart(journalpost.sak?.relatertPersonIdent || '');
            setFagsak(journalpost.sak);

            // Redirect to ferdigstilt side
            navigate(
                `${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId)}/${fagsakYtelsePath}`,
            );
        }
    }, []);

    /**
     * Fylle opp fordeling state ved ferdigstilt journalpost med reservert saksnummer.
     *
     * Brukes kun for å velge barn/pleietrengende ident. Barn/pleietrengende indent oppdateres ikke i journalposten.
     * Den kun legges til i fordeling state og til ny søknad. Pleitrengende ident oppdateres i journalposten etter innsending av søknad.
     */

    useEffect(() => {
        if (jpErFerdigstiltOgUtenPleietrengende(journalpost)) {
            const dokumenttypeFraForkortelse = getDokumenttypeFraForkortelse(journalpost.sak?.sakstype);

            // Ved feil
            if (!dokumenttypeFraForkortelse) {
                return;
            }

            setDisableRadios(true);
            setDokumenttype(getDokumenttypeFraForkortelse(journalpost.sak?.sakstype));
            setRiktigIdentIJournalposten(JaNei.JA);
            setErSøkerIdBekreftet(true);
            setIdentAction(journalpost.norskIdent!);
            setVisSokersBarn(true);
            setFagsak(journalpost.sak);
        }
    }, []);

    /**
     * Reset fagsak ved endring av dokumenttype eller søkerId når journalpost ikke er ferdigstilt
     */
    useEffect(() => {
        if (!journalpost.erFerdigstilt && !journalpost.sak?.fagsakId && valgtFagsak) {
            setFagsak(undefined);
            setReserverSaksnummerTilNyFagsak(false);
            setIngenInfoOmPleitrengende(false);
            if (valgtFagsak.sakstype === DokumenttypeForkortelse.OMP_MA) {
                setAnnenPart('');
            }
        }
    }, [dokumenttype, identState.søkerId]);

    // TODO TESTE DETTTE - det ser ut er bug her
    useEffect(() => {
        if (reserverSaksnummerTilNyFagsak && fagsaker) {
            setBarnMedFagsak(fagsaker.find((f) => f.pleietrengendeIdent === identState.pleietrengendeId));
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
            (!journalpost.erFerdigstilt || jpErFerdigstiltOgUtenPleietrengende(journalpost)) &&
            !journalpost.sak?.fagsakId &&
            identState.søkerId &&
            dokumenttype &&
            gjelderPsbOmsOlp(dokumenttype)
        ) {
            setHenteFagsakFeilet(false);
            setIsFetchingFagsaker(true);
            setFagsak(undefined);
            finnFagsaker(identState.søkerId, (response, data: Fagsak[]) => {
                setIsFetchingFagsaker(false);
                if (response.status === 200) {
                    const dokumenttypeForkortelse = finnForkortelseForDokumenttype(dokumenttype);
                    const filtrerteFagsaker = data.filter(
                        (fsak) => !dokumenttypeForkortelse || fsak.sakstype === dokumenttypeForkortelse,
                    );
                    setFagsaker(filtrerteFagsaker);
                    if (filtrerteFagsaker.length === 0 && !jpErFerdigstiltOgUtenPleietrengende(journalpost)) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                    if (filtrerteFagsaker.length === 0 && dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

    const visAlertJpErFerdigstiltOgUtenPleietrengende = jpErFerdigstiltOgUtenPleietrengende(journalpost);

    const visAlertToSøkereIngenAnnenSøker =
        !journalpost.erFerdigstilt && identState.søkerId && toSokereIJournalpost && !identState.annenSokerIdent;

    const visToSøkereIJournalpost =
        !journalpost.erFerdigstilt &&
        !!journalpost?.kanKopieres &&
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE);

    const visAlertToSøkereIngenPleietrengende =
        !journalpost.erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        !identState.pleietrengendeId;

    const visKopiereJournalpostTilSammeSøker = journalpost.erFerdigstilt && !!barnMedFagsak;

    const visFagsakSelect = isFagsakSelectVisible(journalpost, identState, harFagsaker, dokumenttype);

    const visPleietrengendeComponent = isPleietrengendeComponentVisible(
        journalpost,
        identState,
        isFetchingFagsaker,
        visSokersBarn,
        ingenInfoOmPleitrengende,
        reserverSaksnummerTilNyFagsak,
        dokumenttype,
    );

    const visAlertPleietrengendeHarFagsak = !journalpost.erFerdigstilt && !!barnMedFagsak;

    const visValgAvBehandlingsaar = isValgAvBehandlingsårVisible(
        journalpost,
        identState,
        reserverSaksnummerTilNyFagsak,
        valgtFagsak,
        dokumenttype,
    );

    const visJournalførKnapper = !isFetchingFagsaker && !journalpost.erFerdigstilt && gjelderPsbOmsOlp(dokumenttype);

    const disableJournalførKnapper = isJournalførKnapperDisabled(
        journalpost,
        identState,
        fagsaker,
        harFagsaker,
        reserverSaksnummerTilNyFagsak,
        ingenInfoOmPleitrengende,
        toSokereIJournalpost,
        barnetHarIkkeFnr,
        behandlingsAar,
        valgtFagsak,
        dokumenttype,
        barnMedFagsak,
    );

    const visAlertJornalførUtenFagsak =
        !journalpost.erFerdigstilt &&
        !valgtFagsak &&
        !disableJournalførKnapper &&
        (identState.pleietrengendeId ||
            isDokumenttypeMedBehandlingsårValg(dokumenttype) ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA);

    const visAlertFagsakMedValgtBehandlingsår = isFagsakMedValgtBehandlingsår(
        fagsaker,
        reserverSaksnummerTilNyFagsak,
        dokumenttype,
        behandlingsAar,
    );

    const visFortsettKnappVedFerdistiltJp =
        !isFetchingFagsaker && !!journalpost.erFerdigstilt && gjelderPsbOmsOlp(dokumenttype) && !barnMedFagsak;

    const disableRedirectVidere = isVidereKnappDisabled(identState, dokumenttype, barnMedFagsak);

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
        if (fordelingState.dokumenttype) {
            if (!valgtFagsak) {
                setFagsak(journalpost.sak);
            }
            const pathFraDokumenttype = getPathFraDokumenttype(fordelingState.dokumenttype);

            if (pathFraDokumenttype) {
                navigate(
                    `${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId)}/${pathFraDokumenttype}`,
                );
            }
        }
    };

    const handleDokumenttype = (type: FordelingDokumenttype) => {
        if (type === FordelingDokumenttype.ANNET) {
            if (!identState.søkerId && !!journalpost?.norskIdent) {
                setSokersIdent(journalpost?.norskIdent); // lokal useState
                setIdentAction(journalpost?.norskIdent, identState.pleietrengendeId); // Redux
            } else {
                setSokersIdent(identState.søkerId); // lokal useState
            }
        } else {
            setSokersIdent(''); // lokal useState
        }

        if (!journalpost.erFerdigstilt && !journalpost.sak?.fagsakId) {
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
        const nyValgtFagsak = fagsaker.find((fagsak) => fagsak.fagsakId === fagsakId);

        setIdentAction(identState.søkerId, nyValgtFagsak?.pleietrengendeIdent || '', identState.annenSokerIdent);
        setFagsak(nyValgtFagsak);

        if (nyValgtFagsak?.sakstype === DokumenttypeForkortelse.OMP_MA && nyValgtFagsak.relatertPersonIdent) {
            setAnnenPart(nyValgtFagsak.relatertPersonIdent);
        }

        if (isDokumenttypeOMS(dokumenttype)) {
            setBehandlingsAar(nyValgtFagsak ? nyValgtFagsak.behandlingsår : undefined);
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

    if (fordelingState.isAwaitingLukkOppgaveResponse) {
        return <Loader size="large" />;
    }

    if (fordelingState.lukkOppgaveDone) {
        return (
            <Modal
                key="lukkoppgaveokmodal"
                onClose={() => {
                    lukkOppgaveReset();
                }}
                aria-label="settpaaventokmodal"
                open={!!fordelingState.lukkOppgaveDone}
            >
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    return (
        <div className="fordeling-container">
            {jpKanSendesInn && (
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
                        {visAlertJpErFerdigstiltOgUtenPleietrengende && (
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
                            <DokumentTypeVelger
                                showComponent={!erInntektsmeldingUtenKrav}
                                handleDokumenttype={(type: FordelingDokumenttype) => {
                                    handleDokumenttype(type);
                                }}
                                valgtDokumentType={dokumenttype as string}
                                disableRadios={disableRadios}
                            />

                            <InnholdForDokumenttypeAnnet
                                showComponent={dokumenttype === FordelingDokumenttype.ANNET}
                                journalpost={journalpost}
                                lukkJournalpostOppgave={lukkJournalpostOppgave}
                                kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys(
                                    journalpost,
                                )}
                                handleSøkerIdBlur={handleSøkerIdBlur}
                                handleSøkerIdChange={handleSøkerIdChange}
                                sokersIdent={sokersIdent}
                                identState={identState}
                                fordelingState={fordelingState}
                                omfordel={omfordel}
                            />

                            <SokersIdent
                                showComponent={
                                    erInntektsmeldingUtenKrav ||
                                    (!!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype))
                                }
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
                                disableRadios={disableRadios}
                            />

                            <ToSoekere
                                showComponet={visToSøkereIJournalpost}
                                journalpost={journalpost}
                                identState={identState}
                                toSøkereIJournalpost={toSokereIJournalpost}
                                setIdentAction={setIdentAction}
                                setToSokereIJournalpost={setToSokereIJournalpost}
                                disabled={disableRadios}
                            />

                            <HåndterInntektsmeldingUtenKrav
                                showComponent={erInntektsmeldingUtenKrav && !!identState.søkerId}
                                søkerId={identState.søkerId}
                                journalpost={journalpost}
                            />

                            <FagsakSelect
                                showComponent={visFagsakSelect}
                                fagsaker={fagsaker}
                                reserverSaksnummerTilNyFagsak={reserverSaksnummerTilNyFagsak}
                                identState={identState}
                                ingenInfoOmBarnIDokument={ingenInfoOmPleitrengende}
                                valgtFagsak={valgtFagsak}
                                barn={fellesState.barn}
                                setValgtFagsak={setValgtFagsak}
                                setReserverSaksnummerTilNyFagsak={setReserverSaksnummerTilNyFagsak}
                                setIdentAction={setIdentAction}
                                setBehandlingsAar={setBehandlingsAar}
                                setAnnenPart={setAnnenPart}
                            />

                            <AnnenPart
                                showComponent={
                                    dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
                                    (reserverSaksnummerTilNyFagsak ||
                                        (!!valgtFagsak && !valgtFagsak.relatertPersonIdent))
                                }
                                annenPart={identState.annenPart}
                                setAnnenPart={setAnnenPart}
                            />

                            <ValgAvBehandlingsÅr
                                showComponent={visValgAvBehandlingsaar}
                                behandlingsAar={behandlingsAar}
                                onChange={setBehandlingsAar}
                            />

                            {henteFagsakFeilet && (
                                <ErrorMessage>
                                    <FormattedMessage id="fordeling.error.henteFagsakFeilet" />
                                </ErrorMessage>
                            )}

                            {isFetchingFagsaker && <Loader />}

                            <Pleietrengende
                                showComponent={visPleietrengendeComponent}
                                pleietrengendeHarIkkeFnrFn={(harBarnetFnr: boolean) =>
                                    setBarnetHarIkkeFnr(harBarnetFnr)
                                }
                                skalHenteBarn={dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                                jpErFerdigstiltOgUtenPleietrengende={jpErFerdigstiltOgUtenPleietrengende(journalpost)}
                                toSokereIJournalpost={toSokereIJournalpost}
                            />

                            {visAlertPleietrengendeHarFagsak && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="pleietrengendeHarFagsak"
                                >
                                    <FormattedMessage
                                        id="fordeling.error.pleietrengendeHarFagsak"
                                        values={{
                                            pleietrengendeId: barnMedFagsak.pleietrengendeIdent,
                                            fagsakId: barnMedFagsak.fagsakId,
                                        }}
                                    />
                                </Alert>
                            )}

                            {visAlertToSøkereIngenPleietrengende && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenPleietrengende"
                                >
                                    <FormattedMessage id="fordeling.info.toSøkere.ingenPleietrengende" />
                                </Alert>
                            )}

                            {visAlertToSøkereIngenAnnenSøker && (
                                <Alert
                                    size="small"
                                    variant="warning"
                                    className="mb-4"
                                    data-test-id="toSøkereIngenAnnenSøker"
                                >
                                    <FormattedMessage id="fordeling.info.toSøkere.ingenAnnenSøker" />
                                </Alert>
                            )}

                            {visKopiereJournalpostTilSammeSøker && (
                                <>
                                    {!fellesState.kopierJournalpostSuccess && (
                                        <Alert size="small" variant="warning">
                                            <FormattedMessage
                                                id="fordeling.error.pleietrengendeHarFerdistiltFagsak"
                                                values={{
                                                    pleietrengendeId: barnMedFagsak.pleietrengendeIdent,
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

                            {visAlertJornalførUtenFagsak && (
                                <Alert size="small" variant="info" className="mb-4" data-test-id="jornalførUtenFagsak">
                                    <FormattedMessage id="fordeling.infobox.jornalførUtenFagsak" />
                                </Alert>
                            )}

                            {visAlertFagsakMedValgtBehandlingsår && (
                                <Alert
                                    size="small"
                                    variant="info"
                                    className="mb-4"
                                    data-test-id="alertFagsakMedValgtBehandlingsår"
                                >
                                    <FormattedMessage id="fordeling.infobox.alertFagsakMedValgtBehandlingsår" />
                                </Alert>
                            )}

                            <FordelingKnapper
                                visJournalførKnapper={visJournalførKnapper}
                                disableJournalførKnapper={disableJournalførKnapper}
                                disableRedirectVidere={disableRedirectVidere}
                                visFortsettKnappVedFerdistiltJp={visFortsettKnappVedFerdistiltJp}
                                journalpost={journalpost}
                                handleRedirectVidere={handleRedirectVidere}
                                setFortsettEtterKlassifiseringModal={setFortsettEtterKlassifiseringModal}
                                setVisKlassifiserModal={setVisKlassifiserModal}
                            />
                        </div>

                        {visKlassifiserModal && (
                            <KlassifiserModal
                                lukkModal={() => setVisKlassifiserModal(false)}
                                setFagsak={(sak: Fagsak) => setFagsak(sak)}
                                dedupkey={props.dedupkey}
                                fortsett={fortsettEtterKlassifiseringModal}
                                behandlingsAar={behandlingsAar}
                            />
                        )}
                        <VerticalSpacer sixteenPx />
                    </div>
                </FormPanel>
            )}

            {jpKanIkkeSendesInn && <JournalpostAlleredeBehandlet />}

            {harIkkeTilgang && (
                <div>
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="fordeling.ikkesaksbehandler" />
                    </Alert>
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
    identState: state.identState,
    opprettIGosysState: state.opprettIGosys,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey,
});

const mapDispatchToProps = (dispatch: any) => ({
    setDokumenttype: (dokumenttype: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype)),
    setFagsakAction: (fagsak: Fagsak) => dispatch(setFagsakAction(fagsak)),
    omfordel: (journalpostid: string, norskIdent: string, gosysKategori: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent, gosysKategori)),
    setIdentAction: (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent)),
    setErSøkerIdBekreftet: (erBekreftet: boolean) => dispatch(setErSøkerIdBekreftetAction(erBekreftet)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    resetOmfordelAction: () => dispatch(opprettGosysOppgaveResetAction()),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
    resetIdentStateAction: () => dispatch(resetIdentState()),
    setAnnenPart: (annenPart: string) => dispatch(setAnnenPartAction(annenPart)),
    resetAllState: () => dispatch(resetAllStateAction()),
    resetBarn: () => dispatch(resetBarnAction()),
});

const Fordeling = connect(mapStateToProps, mapDispatchToProps)(FordelingComponent);

export { Fordeling, FordelingComponent };
