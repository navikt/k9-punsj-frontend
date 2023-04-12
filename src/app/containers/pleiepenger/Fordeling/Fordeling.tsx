import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { connect } from 'react-redux';

import { Alert, Button, ErrorMessage, Heading, Loader, Modal } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import { FordelingDokumenttype, JaNei, Sakstype } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
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

import FormPanel from '../../../components/FormPanel';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../../components/pdf/PdfVisning';
import { ISakstypeDefault } from '../../../models/Sakstype';
import { IGosysOppgaveState } from '../../../models/types/GosysOppgaveState';
import { IIdentState } from '../../../models/types/IdentState';
import { setDokumenttypeAction, setFagsakAction } from '../../../state/actions/FordelingActions';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../../../state/actions/GosysOppgaveActions';
import { resetIdentState, setIdentFellesAction } from '../../../state/actions/IdentActions';
import { IFellesState, kopierJournalpost, resetBarnAction } from '../../../state/reducers/FellesReducer';
import { finnForkortelseForDokumenttype, finnVisningsnavnForSakstype, post } from '../../../utils';
import { Sakstyper } from '../../SakstypeImpls';
import HåndterInntektsmeldingUtenKrav from '../HåndterInntektsmeldingUtenKrav';
import OkGaaTilLosModal from '../OkGaaTilLosModal';
import FagsakSelect from './FagsakSelect';
import AnnenPart from './Komponenter/AnnenPart';
import DokumentTypeVelger from './Komponenter/DokumentTypeVelger';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import { Pleietrengende } from './Komponenter/Pleietrengende';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgForDokument from './Komponenter/ValgForDokument';
import './fordeling.less';

