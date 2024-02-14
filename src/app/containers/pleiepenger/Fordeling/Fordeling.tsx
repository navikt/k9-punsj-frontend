import React, { useEffect, useState } from 'react';

import { Alert, Button, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';
import { finnFagsaker, postBehandlingsAar } from 'app/api/api';
import { FordelingDokumenttype, JaNei, Sakstype, dokumenttyperForPsbOmsOlp } from 'app/models/enums';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    setErSøkerIdBekreftetAction,
    setSakstypeAction,
} from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';
import intlHelper from 'app/utils/intlUtils';
import { ROUTES } from 'app/constants/routes';
import dayjs from 'dayjs';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
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
    finnVisningsnavnForSakstype,
    getDokumenttypeFraForkortelse,
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
    kopierJournalpost: typeof kopierJournalpost;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    resetOmfordelAction: typeof opprettGosysOppgaveResetAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
    setErSøkerIdBekreftet: typeof setErSøkerIdBekreftetAction;
    resetIdentStateAction: typeof resetIdentState;
    resetBarn: typeof resetBarnAction;
}

export type IFordelingProps = IFordelingStateProps & IFordelingDispatchProps;

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

    const intl = useIntl();
    const navigate = useNavigate();

    const [visKlassifiserModal, setVisKlassifiserModal] = useState(false);
    const [fortsettEtterKlassifiseringModal, setFortsettEtterKlassifiseringModal] = useState(false);

    const { sakstype, fagsak: valgtFagsak, dokumenttype } = fordelingState;

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [harLagretBehandlingsår, setHarLagretBehandlingsår] = useState(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [visGaaTilLos, setVisGaaTilLos] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [brukEksisterendeFagsak, setBrukEksisterendeFagsak] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const harFagsaker = fagsaker?.length > 0;

    const settBehandlingsÅrMutation = useMutation(
        ({ journalpostId, søkerId }: { journalpostId: string; søkerId: string }) =>
            postBehandlingsAar(journalpostId, søkerId, behandlingsAar),
        { onSuccess: () => setHarLagretBehandlingsår(true) },
    );

    useEffect(() => {
        if (journalpost.erFerdigstilt && journalpost.fagsakYtelseType && journalpost?.norskIdent) {
            const fagsakYtelsePath = getPathFraForkortelse(journalpost.fagsakYtelseType.kode);

            // set fordeling state
            setIdentAction(journalpost.norskIdent, journalpost.sak?.pleietrengendeIdent);
            setErSøkerIdBekreftet(true);
            setFagsak(journalpost.sak);
            setDokumenttype(getDokumenttypeFraForkortelse(journalpost.fagsakYtelseType.kode));

            // redirect to ferdigstilt page
            navigate(
                `${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId)}/${fagsakYtelsePath}${ROUTES.JOURNALFØR_OG_FORTSETT}`,
            );
        }
    }, []);

    useEffect(() => {
        if (valgtFagsak && !journalpost.erFerdigstilt) {
            setFagsak(undefined);
            setBrukEksisterendeFagsak(false);
        }
    }, [dokumenttype, identState.søkerId]);

    useEffect(() => {
        setHarLagretBehandlingsår(false);
    }, [dokumenttype, identState.søkerId, valgtFagsak, behandlingsAar]);

    useEffect(() => {
        if (sakstype && !journalpost.erFerdigstilt) {
            setSakstypeAction(undefined);
        }
    }, [dokumenttype]);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const dokumenttyperOmput = [FordelingDokumenttype.OMSORGSPENGER_UT, FordelingDokumenttype.KORRIGERING_IM];

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visFagsakSelect = gjelderPsbOmsOlp && harFagsaker && identState.søkerId.length === 11;
    const visValgAvBehandlingsaar =
        dokumenttype &&
        dokumenttyperOmput.includes(dokumenttype) &&
        identState.søkerId.length === 11 &&
        !brukEksisterendeFagsak;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const disableVidereMidlertidigAlene =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
        (!identState.annenPart || !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)));

    const disableJournalførKnapper = () => {
        if (
            dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER
        ) {
            if (harFagsaker && brukEksisterendeFagsak) {
                return !valgtFagsak;
            }
        }
        if (dokumenttype && dokumenttyperOmput.includes(dokumenttype) && !behandlingsAar && !harLagretBehandlingsår) {
            return true;
        }

        return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene;
    };

    const handleSøkerIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ident = event.target.value.replace(/\D+/, '');
        setSokersIdent(ident);
        if (ident.length === 11) {
            setIdentAction(ident, identState.pleietrengendeId);
            setErSøkerIdBekreftet(true);
        }
    };

    const handleSøkerIdBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIdentAction(event.target.value, identState.pleietrengendeId);
        setErSøkerIdBekreftet(true);
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
                props.dedupkey,
                journalpost.journalpostId,
            );
        }

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

    useEffect(() => {
        if (opprettIGosysState.gosysOppgaveRequestSuccess) {
            setVisGaaTilLos(true);
        }
    }, [fellesState.isAwaitingKopierJournalPostResponse, opprettIGosysState.gosysOppgaveRequestSuccess]);

    useEffect(() => {
        if (!journalpost.erFerdigstilt && identState.søkerId && dokumenttype && gjelderPsbOmsOlp) {
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
                    if (filtrerteFagsaker.length > 0) {
                        setBrukEksisterendeFagsak(true);
                    }
                } else {
                    setHenteFagsakFeilet(true);
                }
            });
        }
    }, [identState.søkerId, dokumenttype, gjelderPsbOmsOlp]);

    // TODO SLETTE GOSYS?
    if (opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <Loader size="large" />;
    }

    // TODO SLETTE GOSYS?
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

    // TODO vise i senter av skjerm
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

    const setValgtFagsak = (fagsakId: string) => {
        const nyValgtFagsak = fagsaker.find((fagsak) => fagsak.fagsakId === fagsakId);
        setIdentAction(identState.søkerId, nyValgtFagsak?.pleietrengendeIdent || '', identState.annenSokerIdent);
        setFagsak(nyValgtFagsak);
        if (nyValgtFagsak && nyValgtFagsak.gyldigPeriode) {
            setBehandlingsAar(String(dayjs(nyValgtFagsak.gyldigPeriode.fom).year()));
        }
    };

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
                                        // TODO Trenges det?
                                        resetBarn();
                                    }}
                                    valgtDokumentType={dokumenttype as string}
                                />
                            )}
                            {dokumenttype === FordelingDokumenttype.ANNET && (
                                <InnholdForDokumenttypeAnnet
                                    dokumenttype={dokumenttype}
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
                            {dokumenttype !== FordelingDokumenttype.OMSORGSPENGER && (
                                <SokersIdent
                                    dokumenttype={dokumenttype}
                                    journalpost={journalpost}
                                    handleSøkerIdBlur={handleSøkerIdBlur}
                                    handleSøkerIdChange={handleSøkerIdChange}
                                    sokersIdent={sokersIdent}
                                    identState={identState}
                                    setSokersIdent={setSokersIdent}
                                    setIdentAction={setIdentAction}
                                    setErSøkerIdBekreftet={setErSøkerIdBekreftet}
                                    riktigIdentIJournalposten={riktigIdentIJournalposten}
                                    setRiktigIdentIJournalposten={setRiktigIdentIJournalposten}
                                    erInntektsmeldingUtenKrav={erInntektsmeldingUtenKrav}
                                />
                            )}

                            <ToSoekere
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                identState={identState}
                                fellesState={fellesState}
                                setIdentAction={setIdentAction}
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
                                    finnVisningsnavnForSakstype={finnVisningsnavnForSakstype}
                                    identState={identState}
                                    setBrukEksisterendeFagsak={setBrukEksisterendeFagsak}
                                    setIdentAction={setIdentAction}
                                    setValgtFagsak={setValgtFagsak}
                                    valgtFagsak={valgtFagsak}
                                    setBehandlingsAar={setBehandlingsAar}
                                    barn={fellesState.barn}
                                />
                            )}
                            {visValgAvBehandlingsaar && <ValgAvBehandlingsÅr onChange={setBehandlingsAar} />}
                            {henteFagsakFeilet && <ErrorMessage>Henting av fagsak feilet</ErrorMessage>}
                            {isFetchingFagsaker && <Loader />}

                            {gjelderPsbOmsOlp && !isFetchingFagsaker && (
                                <div className="flex">
                                    <div className="mr-4">
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => handleJournalfør(true)}
                                            disabled={disableJournalførKnapper()}
                                            loading={settBehandlingsÅrMutation.isLoading}
                                        >
                                            {intlHelper(intl, 'fordeling.knapp.journalfør.fortsett')}
                                        </Button>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleJournalfør(false)}
                                        disabled={disableJournalførKnapper()}
                                        loading={settBehandlingsÅrMutation.isLoading}
                                    >
                                        {intlHelper(intl, 'fordeling.knapp.journalfør.kø')}
                                    </Button>
                                </div>
                            )}
                        </div>
                        {!settBehandlingsÅrMutation.error &&
                            !settBehandlingsÅrMutation.isLoading &&
                            visKlassifiserModal && (
                                <KlassifiserModal
                                    lukkModal={() => setVisKlassifiserModal(false)}
                                    fortsett={fortsettEtterKlassifiseringModal}
                                />
                            )}

                        <VerticalSpacer sixteenPx />
                        {!!settBehandlingsÅrMutation.error && (
                            <Alert size="small" variant="error">
                                {intlHelper(intl, 'fordeling.error')}
                            </Alert>
                        )}
                    </div>
                </FormPanel>
            )}
            {!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && <JournalpostAlleredeBehandlet />}
            {!journalpost?.erSaksbehandler && (
                <div>
                    <Alert size="small" variant="warning">
                        {intlHelper(intl, 'fordeling.ikkesaksbehandler')}
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
    setSakstypeAction: (sakstype: Sakstype) => dispatch(setSakstypeAction(sakstype)),
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
});

const Fordeling = connect(mapStateToProps, mapDispatchToProps)(FordelingComponent);

export { Fordeling, FordelingComponent };
