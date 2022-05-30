import { FordelingDokumenttype, JaNei, Sakstype } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IFordelingState, IJournalpost } from 'app/models/types';
import FordelingSettPaaVentState from 'app/models/types/FordelingSettPaaVentState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    resetSkalTilK9,
    setErIdent1BekreftetAction,
    setSakstypeAction,
    sjekkOmSkalTilK9Sak,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel, AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { PopoverOrientering } from 'nav-frontend-popover';
import { Checkbox, RadioPanelGruppe } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Systemtittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { erUgyldigIdent } from 'app/rules/valideringer';
import FormPanel from '../../../components/FormPanel';
import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../../components/pdf/PdfVisning';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { ISakstypeDefault } from '../../../models/Sakstype';
import FordelingFerdigstillJournalpostState from '../../../models/types/FordelingFerdigstillJournalpostState';
import { IGosysOppgaveState } from '../../../models/types/GosysOppgaveState';
import { IIdentState } from '../../../models/types/IdentState';
import { Sakstyper } from '../../SakstypeImpls';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../../../state/actions/GosysOppgaveActions';
import { resetIdentState, setIdentFellesAction } from '../../../state/actions/IdentActions';
import { IFellesState, kopierJournalpost } from '../../../state/reducers/FellesReducer';
import OkGaaTilLosModal from '../OkGaaTilLosModal';
import './fordeling.less';
import { GosysGjelderKategorier } from './Komponenter/GoSysGjelderKategorier';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import JournalPostKopiFelmeldinger from './Komponenter/JournalPostKopiFelmeldinger';
import { Pleietrengende } from './Komponenter/Pleietrengende';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgForDokument from './Komponenter/ValgForDokument';
import HåndterInntektsmeldingUtenKrav from '../HåndterInntektsmeldingUtenKrav';
import { getEnvironmentVariable } from '../../../utils';
import { FagsakYtelseType } from '../../../models/types/RequestBodies';
import AnnenPart from './Komponenter/AnnenPart';

export interface IFordelingStateProps {
    journalpost: IJournalpost;
    fordelingState: IFordelingState;
    journalpostId: string;
    identState: IIdentState;
    opprettIGosysState: IGosysOppgaveState;
    fellesState: IFellesState;
    dedupkey: string;
    fordelingSettPåVentState: FordelingSettPaaVentState;
    fordelingFerdigstillState: FordelingFerdigstillJournalpostState;
}

