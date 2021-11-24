import { FordelingDokumenttype, JaNei, Sakstype } from 'app/models/enums';
import { IFordelingState, IJournalpost } from 'app/models/types';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction,
    setErIdent1BekreftetAction,
    setSakstypeAction,
    sjekkOmSkalTilK9Sak,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel, AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Checkbox, RadioPanelGruppe } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { PopoverOrientering } from 'nav-frontend-popover';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import ModalWrapper from 'nav-frontend-modal';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import PdfVisning from '../../../components/pdf/PdfVisning';
import { ISakstypeDefault } from '../../../models/Sakstype';
import { Sakstyper } from '../../SakstypeImpls';
import './fordeling.less';
import VerticalSpacer from '../../../components/VerticalSpacer';
import FormPanel from '../../../components/FormPanel';
import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction,
} from '../../../state/actions/GosysOppgaveActions';
import { setIdentFellesAction } from '../../../state/actions/IdentActions';
import { IIdentState } from '../../../models/types/IdentState';
import { IGosysOppgaveState } from '../../../models/types/GosysOppgaveState';
import OkGaaTilLosModal from '../OkGaaTilLosModal';
import { IFellesState, kopierJournalpost } from '../../../state/reducers/FellesReducer';
import { erUgyldigIdent } from './FordelingFeilmeldinger';
import JournalPostKopiFelmeldinger from './Komponenter/JournalPostKopiFelmeldinger';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import { SokersBarn } from './Komponenter/SokersBarn';
import { GosysGjelderKategorier } from './Komponenter/GoSysGjelderKategorier';
import InnholdForDokumenttypeAnnet from './Komponenter/InnholdForDokumenttypeAnnet';
import SokersIdent from './Komponenter/SokersIdent';
import ToSoekere from './Komponenter/ToSoekere';
import ValgForDokument from './Komponenter/ValgForDokument';