export interface IFordelingStateProps {
    journalpost: IJournalpost;
    fordelingState: IFordelingState;
    journalpostId: string;
    identState: IIdentState;
    opprettIGosysState: IGosysOppgaveState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IFordelingDispatchProps {
    setSakstypeAction: typeof setSakstypeAction;
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

export type IFordelingProps = WrappedComponentProps & IFordelingStateProps & IFordelingDispatchProps;

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (props: IFordelingProps) => {
    const {
        intl,
        fordelingState,
        omfordel,
        journalpost,
        identState,
        opprettIGosysState,
        lukkJournalpostOppgave,
        resetOmfordelAction,
        lukkOppgaveReset,
        fellesState,
        setIdentAction,
        setErSøkerIdBekreftet,
        setSakstypeAction: sakstypeAction,
        setFagsakAction: setFagsak,
        resetIdentStateAction,
        setDokumenttype,
        resetBarn,
    } = props;
    const { sakstype, fagsak: valgtFagsak, dokumenttype } = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        [],
    );

    const konfigForValgtSakstype = useMemo(() => sakstyper.find((st) => st.navn === sakstype), [sakstype]);

    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [harLagretBehandlingsår, setHarLagretBehandlingsår] = useState(false);
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);
    const [visValgForDokument, setVisValgForDokument] = useState<boolean>(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [visGaaTilLos, setVisGaaTilLos] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [brukEksisterendeFagsak, setBrukEksisterendeFagsak] = useState(false);
    const harFagsaker = fagsaker?.length > 0;

    const settBehandlingsÅrMutation = useMutation(
        ({
            journalpostId,
            søkerId,
            behandlingsAar,
        }: {
            journalpostId: string;
            søkerId: string;
            behandlingsAar?: string;
        }) =>
            post(
                ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR,
                { journalpostId },
                { 'X-Nav-NorskIdent': søkerId },
                { behandlingsAar },
            ),
        { onSuccess: () => setHarLagretBehandlingsår(true) },
    );

    useEffect(() => {
        if (valgtFagsak) {
            setFagsak(undefined);
            setBrukEksisterendeFagsak(false);
        }
    }, [dokumenttype, identState.søkerId]);

    useEffect(() => {
        setVisValgForDokument(false);
        setHarLagretBehandlingsår(false);
    }, [dokumenttype, identState.søkerId, identState.pleietrengendeId, identState.annenPart, valgtFagsak]);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const erJournalfoertEllerFerdigstilt =
        journalpost?.journalpostStatus === journalpostStatus.JOURNALFOERT ||
        journalpost?.journalpostStatus === journalpostStatus.FERDIGSTILT;

    const dokumenttyperForPsbOmsOlp = [
        FordelingDokumenttype.PLEIEPENGER,
        FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
        FordelingDokumenttype.OMSORGSPENGER_KS,
        FordelingDokumenttype.OMSORGSPENGER_MA,
        FordelingDokumenttype.OMSORGSPENGER_UT,
        FordelingDokumenttype.KORRIGERING_IM,
        FordelingDokumenttype.OPPLAERINGSPENGER,
    ];

    const gjelderPsbOmsOlp = !!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visPleietrengendeComponent = gjelderPsbOmsOlp && !isFetchingFagsaker && !brukEksisterendeFagsak;
    const visFagsakSelect = gjelderPsbOmsOlp && harFagsaker && identState.søkerId.length === 11;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const disableVidereMidlertidigAlene =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
        (!identState.annenPart || !!(identState.annenPart && IdentRules.erUgyldigIdent(identState.annenPart)));

    const disableVidereKnapp = () => {
        if (
            dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER
        ) {
            if (harFagsaker && brukEksisterendeFagsak) {
                return !valgtFagsak;
            }
            if (IdentRules.erUgyldigIdent(identState.pleietrengendeId) && !barnetHarIkkeFnr) {
                return true;
            }
        }
        if (dokumenttype === FordelingDokumenttype.KORRIGERING_IM && harFagsaker) {
            return !valgtFagsak;
        }
        return IdentRules.erUgyldigIdent(identState.søkerId) || disableVidereMidlertidigAlene;
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

    const ikkeSjekkSkalTilK9Dokumenttype = [FordelingDokumenttype.KORRIGERING_IM];

    const visPleietrengende =
        visSokersBarn &&
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER) &&
        !IdentRules.erUgyldigIdent(identState.søkerId);

    const handleVidereClick = (dokumentType: FordelingDokumenttype) => {
        if (
            identState.søkerId &&
            identState.pleietrengendeId &&
            identState.annenSokerIdent &&
            journalpost?.journalpostId &&
            !!journalpost?.kanKopieres &&
            !erInntektsmeldingUtenKrav
        ) {
            props.kopierJournalpost(
                identState.søkerId,
                identState.pleietrengendeId,
                identState.annenSokerIdent,
                props.dedupkey,
                journalpost.journalpostId,
            );
        }

        if (ikkeSjekkSkalTilK9Dokumenttype.includes(dokumentType)) {
            setVisValgForDokument(true);
        } else {
            settBehandlingsÅrMutation.mutate({
                journalpostId: journalpost.journalpostId,
                søkerId: identState.søkerId,
                behandlingsAar: valgtFagsak?.gyldigPeriode?.fom
                    ? String(dayjs(valgtFagsak?.gyldigPeriode.fom).year())
                    : undefined,
            });
        }
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
        if (identState.søkerId && dokumenttype && gjelderPsbOmsOlp) {
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

    if (opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <Loader size="large" />;
    }

    if (!!opprettIGosysState.gosysOppgaveRequestSuccess && visGaaTilLos) {
        return (
            <Modal
                key="opprettigosysokmodal"
                onClose={() => {
                    resetOmfordelAction();
                    setVisGaaTilLos(false);
                }}
                aria-label="settpaaventokmodal"
                closeButton={false}
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
                onClose={() => lukkOppgaveReset()}
                aria-label="settpaaventokmodal"
                closeButton={false}
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
    };

    return (
        <div className="fordeling-container">
            {!!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && (
                <FormPanel>
                    <JournalpostPanel />
                    {erInntektsmeldingUtenKrav && (
                        <>
                            <VerticalSpacer thirtyTwoPx />
                            <Heading level="1" size="medium">
                                Inntektsmelding uten søknad
                            </Heading>
                            <VerticalSpacer twentyPx />
                        </>
                    )}
                    <div className="fordeling-page">
                        {!!opprettIGosysState.gosysOppgaveRequestError && (
                            <Alert size="small" variant="error">
                                {intlHelper(intl, 'fordeling.omfordeling.feil')}
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
                                    setVisSokersBarn={setVisSokersBarn}
                                    setSokersIdent={setSokersIdent}
                                    setIdentAction={setIdentAction}
                                    setErSøkerIdBekreftet={setErSøkerIdBekreftet}
                                    riktigIdentIJournalposten={riktigIdentIJournalposten}
                                    setRiktigIdentIJournalposten={setRiktigIdentIJournalposten}
                                    erInntektsmeldingUtenKrav={erInntektsmeldingUtenKrav}
                                />
                            )}
                            <AnnenPart vis={dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA} />
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
                                />
                            )}
                            {henteFagsakFeilet && <ErrorMessage>Henting av fagsak feilet</ErrorMessage>}
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
                                />
                            )}
                            {gjelderPsbOmsOlp && !isFetchingFagsaker && !harLagretBehandlingsår && (
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => handleVidereClick(dokumenttype)}
                                    disabled={disableVidereKnapp()}
                                >
                                    {intlHelper(intl, 'fordeling.knapp.videre')}
                                </Button>
                            )}
                        </div>
                        <VerticalSpacer sixteenPx />
                        <ValgForDokument
                            dokumenttype={dokumenttype}
                            journalpost={journalpost}
                            erJournalfoertEllerFerdigstilt={erJournalfoertEllerFerdigstilt}
                            kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys}
                            identState={identState}
                            konfigForValgtSakstype={konfigForValgtSakstype}
                            fordelingState={fordelingState}
                            harLagretBehandlingsår={harLagretBehandlingsår}
                            setSakstypeAction={sakstypeAction}
                            visValgForDokument={visValgForDokument}
                            lukkJournalpostOppgave={lukkJournalpostOppgave}
                            omfordel={omfordel}
                            gjelderPsbOmsOlp={gjelderPsbOmsOlp}
                        />

                        <VerticalSpacer sixteenPx />
                        {settBehandlingsÅrMutation.error && (
                            <Alert size="small" variant="error">
                                {intlHelper(intl, 'fordeling.error')}
                            </Alert>
                        )}

                        {settBehandlingsÅrMutation.isLoading && <Loader size="large" />}
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

            {journalpost && (
                <PdfVisning
                    journalpostDokumenter={[
                        { journalpostid: journalpost?.journalpostId, dokumenter: journalpost?.dokumenter },
                    ]}
                />
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

const Fordeling = injectIntl(connect(mapStateToProps, mapDispatchToProps)(FordelingComponent));

export { Fordeling, FordelingComponent };