export interface IFordelingDispatchProps {
    setSakstypeAction: typeof setSakstypeAction;
    omfordel: typeof omfordelAction;
    setIdentAction: typeof setIdentFellesAction;
    sjekkOmSkalTilK9: typeof sjekkOmSkalTilK9Sak;
    kopierJournalpost: typeof kopierJournalpost;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    resetOmfordelAction: typeof opprettGosysOppgaveResetAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
    setErIdent1Bekreftet: typeof setErIdent1BekreftetAction;
    resetIdentStateAction: typeof resetIdentState;
    resetSjekkSkalTilK9: typeof resetSkalTilK9;
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
        setErIdent1Bekreftet,
        setSakstypeAction: sakstypeAction,
        resetIdentStateAction,
        resetSjekkSkalTilK9,
    } = props;
    const { sakstype } = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        []
    );

    const konfigForValgtSakstype = useMemo(() => sakstyper.find((st) => st.navn === sakstype), [sakstype]);

    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);

    const [dokumenttype, setDokumenttype] = useState<FordelingDokumenttype>();

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);
    const [visValgForDokument, setVisValgForDokument] = useState<boolean>(false);

    useEffect(() => {
        resetSjekkSkalTilK9();
        setVisValgForDokument(false);
    }, [dokumenttype]);

    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();

    const [skalJournalpostSomIkkeStottesKopieres, setSkalJournalpostSomIkkeStottesKopieres] = useState<boolean>(false);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const erJournalfoertEllerFerdigstilt =
        journalpost?.journalpostStatus === journalpostStatus.JOURNALFOERT ||
        journalpost?.journalpostStatus === journalpostStatus.FERDIGSTILT;

    const gjelderPleiepengerEllerOmsorgspenger =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA ||
        dokumenttype === FordelingDokumenttype.KORRIGERING_IM;

    const stoppInnsendingAvPLS =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE &&
        fordelingState.skalTilK9 &&
        getEnvironmentVariable('PLS_FORHINDRE_INNSENDING_TIL_K9') === 'true';

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const disableVidereMidlertidigAlene =
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
        (!identState.annenPart || !!(identState.annenPart && erUgyldigIdent(identState.annenPart)));

    const disableVidereKnapp =
        ((dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) &&
            erUgyldigIdent(identState.ident2) &&
            !barnetHarIkkeFnr) ||
        erUgyldigIdent(identState.ident1) ||
        disableVidereMidlertidigAlene;

    const handleIdent1Change = (event: any) => {
        const ident = event.target.value.replace(/\D+/, '');
        setSokersIdent(ident);
        if (ident.length === 11) {
            setIdentAction(ident, identState.ident2);
            setErIdent1Bekreftet(true);
            setVisSokersBarn(true);
        }
    };

    const handleIdent1Blur = (event: any) => {
        setIdentAction(event.target.value, identState.ident2);
        setErIdent1Bekreftet(true);
        setVisSokersBarn(true);
    };

    const ikkeSjekkSkalTilK9Dokumenttype = [FordelingDokumenttype.KORRIGERING_IM];

    const visPleietrengende =
        visSokersBarn &&
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) &&
        !erUgyldigIdent(identState.ident1);

    const utledFagsakYtelseType = (dokumentType: FordelingDokumenttype | undefined): FagsakYtelseType => {
        switch (dokumentType) {
            case FordelingDokumenttype.OMSORGSPENGER_KS:
                return FagsakYtelseType.OMSORGSPENGER_KS;
            case FordelingDokumenttype.PLEIEPENGER:
                return FagsakYtelseType.PLEIEPENGER_SYKT_BARN;
            case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
                return FagsakYtelseType.PLEIEPENGER_NÆRSTÅENDE;
            case FordelingDokumenttype.KORRIGERING_IM:
                return FagsakYtelseType.OMSORGSPENGER;
            case FordelingDokumenttype.OMSORGSPENGER_MA:
                return FagsakYtelseType.OMSORGSPENGER_MA;
            default:
                throw new Error(`${dokumentType} har ikke en tilsvarende FagsakYtelseType mapping.`);
        }
    };

    const handleVidereClick = (dokumentType: FordelingDokumenttype) => {
        if (
            identState.ident1 &&
            identState.ident2 &&
            identState.annenSokerIdent &&
            journalpost?.journalpostId &&
            !!journalpost?.kanKopieres &&
            !erInntektsmeldingUtenKrav
        ) {
            props.kopierJournalpost(
                identState.ident1,
                identState.ident2,
                identState.annenSokerIdent,
                props.dedupkey,
                journalpost.journalpostId
            );
        }

        const fagsakYtelseType = utledFagsakYtelseType(dokumentType);

        if (ikkeSjekkSkalTilK9Dokumenttype.includes(dokumentType)) {
            setVisValgForDokument(true);
        } else {
            props.sjekkOmSkalTilK9(
                identState.ident1,
                identState.ident2,
                journalpost.journalpostId,
                fagsakYtelseType,
                identState.annenPart
            );
        }
    };

    const kopierJournalpostOgLukkOppgave = () => {
        if (identState.ident1 && identState.ident2 && journalpost?.journalpostId) {
            props.kopierJournalpost(
                identState.ident1,
                identState.ident2,
                identState.ident1,
                props.dedupkey,
                journalpost?.journalpostId
            );
        }
    };

    const handleDokumenttype = (type: FordelingDokumenttype) => {
        if (type === FordelingDokumenttype.ANNET) {
            if (!identState.ident1 && !!journalpost?.norskIdent) {
                setSokersIdent(journalpost?.norskIdent);
                setIdentAction(journalpost?.norskIdent, identState.ident2);
            } else {
                setSokersIdent(identState.ident1);
            }
        } else {
            setSokersIdent('');
            setIdentAction('', identState.ident2);
        }
        setRiktigIdentIJournalposten(undefined);
        setDokumenttype(type);
    };

    useEffect(() => {
        const lukkEtterJournalpostSomIkkeStottesKopieres: boolean =
            skalJournalpostSomIkkeStottesKopieres &&
            !fellesState.isAwaitingKopierJournalPostResponse &&
            !!fellesState.kopierJournalpostSuccess;

        if (
            (lukkEtterJournalpostSomIkkeStottesKopieres || !!opprettIGosysState.gosysOppgaveRequestSuccess) &&
            journalpost
        ) {
            lukkJournalpostOppgave(journalpost.journalpostId!);
        }
    }, [fellesState.isAwaitingKopierJournalPostResponse, opprettIGosysState.gosysOppgaveRequestSuccess]);

    if (opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <NavFrontendSpinner />;
    }

    if (!!opprettIGosysState.gosysOppgaveRequestSuccess && !!fordelingState.lukkOppgaveDone) {
        return (
            <ModalWrapper
                key="opprettigosysokmodal"
                onRequestClose={() => resetOmfordelAction()}
                contentLabel="settpaaventokmodal"
                closeButton={false}
                isOpen={!!opprettIGosysState.gosysOppgaveRequestSuccess}
            >
                <OkGaaTilLosModal melding="fordeling.opprettigosys.utfort" />
            </ModalWrapper>
        );
    }

    if (fordelingState.isAwaitingLukkOppgaveResponse) {
        return <NavFrontendSpinner />;
    }

    if (fordelingState.lukkOppgaveDone) {
        return (
            <ModalWrapper
                key="lukkoppgaveokmodal"
                onRequestClose={() => lukkOppgaveReset()}
                contentLabel="settpaaventokmodal"
                closeButton={false}
                isOpen={!!fordelingState.lukkOppgaveDone}
            >
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </ModalWrapper>
        );
    }

    function toggleFordelingDokumentType(type: string): boolean {
        switch (type) {
            case FordelingDokumenttype.OMSORGSPENGER_KS:
                return getEnvironmentVariable('OMP_KS_ENABLED') === 'true';

            case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
                return getEnvironmentVariable('PLS_ENABLED') === 'true';

            case FordelingDokumenttype.OMSORGSPENGER_MA:
                return getEnvironmentVariable('OMP_MA_FEATURE_TOGGLE') === 'true';

            default:
                return true;
        }
    }

    return (
        <div className="fordeling-container">
            {!!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && (
                <FormPanel>
                    <JournalpostPanel />
                    {erInntektsmeldingUtenKrav && (
                        <>
                            <VerticalSpacer thirtyTwoPx />
                            <Systemtittel>Inntektsmelding uten søknad</Systemtittel>
                            <VerticalSpacer twentyPx />
                        </>
                    )}
                    <div className="fordeling-page">
                        {!!opprettIGosysState.gosysOppgaveRequestError && (
                            <AlertStripeFeil>{intlHelper(intl, 'fordeling.omfordeling.feil')}</AlertStripeFeil>
                        )}
                        {erInntektsmeldingUtenKrav && (
                            <>
                                <AlertStripeAdvarsel className="fordeling-alertstripeFeil">
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
                                </AlertStripeAdvarsel>
                                <VerticalSpacer thirtyTwoPx />
                            </>
                        )}
                        <div>
                            {!erInntektsmeldingUtenKrav && (
                                <RadioPanelGruppe
                                    name="ppsjekk"
                                    radios={Object.values(FordelingDokumenttype)
                                        .filter((type) => toggleFordelingDokumentType(type))
                                        .map((type) => ({
                                            label: intlHelper(intl, type),
                                            value: type,
                                        }))}
                                    legend={intlHelper(intl, 'fordeling.detteGjelder')}
                                    checked={dokumenttype}
                                    onChange={(event) => {
                                        handleDokumenttype(
                                            (event.target as HTMLInputElement).value as FordelingDokumenttype
                                        );
                                        resetIdentStateAction();
                                    }}
                                />
                            )}
                            <InnholdForDokumenttypeAnnet
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                lukkJournalpostOppgave={lukkJournalpostOppgave}
                                kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys}
                                handleIdent1Blur={handleIdent1Blur}
                                handleIdent1Change={handleIdent1Change}
                                sokersIdent={sokersIdent}
                                identState={identState}
                                fordelingState={fordelingState}
                                omfordel={omfordel}
                            />
                            <SokersIdent
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                handleIdent1Blur={handleIdent1Blur}
                                handleIdent1Change={handleIdent1Change}
                                sokersIdent={sokersIdent}
                                identState={identState}
                                setVisSokersBarn={setVisSokersBarn}
                                setSokersIdent={setSokersIdent}
                                setIdentAction={setIdentAction}
                                setErIdent1Bekreftet={setErIdent1Bekreftet}
                                riktigIdentIJournalposten={riktigIdentIJournalposten}
                                setRiktigIdentIJournalposten={setRiktigIdentIJournalposten}
                                erInntektsmeldingUtenKrav={erInntektsmeldingUtenKrav}
                            />
                            <AnnenPart intl={intl} vis={dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA} />
                            <ToSoekere
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                identState={identState}
                                skalJournalpostSomIkkeStottesKopieres={skalJournalpostSomIkkeStottesKopieres}
                                fellesState={fellesState}
                                setIdentAction={setIdentAction}
                            />

                            {erInntektsmeldingUtenKrav && identState.ident1 ? (
                                <HåndterInntektsmeldingUtenKrav ident1={identState.ident1} journalpost={journalpost} />
                            ) : (
                                <VerticalSpacer twentyPx />
                            )}
                            {gjelderPleiepengerEllerOmsorgspenger && (
                                <>
                                    <Pleietrengende
                                        pleietrengendeHarIkkeFnrFn={(harBarnetFnr: boolean) =>
                                            setBarnetHarIkkeFnr(harBarnetFnr)
                                        }
                                        sokersIdent={identState.ident1}
                                        skalHenteBarn={
                                            dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE
                                        }
                                        visPleietrengende={visPleietrengende}
                                    />
                                    {!fordelingState.skalTilK9 && (
                                        <Knapp
                                            mini
                                            onClick={() => handleVidereClick(dokumenttype)}
                                            disabled={disableVidereKnapp}
                                        >
                                            {intlHelper(intl, 'fordeling.knapp.videre')}
                                        </Knapp>
                                    )}
                                </>
                            )}
                        </div>
                        {stoppInnsendingAvPLS && (
                            <AlertStripeAdvarsel>
                                Søknader på Pleiepenger i livets sluttfase kan ikke behandles i K9 før 2. juni. Søknaden
                                må ligge på benken din til den kan behandles.
                            </AlertStripeAdvarsel>
                        )}
                        <VerticalSpacer sixteenPx />
                        <ValgForDokument
                            dokumenttype={dokumenttype}
                            journalpost={journalpost}
                            erJournalfoertEllerFerdigstilt={erJournalfoertEllerFerdigstilt}
                            kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys}
                            identState={identState}
                            konfigForValgtSakstype={konfigForValgtSakstype}
                            fordelingState={fordelingState}
                            setSakstypeAction={sakstypeAction}
                            visValgForDokument={visValgForDokument}
                            lukkJournalpostOppgave={lukkJournalpostOppgave}
                            omfordel={omfordel}
                            gjelderPleiepengerEllerOmsorgspenger={gjelderPleiepengerEllerOmsorgspenger}
                        />
                        {fordelingState.skalTilK9 === false && (
                            <>
                                <AlertStripeInfo className="infotrygd_info">
                                    <FormattedMessage
                                        id="fordeling.infotrygd"
                                        values={{ identifikator: identState.ident2 ? `(${identState.ident2})` : '' }}
                                    />
                                </AlertStripeInfo>
                                {!kanJournalforingsoppgaveOpprettesiGosys && (
                                    <div>
                                        <AlertStripeInfo className="fordeling-page__kanIkkeOppretteJPIGosys">
                                            <FormattedMessage id="fordeling.kanIkkeOppretteJPIGosys.info" />
                                        </AlertStripeInfo>
                                        <Knapp onClick={() => lukkJournalpostOppgave(journalpost?.journalpostId)}>
                                            <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                                        </Knapp>
                                    </div>
                                )}

                                {kanJournalforingsoppgaveOpprettesiGosys && (
                                    <>
                                        <GosysGjelderKategorier />
                                        <Hovedknapp
                                            mini
                                            disabled={!fordelingState.valgtGosysKategori}
                                            onClick={() =>
                                                omfordel(
                                                    journalpost.journalpostId,
                                                    identState.ident1,
                                                    fordelingState.valgtGosysKategori
                                                )
                                            }
                                        >
                                            <FormattedMessage id="fordeling.sakstype.ANNET" />
                                        </Hovedknapp>
                                    </>
                                )}
                            </>
                        )}

                        <VerticalSpacer sixteenPx />
                        {!!fordelingState.sjekkTilK9Error && (
                            <AlertStripeFeil>{intlHelper(intl, 'fordeling.infortygd.error')}</AlertStripeFeil>
                        )}
                        {!!fordelingState.sjekkTilK9JournalpostStottesIkke && (
                            <div className="fordeling-page__sjekk-til-K9-journalpost-stottes-ikke">
                                <AlertStripeFeil>
                                    {intlHelper(intl, 'fordeling.infotrygd.journalpoststottesikke')}
                                </AlertStripeFeil>
                                <VerticalSpacer sixteenPx />
                                <div className="journalikkestottetkopi-checkboks">
                                    <Checkbox
                                        label={intlHelper(intl, 'fordeling.kopiereJournal')}
                                        onChange={(e) => {
                                            setSkalJournalpostSomIkkeStottesKopieres(e.target.checked);
                                        }}
                                        disabled={erInntektsmeldingUtenKrav}
                                    />
                                    <Hjelpetekst
                                        className="journalikkestottetkopi-checkboks__hjelpetekst"
                                        type={PopoverOrientering.Hoyre}
                                        tabIndex={-1}
                                    >
                                        {intlHelper(intl, 'fordeling.kopiereJournal.hjelpetekst')}
                                    </Hjelpetekst>
                                </div>
                                <JournalPostKopiFelmeldinger
                                    skalVisesNårJournalpostSomIkkeStottesKopieres={
                                        skalJournalpostSomIkkeStottesKopieres
                                    }
                                    fellesState={fellesState}
                                    intl={intl}
                                />
                                {!!fellesState.isAwaitingKopierJournalPostResponse && <NavFrontendSpinner />}
                                <Knapp
                                    onClick={() => {
                                        if (skalJournalpostSomIkkeStottesKopieres) {
                                            kopierJournalpostOgLukkOppgave();
                                        } else {
                                            lukkJournalpostOppgave(journalpost?.journalpostId);
                                        }
                                    }}
                                >
                                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                                </Knapp>
                            </div>
                        )}
                        {!!fordelingState.isAwaitingSjekkTilK9Response && <NavFrontendSpinner />}
                    </div>
                </FormPanel>
            )}
            {!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && <JournalpostAlleredeBehandlet />}
            {!journalpost?.erSaksbehandler && (
                <div>
                    <AlertStripeAdvarsel>{intlHelper(intl, 'fordeling.ikkesaksbehandler')}</AlertStripeAdvarsel>
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
    fordelingSettPåVentState: state.fordelingSettPåVentState,
    fordelingFerdigstillState: state.fordelingFerdigstillJournalpostState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setSakstypeAction: (sakstype: Sakstype) => dispatch(setSakstypeAction(sakstype)),
    omfordel: (journalpostid: string, norskIdent: string, gosysKategori: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent, gosysKategori)),
    setIdentAction: (ident1: string, ident2: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(ident1, ident2, annenSokerIdent)),
    setErIdent1Bekreftet: (erBekreftet: boolean) => dispatch(setErIdent1BekreftetAction(erBekreftet)),
    sjekkOmSkalTilK9: (
        ident1: string,
        ident2: string,
        jpid: string,
        fagsakYtelseType: FagsakYtelseType,
        annenPart: string
    ) => dispatch(sjekkOmSkalTilK9Sak(ident1, ident2, jpid, fagsakYtelseType, annenPart)),
    resetSjekkSkalTilK9: () => dispatch(resetSkalTilK9()),
    kopierJournalpost: (ident1: string, ident2: string, annenIdent: string, dedupkey: string, journalpostId: string) =>
        dispatch(kopierJournalpost(ident1, annenIdent, ident2, journalpostId, dedupkey)),
    lukkJournalpostOppgave: (jpid: string) => dispatch(lukkJournalpostOppgaveAction(jpid)),
    resetOmfordelAction: () => dispatch(opprettGosysOppgaveResetAction()),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
    resetIdentStateAction: () => dispatch(resetIdentState()),
});

const Fordeling = injectIntl(connect(mapStateToProps, mapDispatchToProps)(FordelingComponent));

export { Fordeling, FordelingComponent };
