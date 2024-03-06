import React, { useEffect, useState } from 'react';

import { Alert, Button, Checkbox, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { finnFagsaker, postBehandlingsAar } from 'app/api/api';
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
import { useMutation } from 'react-query';
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
import { resetIdentState, setIdentFellesAction } from '../../../state/actions/IdentActions';
import { IFellesState, kopierJournalpost, resetBarnAction } from '../../../state/reducers/FellesReducer';
import {
    finnForkortelseForDokumenttype,
    getDokumenttypeFraForkortelse,
    getEnvironmentVariable,
    getPathFraDokumenttype,
    getPathFraForkortelse,
} from '../../../utils';
import HåndterInntektsmeldingUtenKrav from '../HåndterInntektsmeldingUtenKrav';
import OkGaaTilLosModal from '../OkGaaTilLosModal';
import FagsakSelect from './FagsakSelect';
import DokumentTypeVelger from './Komponenter/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgAvBehandlingsÅr from './Komponenter/ValgAvBehandlingsÅr';
import KlassifiserModal from './Komponenter/KlassifiserModal';
import { Pleietrengende } from './Komponenter/Pleietrengende';

import './fordeling.less';
import { KopiereJournalpostUtenBarn } from './Komponenter/KopiereJournalpostUtenBarn/KopiereJournalpostUtenBarn';

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
    kopierJournalpost: typeof kopierJournalpost;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    resetOmfordelAction: typeof opprettGosysOppgaveResetAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
    setErSøkerIdBekreftet: typeof setErSøkerIdBekreftetAction;
    resetIdentStateAction: typeof resetIdentState;
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
        resetBarn,
    } = props;

    const { fagsak: valgtFagsak, dokumenttype } = fordelingState;

    const navigate = useNavigate();

    const [visKlassifiserModal, setVisKlassifiserModal] = useState(false);
    const [fortsettEtterKlassifiseringModal, setFortsettEtterKlassifiseringModal] = useState(false);
    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);
    const [harLagretBehandlingsår, setHarLagretBehandlingsår] = useState(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [visGaaTilLos, setVisGaaTilLos] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [brukEksisterendeFagsak, setBrukEksisterendeFagsak] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const [disableRadios, setDisableRadios] = useState<boolean | undefined>(undefined);
    const [barnMedFagsak, setBarnMedFagsak] = useState<Fagsak | undefined>(undefined);
    const [ingenInfoOmPleitrengende, setIngenInfoOmPleitrengende] = useState<boolean>(false);

    const harFagsaker = fagsaker?.length > 0;

    const isDokumenttypeMedPleietrengende =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
        dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO;

    const isBarn = dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE;

    const sakstyperMedPleietrengende = [
        DokumenttypeForkortelse.PSB,
        DokumenttypeForkortelse.OMP_KS,
        DokumenttypeForkortelse.PPN,
        DokumenttypeForkortelse.OLP,
        DokumenttypeForkortelse.OMP_AO,
    ];

    const isSakstypeMedPleietrengende =
        journalpost.sak?.sakstype && sakstyperMedPleietrengende.includes(journalpost.sak?.sakstype);

    const settBehandlingsÅrMutation = useMutation(
        ({ journalpostId, søkerId }: { journalpostId: string; søkerId: string }) =>
            postBehandlingsAar(journalpostId, søkerId, behandlingsAar),
        { onSuccess: () => setHarLagretBehandlingsår(true) },
    );

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
            setBrukEksisterendeFagsak(false);
            setIngenInfoOmPleitrengende(false);
        }
    }, [dokumenttype, identState.søkerId]);

    /**
     * Reset behandlingsår ved endring av dokumenttype eller søkerId
     */
    useEffect(() => {
        setHarLagretBehandlingsår(false);
    }, [dokumenttype, identState.søkerId, valgtFagsak, behandlingsAar]);

    useEffect(() => {
        if (!brukEksisterendeFagsak && fagsaker) {
            setBarnMedFagsak(fagsaker.find((f) => f.pleietrengendeIdent === identState.pleietrengendeId));
        }
        if (brukEksisterendeFagsak) {
            setBarnMedFagsak(undefined);
        }
    }, [identState.pleietrengendeId]);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const dokumenttyperOmpUt = [FordelingDokumenttype.OMSORGSPENGER_UT, FordelingDokumenttype.KORRIGERING_IM];

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visFagsakSelect =
        gjelderPsbOmsOlp && harFagsaker && identState.søkerId.length === 11 && !jpErFerdigstiltOgUtenPleietrengende;

    const visPleietrengendeComponent =
        gjelderPsbOmsOlp && !isFetchingFagsaker && !brukEksisterendeFagsak && !ingenInfoOmPleitrengende;

    const visPleietrengende =
        visSokersBarn && isDokumenttypeMedPleietrengende && !IdentRules.erUgyldigIdent(identState.søkerId);

    const visValgAvBehandlingsaar =
        dokumenttype &&
        dokumenttyperOmpUt.includes(dokumenttype) &&
        identState.søkerId.length === 11 &&
        !brukEksisterendeFagsak &&
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
                    if (filtrerteFagsaker.length > 0 && !jpErFerdigstiltOgUtenPleietrengende) {
                        setBrukEksisterendeFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

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
            if (harFagsaker && brukEksisterendeFagsak && !ingenInfoOmPleitrengende) {
                return !valgtFagsak;
            }

            if (barnMedFagsak) {
                return true;
            }

            if (
                !barnetHarIkkeFnr &&
                !ingenInfoOmPleitrengende &&
                IdentRules.erUgyldigIdent(identState.pleietrengendeId)
            ) {
                return true;
            }
        }
        if (dokumenttype && dokumenttyperOmpUt.includes(dokumenttype) && !behandlingsAar && !harLagretBehandlingsår) {
            return true;
        }

        return IdentRules.erUgyldigIdent(identState.søkerId);
    };

    const handleSøkerIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ident = event.target.value.replace(/\D+/, '');
        setSokersIdent(ident);
        if (ident.length === 11) {
            setIdentAction(ident, identState.pleietrengendeId);
            setErSøkerIdBekreftet(true);
            setVisSokersBarn(true);
        }
    };

    const handleSøkerIdBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIdentAction(event.target.value, identState.pleietrengendeId);
        setErSøkerIdBekreftet(true);
        setVisSokersBarn(true);
    };

    const handleJournalfør = (fortsett: boolean) => {
        if (
            identState.søkerId &&
            identState.pleietrengendeId &&
            identState.annenSokerIdent &&
            journalpost?.journalpostId &&
            journalpost?.kanKopieres &&
            !erInntektsmeldingUtenKrav
        ) {
            // Kopier journalpost hvis det er en annen søker i PSB
            props.kopierJournalpost(
                identState.søkerId,
                identState.pleietrengendeId,
                identState.annenSokerIdent,
                journalpost.journalpostId,
                props.dedupkey,
            );
        }

        // Trenges det å lagre behandlingsår ikke i OMS?
        settBehandlingsÅrMutation.mutate({
            journalpostId: journalpost.journalpostId,
            søkerId: identState.søkerId,
        });

        // TODO Håndtere eller promise eller timeout? Venter på at kopierJournalpost skal bli ferdig?
        setTimeout(() => {
            if (!settBehandlingsÅrMutation.error && !settBehandlingsÅrMutation.isLoading) {
                setFortsettEtterKlassifiseringModal(fortsett);
                setVisKlassifiserModal(true);
            }
        }, 200);
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

            if (IdentRules.erUgyldigIdent(identState.pleietrengendeId)) {
                return true;
            }
        }

        return IdentRules.erUgyldigIdent(identState.søkerId);
    };

    const handleDokumenttype = (type: FordelingDokumenttype) => {
        if (type === FordelingDokumenttype.ANNET) {
            if (!identState.søkerId && !!journalpost?.norskIdent) {
                setSokersIdent(journalpost?.norskIdent);
                setIdentAction(journalpost?.norskIdent, identState.pleietrengendeId);
            } else {
                setSokersIdent(identState.søkerId);
            }
        } else {
            setSokersIdent('');
            setIdentAction('', identState.pleietrengendeId);
        }
        setRiktigIdentIJournalposten(undefined);
        setDokumenttype(type);
    };

    const setValgtFagsak = (fagsakId: string) => {
        const nyValgtFagsak = fagsaker.find((fagsak) => fagsak.fagsakId === fagsakId);

        setIdentAction(identState.søkerId, nyValgtFagsak?.pleietrengendeIdent || '', identState.annenSokerIdent);
        setFagsak(nyValgtFagsak);

        if (nyValgtFagsak && nyValgtFagsak.gyldigPeriode) {
            setBehandlingsAar(String(dayjs(nyValgtFagsak.gyldigPeriode.fom).year()));
        }
    };

    const handleDokumentUtenPleietrengendeCheckbox = (checked: boolean) => {
        if (checked) {
            setIngenInfoOmPleitrengende(true);
            setBehandlingsAar(undefined);
            setValgtFagsak('');
        } else {
            setIngenInfoOmPleitrengende(false);
        }
    };

    if (opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <Loader size="large" />;
    }

    if (opprettIGosysState.gosysOppgaveRequestSuccess && visGaaTilLos) {
        return (
            <Modal
                key="opprettigosysokmodal"
                onBeforeClose={() => {
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
                onBeforeClose={() => {
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
                                        resetIdentStateAction();
                                        resetBarn();
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
                                    handleSøkerIdBlur={handleSøkerIdBlur}
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
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                identState={identState}
                                fellesState={fellesState}
                                setIdentAction={setIdentAction}
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
                                    brukEksisterendeFagsak={brukEksisterendeFagsak}
                                    fagsaker={fagsaker}
                                    identState={identState}
                                    ingenInfoOmBarnIDokument={ingenInfoOmPleitrengende}
                                    setBrukEksisterendeFagsak={setBrukEksisterendeFagsak}
                                    setIdentAction={setIdentAction}
                                    setValgtFagsak={setValgtFagsak}
                                    valgtFagsak={valgtFagsak}
                                    setBehandlingsAar={setBehandlingsAar}
                                    barn={fellesState.barn}
                                />
                            )}

                            {visFagsakSelect && !jpErFerdigstiltOgUtenPleietrengende && (
                                <>
                                    <Checkbox
                                        onChange={(e) => handleDokumentUtenPleietrengendeCheckbox(e.target.checked)}
                                        disabled={!brukEksisterendeFagsak}
                                    >
                                        <FormattedMessage
                                            id={`fordeling.checkbox.dokumentUten.${isBarn ? 'barn' : 'pleitrengende'}`}
                                        />
                                    </Checkbox>

                                    {ingenInfoOmPleitrengende && (
                                        <Alert size="small" variant="info" className="mb-4">
                                            Du kan journalføre uten å koble til pleietrengende, men kan ikke sende
                                            opplysninger til K9. Hvis du fortsetter kan du registrere opplysningene fra
                                            dokumentet, men må sette punsj-oppgaven på vent.
                                        </Alert>
                                    )}
                                </>
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
                                    visFagsakSelect={visFagsakSelect}
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
                                        <KopiereJournalpostUtenBarn barnMedFagsak={barnMedFagsak} />
                                    </div>
                                </>
                            )}
                            {!journalpost.erFerdigstilt &&
                                !valgtFagsak &&
                                !disableJournalførKnapper() &&
                                identState.pleietrengendeId && (
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
                                            onClick={() => handleJournalfør(true)}
                                            disabled={disableJournalførKnapper()}
                                            loading={settBehandlingsÅrMutation.isLoading}
                                        >
                                            <FormattedMessage id="fordeling.knapp.journalfør.fortsett" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleJournalfør(false)}
                                        disabled={disableJournalførKnapper()}
                                        loading={settBehandlingsÅrMutation.isLoading}
                                    >
                                        <FormattedMessage id="fordeling.knapp.journalfør.kø" />
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
                                            loading={settBehandlingsÅrMutation.isLoading}
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

                        {!settBehandlingsÅrMutation.error &&
                            !settBehandlingsÅrMutation.isLoading &&
                            visKlassifiserModal && (
                                <KlassifiserModal
                                    lukkModal={() => setVisKlassifiserModal(false)}
                                    setFagsak={(sak: Fagsak) => setFagsak(sak)}
                                    fortsett={fortsettEtterKlassifiseringModal}
                                />
                            )}
                        <VerticalSpacer sixteenPx />
                        {!!settBehandlingsÅrMutation.error && (
                            <Alert size="small" variant="error">
                                <FormattedMessage id="fordeling.error.settBehandlingsÅrMutation" />
                            </Alert>
                        )}
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
    kopierJournalpost: (
        søkerId: string,
        pleietrengendeId: string,
        annenIdent: string,
        dedupkey: string,
        journalpostId: string,
    ) => dispatch(kopierJournalpost(søkerId, annenIdent, pleietrengendeId, journalpostId, dedupkey)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    resetOmfordelAction: () => dispatch(opprettGosysOppgaveResetAction()),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
    resetIdentStateAction: () => dispatch(resetIdentState()),
    resetBarn: () => dispatch(resetBarnAction()),
    resetAllState: () => dispatch(resetAllStateAction()),
});

const Fordeling = connect(mapStateToProps, mapDispatchToProps)(FordelingComponent);

export { Fordeling, FordelingComponent };