export interface IFordelingStateProps {
    journalpost?: IJournalpost;
    fordelingState: IFordelingState;
    journalpostId: string;
    identState: IIdentState;
    opprettIGosysState: IGosysOppgaveState;
    fellesState: IFellesState;
    dedupkey: string;
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
    } = props;
    const { sakstype } = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        []
    );
    const konfigForValgtSakstype = useMemo(() => sakstyper.find((st) => st.navn === sakstype), [sakstype]);

    const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);

    const [dokumenttype, setDokumenttype] = useState<FordelingDokumenttype>();
    const [visSakstypeValg, setVisSakstypeValg] = useState<boolean>(false);

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);

    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();

    const [skalJournalpostSomIkkeStottesKopieres, setSkalJournalpostSomIkkeStottesKopieres] = useState<boolean>(false);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const erJournalfoertEllerFerdigstilt =
        journalpost?.journalpostStatus === journalpostStatus.JOURNALFOERT ||
        journalpost?.journalpostStatus === journalpostStatus.FERDIGSTILT;

    const gjelderPleiepengerEllerOmsorgspenger =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER || dokumenttype === FordelingDokumenttype.KORRIGERING_IM;

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

    const handleVidereClick = () => {
        if (
            identState.ident1 &&
            identState.ident2 &&
            identState.annenSokerIdent &&
            journalpost?.journalpostId &&
            !!journalpost?.kanKopieres
        ) {
            props.kopierJournalpost(
                identState.ident1,
                identState.ident2,
                identState.annenSokerIdent,
                props.dedupkey,
                journalpost.journalpostId
            );
        }

        if (!identState.ident2 || !journalpost?.journalpostId) {
            setVisSakstypeValg(true);
        } else {
            props.sjekkOmSkalTilK9(identState.ident1, identState.ident2, journalpost.journalpostId);
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

    return (
        <div className="fordeling-container">
            {!!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && (
                <FormPanel>
                    <JournalpostPanel />
                    <div className="fordeling-page">
                        {!!opprettIGosysState.gosysOppgaveRequestError && (
                            <AlertStripeFeil>{intlHelper(intl, 'fordeling.omfordeling.feil')}</AlertStripeFeil>
                        )}
                        <div>
                            <RadioPanelGruppe
                                name="ppsjekk"
                                radios={Object.values(FordelingDokumenttype).map((type) => ({
                                    label: intlHelper(intl, type),
                                    value: type,
                                }))}
                                legend={intlHelper(intl, 'fordeling.detteGjelder')}
                                checked={dokumenttype}
                                onChange={(event) =>
                                    handleDokumenttype(
                                        (event.target as HTMLInputElement).value as FordelingDokumenttype
                                    )
                                }
                            />
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
                            />
                            <ToSoekere
                                dokumenttype={dokumenttype}
                                journalpost={journalpost}
                                identState={identState}
                                skalJournalpostSomIkkeStottesKopieres={skalJournalpostSomIkkeStottesKopieres}
                                fellesState={fellesState}
                                setIdentAction={setIdentAction}
                            />

                            <VerticalSpacer twentyPx />
                            {gjelderPleiepengerEllerOmsorgspenger && (
                                <>
                                    <SokersBarn
                                        barnetHarInteFnrFn={(harBarnetFnr: boolean) =>
                                            setBarnetHarIkkeFnr(harBarnetFnr)
                                        }
                                        sokersIdent={identState.ident1}
                                        visSokersBarn={
                                            visSokersBarn &&
                                            dokumenttype === FordelingDokumenttype.PLEIEPENGER &&
                                            !erUgyldigIdent(identState.ident1)
                                        }
                                    />
                                    {!(!!fordelingState.skalTilK9 || visSakstypeValg) && (
                                        <Knapp
                                            mini
                                            onClick={() => handleVidereClick()}
                                            disabled={
                                                (dokumenttype === FordelingDokumenttype.PLEIEPENGER &&
                                                    (erUgyldigIdent(identState.ident2) ||
                                                        (!identState.ident2 && !barnetHarIkkeFnr))) ||
                                                erUgyldigIdent(identState.ident1)
                                            }
                                        >
                                            {intlHelper(intl, 'fordeling.knapp.videre')}
                                        </Knapp>
                                    )}
                                </>
                            )}
                        </div>
                        <VerticalSpacer sixteenPx />
                        <ValgForDokument
                            dokumenttype={dokumenttype}
                            journalpost={journalpost}
                            erJournalfoertEllerFerdigstilt={erJournalfoertEllerFerdigstilt}
                            kanJournalforingsoppgaveOpprettesiGosys={kanJournalforingsoppgaveOpprettesiGosys}
                            setOmsorgspengerValgt={setOmsorgspengerValgt}
                            identState={identState}
                            konfigForValgtSakstype={konfigForValgtSakstype}
                            fordelingState={fordelingState}
                            setSakstypeAction={sakstypeAction}
                            lukkJournalpostOppgave={lukkJournalpostOppgave}
                            omfordel={omfordel}
                            visSakstypeValg={visSakstypeValg}
                            gjelderPleiepengerEllerOmsorgspenger={gjelderPleiepengerEllerOmsorgspenger}
                        />
                        {fordelingState.skalTilK9 === false && (
                            <>
                                <AlertStripeInfo className="infotrygd_info">
                                    {' '}
                                    {intlHelper(intl, 'fordeling.infotrygd')}
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
});

const mapDispatchToProps = (dispatch: any) => ({
    setSakstypeAction: (sakstype: Sakstype) => dispatch(setSakstypeAction(sakstype)),
    omfordel: (journalpostid: string, norskIdent: string, gosysKategori: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent, gosysKategori)),
    setIdentAction: (ident1: string, ident2: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(ident1, ident2, annenSokerIdent)),
    setErIdent1Bekreftet: (erBekreftet: boolean) => dispatch(setErIdent1BekreftetAction(erBekreftet)),
    sjekkOmSkalTilK9: (ident1: string, ident2: string, jpid: string) =>
        dispatch(sjekkOmSkalTilK9Sak(ident1, ident2, jpid)),
    kopierJournalpost: (ident1: string, ident2: string, annenIdent: string, dedupkey: string, journalpostId: string) =>
        dispatch(kopierJournalpost(ident1, annenIdent, ident2, journalpostId, dedupkey)),
    lukkJournalpostOppgave: (jpid: string) => dispatch(lukkJournalpostOppgaveAction(jpid)),
    resetOmfordelAction: () => dispatch(opprettGosysOppgaveResetAction()),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

const Fordeling = injectIntl(connect(mapStateToProps, mapDispatchToProps)(FordelingComponent));

export { Fordeling, FordelingComponent };
