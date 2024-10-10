import React, { useEffect, useState } from 'react';

import { Alert, Button, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { finnFagsaker } from 'app/api/api';
import {
    DokumenttypeForkortelse,
    FordelingDokumenttype,
    JaNei,
    dokumenttyperForPsbOmsOlp,
    dokumenttyperMedBehandlingsår,
    dokumenttyperMedBehandlingsårValg,
    dokumenttyperMedPleietrengende,
    dokumentyperMedFosterbarn,
    sakstyperMedPleietrengende,
} from 'app/models/enums';
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
import { ROUTES } from 'app/constants/routes';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import FormPanel from 'app/components/FormPanel';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { setDokumenttypeAction, setFagsakAction } from 'app/state/actions/FordelingActions';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from 'app/state/actions/GosysOppgaveActions';
import {
    resetIdentState,
    setAnnenPartAction,
    setFosterbarnAction,
    setIdentFellesAction,
} from 'app/state/actions/IdentActions';
import { resetBarnAction } from 'app/state/reducers/FellesReducer';
import {
    finnForkortelseForDokumenttype,
    getDokumenttypeFraForkortelse,
    getPathFraDokumenttype,
    getPathFraForkortelse,
} from 'app/utils';
import HåndterInntektsmeldingUtenKrav from 'app/containers/pleiepenger/HåndterInntektsmeldingUtenKrav';
import { OkGaaTilLosModal } from 'app/containers/pleiepenger/OkGaaTilLosModal';
import FagsakSelect from './Komponenter/FagsakSelect';
import DokumentTypeVelger from './Komponenter/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import JournalpostAlleredeBehandlet from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgAvBehandlingsÅr from './Komponenter/ValgAvBehandlingsÅr';
import KlassifiserModal from './Komponenter/KlassifiserModal';
import Pleietrengende from './Komponenter/Pleietrengende';
import KopiereJournalpostTilSammeSøker from './Komponenter/KopiereJournalpostTilSammeSøker/KopiereJournalpostTilSammeSøker';
import AnnenPart from './Komponenter/AnnenPart';
import VentLukkBrevModal from './Komponenter/VentLukkBrevModal';
import Fosterbarn from './Komponenter/Fosterbarn';
import { Dispatch } from 'redux';
import {
    checkIfFagsakMedValgtBehandlingsår,
    isJournalførKnapperDisabled,
    isRedirectVidereDisabled,
} from './fordelingUtils';

import './fordeling.less';

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
    const setFosterbarn = (fosterbarn?: string[]) => dispatch(setFosterbarnAction(fosterbarn));

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

    const { dedupKey } = fellesState;
    const { fagsak, dokumenttype } = fordelingState;

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);
    const isDokumenttypeMedPleietrengende = !!dokumenttype && dokumenttyperMedPleietrengende.includes(dokumenttype);
    const isSakstyperFraJpSakMedPleietrengende =
        !!journalpost.sak?.sakstype && sakstyperMedPleietrengende.includes(journalpost.sak?.sakstype);
    const isDokumenttypeMedBehandlingsårValg =
        !!dokumenttype && dokumenttyperMedBehandlingsårValg.includes(dokumenttype);
    const isDokumenttypeMedBehandlingsår = !!dokumenttype && dokumenttyperMedBehandlingsår.includes(dokumenttype);
    const isDokumenttypeMedFosterbarn = !!dokumenttype && dokumentyperMedFosterbarn.includes(dokumenttype);
    const isDokumenttypeMedAnnenPart = dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA;

    const jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende =
        !journalpost.erFerdigstilt &&
        !!journalpost.sak?.fagsakId &&
        !!journalpost?.norskIdent &&
        !(!isSakstyperFraJpSakMedPleietrengende || !!journalpost.sak.pleietrengendeIdent);

    const isFagsakMedValgtBehandlingsår = checkIfFagsakMedValgtBehandlingsår(
        fagsaker,
        isDokumenttypeMedBehandlingsårValg,
        reserverSaksnummerTilNyFagsak,
        behandlingsAar,
    );

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
                if (jpMedFagsakIdErIkkeFerdigstiltOgUtenPleietrengende) {
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
            (!isSakstyperFraJpSakMedPleietrengende || !!journalpost.sak.pleietrengendeIdent)
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

            const fosterbarnFraSak = journalpost.sak?.barnIdenter;
            const fosterbarn = fosterbarnFraSak ? fosterbarnFraSak.map((fb) => fb.norskIdent) : undefined;

            if (fosterbarn && fosterbarn.length > 0) {
                setFosterbarn(fosterbarn);
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

    const jpErFerdigstiltOgUtenPleietrengende =
        journalpost.erFerdigstilt &&
        !!journalpost.sak?.fagsakId &&
        !!journalpost?.norskIdent &&
        !(!isSakstyperFraJpSakMedPleietrengende || !!journalpost.sak.pleietrengendeIdent);

    useEffect(() => {
        if (jpErFerdigstiltOgUtenPleietrengende) {
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
        if (!journalpost.erFerdigstilt && !journalpost.sak?.fagsakId && fagsak) {
            setFagsak(undefined);
            setReserverSaksnummerTilNyFagsak(false);
            setIngenInfoOmPleitrengende(false);
            if (fagsak.sakstype === DokumenttypeForkortelse.OMP_MA) {
                setAnnenPart('');
            }
        }
    }, [dokumenttype, identState.søkerId]);

    /**
     * Sjekk om pleietrengende er i eksisterende fagsak, og sett barnMedFagsak.
     * Saksbehandler kan ikke velge pleietrengende hvis den er i eksisterende fagsak før journalføring.
     * Hvis journalposten er ferdigstilt, kan saksbehandler velge pleietrengende som er ikke i eksisterende fagsak.
     * Hvis journalposten er ferdigstilt og det er nødvendig å legge til pleietrengende som er i eksisterende fagsak,
     * kan saksbehandler velge pleietrengende og kopiere journalposten mot fagsak med pleietrengende og lukke journalposten.
     * Det vises en knapp som åpner en modal for å kopiere journalposten mot fagsak med pleietrengende og lukke journalposten.
     */
    useEffect(() => {
        if (fagsaker && (reserverSaksnummerTilNyFagsak || jpErFerdigstiltOgUtenPleietrengende)) {
            setBarnMedFagsak(fagsaker.find((f) => f.pleietrengende?.identitetsnummer === identState.pleietrengendeId));
        } else {
            setBarnMedFagsak(undefined);
        }
    }, [identState.pleietrengendeId, fagsaker, reserverSaksnummerTilNyFagsak, jpErFerdigstiltOgUtenPleietrengende]);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

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
        visSokersBarn && isDokumenttypeMedPleietrengende && !IdentRules.erUgyldigIdent(identState.søkerId);

    // Sjekk ang fagsak?.reservert && !fagsak?.gyldigPeriode
    const visValgAvBehandlingsaar =
        isDokumenttypeMedBehandlingsårValg &&
        identState.søkerId.length === 11 &&
        (reserverSaksnummerTilNyFagsak || (fagsak?.reservert && !fagsak?.behandlingsår)) &&
        !journalpost.erFerdigstilt;

    const visFosterbarnComponent =
        isDokumenttypeMedFosterbarn &&
        identState.søkerId.length === 11 &&
        !journalpost.erFerdigstilt &&
        reserverSaksnummerTilNyFagsak;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const toSøkereIngenAnnenSøker =
        !journalpost.erFerdigstilt && toSokereIJournalpost && identState.søkerId && !identState.annenSokerIdent;

    const toSøkereIngenPleietrengende =
        !journalpost.erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        isDokumenttypeMedPleietrengende &&
        !identState.pleietrengendeId;

    const toSøkereIngenBehandlingÅr =
        !journalpost.erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        isDokumenttypeMedBehandlingsårValg &&
        !behandlingsAar;

    const toSøkereIngenAnnenPartMA =
        !journalpost.erFerdigstilt &&
        toSokereIJournalpost &&
        identState.søkerId &&
        identState.annenSokerIdent &&
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
        !identState.annenPart;

    useEffect(() => {
        if (opprettIGosysState.gosysOppgaveRequestSuccess) {
            setVisGaaTilLos(true);
        }
    }, [fellesState.isAwaitingKopierJournalPostResponse, opprettIGosysState.gosysOppgaveRequestSuccess]);

    // Henter fagsaker ved endring av søkerId, dokumenttype eller gjelderPsbOmsOlp
    // Hvis det er ingen fagsaker, viser vi pleietrengende component
    useEffect(() => {
        if (
            (!journalpost.erFerdigstilt || jpErFerdigstiltOgUtenPleietrengende) &&
            // !journalpost.sak?.fagsakId &&
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
                    if (filtrerteFagsaker.length === 0 && dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

    const journalførKnapperDisabled = isJournalførKnapperDisabled(
        journalpost,
        identState,
        ingenInfoOmPleitrengende,
        barnetHarIkkeFnr,
        toSokereIJournalpost,
        harFagsaker,
        reserverSaksnummerTilNyFagsak,
        isDokumenttypeMedPleietrengende,
        isDokumenttypeMedBehandlingsårValg,
        isDokumenttypeMedAnnenPart,
        isDokumenttypeMedFosterbarn,
        isFagsakMedValgtBehandlingsår,
        fagsak,
        behandlingsAar,
        barnMedFagsak,
    );

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
            if (!fagsak) {
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

    const redirectVidereDisabled = isRedirectVidereDisabled(identState, isDokumenttypeMedPleietrengende, barnMedFagsak);

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
            setFosterbarn(); // Redux felles state liste med fosterbarn
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

        if (isDokumenttypeMedBehandlingsår) {
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
            {journalpost?.kanSendeInn && journalpost?.erSaksbehandler && (
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
                                    kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys}
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
                                    setFosterbarn={setFosterbarn}
                                />
                            )}

                            <div className="mt-5 mb-5">
                                <AnnenPart
                                    identState={identState}
                                    showComponent={
                                        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
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

                            <Fosterbarn showComponent={visFosterbarnComponent} />

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
                            {!!barnMedFagsak && !journalpost.erFerdigstilt && (
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

                            {!!barnMedFagsak && journalpost.erFerdigstilt && (
                                <>
                                    {!fellesState.kopierJournalpostSuccess && (
                                        <Alert
                                            size="small"
                                            variant="warning"
                                            data-test-id="pleietrengendeHarFagsakFerdistiltJpWarning"
                                        >
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
                            {!journalpost.erFerdigstilt &&
                                !fagsak &&
                                !journalførKnapperDisabled &&
                                (identState.pleietrengendeId ||
                                    isDokumenttypeMedBehandlingsårValg ||
                                    dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA) && (
                                    <Alert
                                        size="small"
                                        variant="info"
                                        className="mb-4"
                                        data-test-id="jornalførUtenFagsak"
                                    >
                                        <FormattedMessage id="fordeling.infobox.jornalførUtenFagsak" />
                                    </Alert>
                                )}

                            {isFagsakMedValgtBehandlingsår && (
                                <Alert
                                    size="small"
                                    variant="info"
                                    className="mb-4"
                                    data-test-id="alertFagsakMedValgtBehandlingsår"
                                >
                                    <FormattedMessage id="fordeling.infobox.alertFagsakMedValgtBehandlingsår" />
                                </Alert>
                            )}

                            {gjelderPsbOmsOlp && !isFetchingFagsaker && !journalpost.erFerdigstilt && (
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

                            {gjelderPsbOmsOlp && !isFetchingFagsaker && journalpost.erFerdigstilt && !barnMedFagsak && (
                                <div className="flex">
                                    <div className="mr-4">
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={handleRedirectVidere}
                                            disabled={redirectVidereDisabled}
                                            data-test-id="ferdistiltJpReservertSaksnummerVidereBtn"
                                        >
                                            <FormattedMessage id="fordeling.knapp.ferdistiltJpReservertSaksnummer.fortsett" />
                                        </Button>
                                    </div>

                                    {isSakstyperFraJpSakMedPleietrengende && (
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() => setÅpenBrevModal(true)}
                                            data-test-id="ferdistiltJpReservertSaksnummeråpenVentLukkBrevModalBtn"
                                        >
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
                                setFagsak={(sak: Fagsak) => setFagsak(sak)}
                            />
                        )}

                        {!!journalpost.sak?.fagsakId && !!dokumenttype && (
                            <VentLukkBrevModal open={åpenBrevModal} onClose={() => setÅpenBrevModal(false)} />
                        )}

                        <VerticalSpacer sixteenPx />
                    </div>
                </FormPanel>
            )}

            {!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && (
                <FormPanel>
                    <div className="fordeling-page">
                        <JournalpostAlleredeBehandlet />
                    </div>
                </FormPanel>
            )}

            {!journalpost?.erSaksbehandler && (
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
