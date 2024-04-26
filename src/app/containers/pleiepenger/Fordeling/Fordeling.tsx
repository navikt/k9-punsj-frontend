import React, { useEffect, useState } from 'react';

import { Alert, Button, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { finnFagsaker } from 'app/api/api';
import { DokumenttypeForkortelse, FordelingDokumenttype, JaNei, dokumenttyperForPsbOmsOlp } from 'app/models/enums';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    setErSøkerIdBekreftetAction,
} from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';
import { ROUTES } from 'app/constants/routes';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import FormPanel from '../../../components/FormPanel';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { IGosysOppgaveState } from '../../../models/types/GosysOppgaveState';
import { IIdentState } from '../../../models/types/IdentState';
import { setDokumenttypeAction, setFagsakAction } from '../../../state/actions/FordelingActions';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../../../state/actions/GosysOppgaveActions';
import { resetIdentState, setAnnenPartAction, setIdentFellesAction } from '../../../state/actions/IdentActions';
import { IFellesState, resetBarnAction } from '../../../state/reducers/FellesReducer';
import {
    finnForkortelseForDokumenttype,
    getDokumenttypeFraForkortelse,
    getEnvironmentVariable,
    getPathFraDokumenttype,
    getPathFraForkortelse,
} from '../../../utils';
import HåndterInntektsmeldingUtenKrav from '../HåndterInntektsmeldingUtenKrav';
import { OkGaaTilLosModal } from '../OkGaaTilLosModal';
import FagsakSelect from './FagsakSelect';
import DokumentTypeVelger from './Komponenter/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgAvBehandlingsÅr from './Komponenter/ValgAvBehandlingsÅr';
import KlassifiserModal from './Komponenter/KlassifiserModal';
import { Pleietrengende } from './Komponenter/Pleietrengende';
import { KopiereJournalpostTilSammeSøker } from './Komponenter/KopiereJournalpostTilSammeSøker/KopiereJournalpostTilSammeSøker';
import AnnenPart from './Komponenter/AnnenPart';
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

// TODO Flytte til felles sted?
// TODO Sjekke alle useEffect

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (props: IFordelingProps) => {
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

    const { fagsak: valgtFagsak, dokumenttype } = fordelingState;

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

    const harFagsaker = fagsaker?.length > 0;

    const isDokumenttypeMedPleietrengende =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
        dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO;

    const sakstyperMedPleietrengende = [
        DokumenttypeForkortelse.PSB,
        DokumenttypeForkortelse.OMP_KS,
        DokumenttypeForkortelse.PPN,
        DokumenttypeForkortelse.OLP,
        DokumenttypeForkortelse.OMP_AO,
    ];

    const ytelserMedBehandlingsårValg =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT ||
        dokumenttype === FordelingDokumenttype.KORRIGERING_IM;

    const isDokumenttypeMedBehandlingsår =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT ||
        dokumenttype === FordelingDokumenttype.KORRIGERING_IM ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA;

    const isSakstypeMedPleietrengende =
        journalpost.sak?.sakstype && sakstyperMedPleietrengende.includes(journalpost.sak?.sakstype);

    /**
     * Sette fordelingState.dokumenttype når side åpnes hvis journalpost er ikke ferdistilt men har sakstype som støttes
     */
    useEffect(() => {
        if (!journalpost.erFerdigstilt && journalpost.sak?.sakstype) {
            const dokumenttypeFraForkortelse = getDokumenttypeFraForkortelse(journalpost.sak?.sakstype);
            if (dokumenttypeFraForkortelse) {
                setDokumenttype(dokumenttypeFraForkortelse);
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
            (!isSakstypeMedPleietrengende || !!journalpost.sak.pleietrengendeIdent)
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

            // Får samme sakstype på korrigering og omp_ut
            if (journalpost.sak?.sakstype === DokumenttypeForkortelse.OMP) {
                setFagsak(journalpost.sak);
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
        !(!isSakstypeMedPleietrengende || !!journalpost.sak.pleietrengendeIdent);

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
        if (valgtFagsak && !journalpost.erFerdigstilt) {
            setFagsak(undefined);
            setReserverSaksnummerTilNyFagsak(false);
            setIngenInfoOmPleitrengende(false);
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

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visFagsakSelect =
        gjelderPsbOmsOlp && harFagsaker && identState.søkerId.length === 11 && !jpErFerdigstiltOgUtenPleietrengende;

    const visPleietrengendeComponent =
        gjelderPsbOmsOlp &&
        !isFetchingFagsaker &&
        (reserverSaksnummerTilNyFagsak || jpErFerdigstiltOgUtenPleietrengende) &&
        !ingenInfoOmPleitrengende;

    const visPleietrengende =
        visSokersBarn && isDokumenttypeMedPleietrengende && !IdentRules.erUgyldigIdent(identState.søkerId);

    const visValgAvBehandlingsaar =
        ytelserMedBehandlingsårValg &&
        identState.søkerId.length === 11 &&
        reserverSaksnummerTilNyFagsak &&
        !journalpost.erFerdigstilt;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

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
            identState.søkerId &&
            dokumenttype &&
            gjelderPsbOmsOlp
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
                    if (filtrerteFagsaker.length === 0 && !jpErFerdigstiltOgUtenPleietrengende) {
                        setReserverSaksnummerTilNyFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

    const disableVidereMidlertidigAlene =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
        (!identState.annenPart || !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)));

    const disableJournalførKnapper = () => {
        if (
            dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER
        ) {
            if (journalpost.erFerdigstilt && journalpost.sak?.reservertSaksnummer) {
                return true;
            }
            if (harFagsaker && !reserverSaksnummerTilNyFagsak && !ingenInfoOmPleitrengende) {
                return !valgtFagsak;
            }

            if (barnMedFagsak) {
                return true;
            }

            if (identState.søkerId === identState.pleietrengendeId) {
                return true;
            }

            if (identState.søkerId === identState.annenSokerIdent) {
                return true;
            }
            if (identState.pleietrengendeId === identState.annenSokerIdent) {
                return true;
            }

            if (!!journalpost?.kanKopieres && toSokereIJournalpost) {
                return (
                    IdentRules.erUgyldigIdent(identState.søkerId) ||
                    IdentRules.erUgyldigIdent(identState.annenSokerIdent) ||
                    !identState.pleietrengendeId
                );
            }

            if (
                !barnetHarIkkeFnr &&
                !ingenInfoOmPleitrengende &&
                IdentRules.erUgyldigIdent(identState.pleietrengendeId)
            ) {
                return true;
            }
        }
        if (ytelserMedBehandlingsårValg && !behandlingsAar) {
            return true;
        }

        return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene;
    };

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

    const disableRedirectVidere = () => {
        if (
            dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER
        ) {
            if (barnMedFagsak) {
                return true;
            }

            if (identState.søkerId === identState.pleietrengendeId) {
                return true;
            }

            if (IdentRules.erUgyldigIdent(identState.pleietrengendeId)) {
                return true;
            }
        }

        return IdentRules.erUgyldigIdent(identState.søkerId);
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

        setRiktigIdentIJournalposten(undefined); // lokal useState
        setReserverSaksnummerTilNyFagsak(false); // lokal useState
        setBehandlingsAar(undefined); // lokal useState
        setToSokereIJournalpost(false); // lokal useState
        resetBarn(); // Redux felles state liste med barn
        resetIdentStateAction(); // Reset kun annenSøkerIdent, pleitrengendeId og annenPart
        setDokumenttype(type); // Redux state
    };

    const setValgtFagsak = (fagsakId: string) => {
        const nyValgtFagsak = fagsaker.find((fagsak) => fagsak.fagsakId === fagsakId);

        setIdentAction(identState.søkerId, nyValgtFagsak?.pleietrengendeIdent || '', identState.annenSokerIdent);
        setFagsak(nyValgtFagsak);

        if (isDokumenttypeMedBehandlingsår && nyValgtFagsak && nyValgtFagsak.gyldigPeriode) {
            setBehandlingsAar(String(dayjs(nyValgtFagsak.gyldigPeriode.fom).year()));
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
                            <Alert size="small" variant="error">
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

                            <div className="mt-5 mb-5">
                                <AnnenPart
                                    annenPart={identState.annenPart}
                                    showComponent={dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA}
                                    setAnnenPart={setAnnenPart}
                                />
                            </div>

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
                                    valgtFagsak={valgtFagsak}
                                    setBehandlingsAar={setBehandlingsAar}
                                    barn={fellesState.barn}
                                />
                            )}

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
                                    pleietrengendeHarIkkeFnrFn={(harBarnetFnr: boolean) =>
                                        setBarnetHarIkkeFnr(harBarnetFnr)
                                    }
                                    sokersIdent={identState.søkerId}
                                    skalHenteBarn={
                                        dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE
                                    }
                                    visPleietrengende={visPleietrengende}
                                    jpErFerdigstiltOgUtenPleietrengende={jpErFerdigstiltOgUtenPleietrengende}
                                    toSokereIJournalpost={toSokereIJournalpost}
                                />
                            )}
                            {!!barnMedFagsak && !journalpost.erFerdigstilt && (
                                <Alert size="small" variant="warning" className="mb-4">
                                    <FormattedMessage
                                        id="fordeling.error.pleietrengendeHarFagsak"
                                        values={{
                                            pleietrengendeId: barnMedFagsak.pleietrengendeIdent,
                                            fagsakId: barnMedFagsak.fagsakId,
                                        }}
                                    />
                                </Alert>
                            )}

                            {!journalpost.erFerdigstilt &&
                                toSokereIJournalpost &&
                                identState.søkerId &&
                                identState.annenSokerIdent &&
                                !identState.pleietrengendeId && (
                                    <Alert size="small" variant="warning" className="mb-4">
                                        <FormattedMessage id="fordeling.info.toSøkere.ingenPleietrengende" />
                                    </Alert>
                                )}
                            {!journalpost.erFerdigstilt &&
                                identState.søkerId &&
                                toSokereIJournalpost &&
                                !identState.annenSokerIdent && (
                                    <Alert size="small" variant="warning" className="mb-4">
                                        <FormattedMessage id="fordeling.info.toSøkere" />
                                    </Alert>
                                )}

                            {!!barnMedFagsak && journalpost.erFerdigstilt && (
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
                            {!journalpost.erFerdigstilt &&
                                !valgtFagsak &&
                                !disableJournalførKnapper() &&
                                (identState.pleietrengendeId ||
                                    ytelserMedBehandlingsårValg ||
                                    dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA) && (
                                    <Alert size="small" variant="info" className="mb-4">
                                        <FormattedMessage id="fordeling.infobox.jornalførUtenFagsak" />
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
                                            disabled={disableJournalførKnapper() || disableRedirectVidere()}
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
                                        disabled={disableJournalførKnapper()}
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
                                            disabled={disableRedirectVidere()}
                                        >
                                            <FormattedMessage id="fordeling.knapp.ferdistiltJpReservertSaksnummer.fortsett" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="small"
                                        variant="secondary"
                                        onClick={() => {
                                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                        }}
                                    >
                                        Avbryt og legg i kø
                                    </Button>
                                </div>
                            )}
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
            {!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && <JournalpostAlleredeBehandlet />}
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
