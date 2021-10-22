import { JaNei, Sakstype, TilgjengeligSakstype } from 'app/models/enums';
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
import { Checkbox, Input, RadioGruppe, RadioPanel, RadioPanelGruppe } from 'nav-frontend-skjema';
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
import { skalViseFeilmelding, visFeilmeldingForAnnenIdentVidJournalKopi } from './FordelingFeilmeldinger';
import JournalPostKopiFelmeldinger from './Komponenter/JournalPostKopiFelmeldinger';
import { JournalpostAlleredeBehandlet } from './Komponenter/JournalpostAlleredeBehandlet/JournalpostAlleredeBehandlet';
import { SokersBarn } from './Komponenter/SokersBarn';
import { GosysGjelderKategorier } from './Komponenter/GoSysGjelderKategorier';
import Behandlingsknapp from './Komponenter/Behandlingsknapp';

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
    } = props;
    const { sakstype } = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        []
    );
    const konfigForValgtSakstype = useMemo(() => sakstyper.find((st) => st.navn === sakstype), [sakstype]);

    const journalpostident = journalpost?.norskIdent;

    const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();

    const [gjelderPP, setGjelderPP] = useState<JaNei | undefined>(undefined);

    const [visSakstypeValg, setVisSakstypeValg] = useState<boolean>(false);

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');
    const [visSokersBarn, setVisSokersBarn] = useState<boolean>(false);

    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);
    const [skalJournalpostSomIkkeStottesKopieres, setSkalJournalpostSomIkkeStottesKopieres] = useState<boolean>(false);

    const kanJournalforingsoppgaveOpprettesiGosys =
        !!journalpost?.kanOpprettesJournalføringsoppgave && journalpost?.kanOpprettesJournalføringsoppgave;

    const erJournalfoert = journalpost?.journalpostStatus === journalpostStatus.JOURNALFOERT;

    const handleIdent1Change = (event: any) => {
        const ident = event.target.value.replace(/\D+/, '');
        setSokersIdent(ident);
        if (ident.length === 11) {
            props.setIdentAction(ident, identState.ident2);
            props.setErIdent1Bekreftet(true);
            setVisSokersBarn(true);
        }
    };

    const handleIdent1Blur = (event: any) => {
        props.setIdentAction(event.target.value, identState.ident2);
        props.setErIdent1Bekreftet(true);
        setVisSokersBarn(true);
    };

    const handleIdentAnnenSokerBlur = (event: any) =>
        props.setIdentAction(identState.ident1, identState.ident2, event.target.value);

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setVisSokersBarn(false);
        if (jn === JaNei.JA) {
            props.setIdentAction(journalpostident || '', identState.ident2);
            if (journalpost?.norskIdent) {
                setVisSokersBarn(true);
            }
        } else {
            setSokersIdent('');
            props.setIdentAction('', identState.ident2);
        }
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

    const handleGjelderPP = (jn: JaNei) => {
        if (jn === JaNei.NEI) {
            if (!identState.ident1 && !!journalpost?.norskIdent) {
                setSokersIdent(journalpost?.norskIdent);
                props.setIdentAction(journalpost?.norskIdent, identState.ident2);
            } else {
                setSokersIdent(identState.ident1);
            }
        } else if (jn === JaNei.JA) {
            setSokersIdent('');
            props.setIdentAction('', identState.ident2);
        }
        setGjelderPP(jn);
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
                                className="horizontalRadios"
                                name="ppsjekk"
                                radios={Object.values(JaNei).map((jn) => ({
                                    label: intlHelper(intl, jn),
                                    value: jn,
                                }))}
                                legend={intlHelper(intl, 'fordeling.gjelderpp')}
                                checked={gjelderPP}
                                onChange={(event) => handleGjelderPP((event.target as HTMLInputElement).value as JaNei)}
                            />
                            {gjelderPP === JaNei.NEI && (
                                <>
                                    <VerticalSpacer sixteenPx />
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
                                        <div>
                                            <Input
                                                label={intlHelper(intl, 'ident.identifikasjon.felt')}
                                                onChange={handleIdent1Change}
                                                onBlur={handleIdent1Blur}
                                                value={sokersIdent}
                                                className="bold-label ident-soker-1"
                                                maxLength={11}
                                                feil={
                                                    skalViseFeilmelding(identState.ident1) ||
                                                    identState.ident1.length <= 0
                                                        ? intlHelper(intl, 'ident.feil.ugyldigident')
                                                        : undefined
                                                }
                                                bredde="M"
                                            />
                                            <VerticalSpacer eightPx />
                                            <GosysGjelderKategorier />
                                            <Hovedknapp
                                                mini
                                                disabled={
                                                    !identState.ident1 ||
                                                    (!!identState.ident1 && !!skalViseFeilmelding(identState.ident1)) ||
                                                    !fordelingState.valgtGosysKategori
                                                }
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
                                        </div>
                                    )}
                                </>
                            )}
                            {gjelderPP === JaNei.JA && (
                                <>
                                    <VerticalSpacer sixteenPx />
                                    <RadioPanelGruppe
                                        className="horizontalRadios"
                                        name="identsjekk"
                                        radios={Object.values(JaNei).map((jn) => ({
                                            label: intlHelper(intl, jn),
                                            value: jn,
                                        }))}
                                        legend={
                                            <FormattedMessage
                                                id="ident.identifikasjon.sjekkident"
                                                values={{ ident: journalpost?.norskIdent }}
                                            />
                                        }
                                        checked={riktigIdentIJournalposten}
                                        onChange={(event) => {
                                            props.setErIdent1Bekreftet(
                                                (event.target as HTMLInputElement).value === JaNei.JA
                                            );
                                            handleIdentRadioChange((event.target as HTMLInputElement).value as JaNei);
                                        }}
                                    />
                                </>
                            )}
                            {riktigIdentIJournalposten === JaNei.NEI && (
                                <>
                                    <VerticalSpacer sixteenPx />
                                    <Input
                                        label={intlHelper(intl, 'ident.identifikasjon.felt')}
                                        onChange={handleIdent1Change}
                                        onBlur={handleIdent1Blur}
                                        value={sokersIdent}
                                        className="bold-label ident-soker-1"
                                        maxLength={11}
                                        feil={
                                            skalViseFeilmelding(identState.ident1)
                                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                                : undefined
                                        }
                                        bredde="M"
                                    />
                                </>
                            )}
                            {gjelderPP === JaNei.JA && !!journalpost?.kanKopieres && (
                                <>
                                    <VerticalSpacer eightPx />
                                    <Checkbox
                                        label={intlHelper(intl, 'ident.identifikasjon.tosokere')}
                                        onChange={(e) => {
                                            setToSokereIJournalpost(e.target.checked);
                                        }}
                                    />
                                    <VerticalSpacer sixteenPx />
                                    {toSokereIJournalpost && (
                                        <div className="fordeling-page__to-sokere-i-journalpost">
                                            <AlertStripeInfo>
                                                {intlHelper(intl, 'ident.identifikasjon.infoOmRegisteringAvToSokere')}
                                            </AlertStripeInfo>
                                            <Input
                                                label={intlHelper(intl, 'ident.identifikasjon.annenSoker')}
                                                onChange={(e) => setAnnenSokerIdent(e.target.value.replace(/\D+/, ''))}
                                                onBlur={handleIdentAnnenSokerBlur}
                                                value={annenSokerIdent}
                                                className="bold-label"
                                                maxLength={11}
                                                feil={visFeilmeldingForAnnenIdentVidJournalKopi(
                                                    identState.annenSokerIdent,
                                                    identState.ident1,
                                                    identState.ident2,
                                                    intl
                                                )}
                                                bredde="M"
                                            />
                                            <JournalPostKopiFelmeldinger
                                                skalVisesNårJournalpostSomIkkeStottesKopieres={
                                                    !skalJournalpostSomIkkeStottesKopieres
                                                }
                                                fellesState={fellesState}
                                                intl={intl}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            <VerticalSpacer eightPx />
                            {gjelderPP === JaNei.JA && (
                                <>
                                    <VerticalSpacer sixteenPx />
                                    {visSokersBarn &&
                                        !!identState.ident1 &&
                                        !skalViseFeilmelding(identState.ident1) && (
                                            <SokersBarn
                                                sokersIdent={identState.ident1}
                                                barnetHarInteFnrFn={(harBarnetFnr: boolean) =>
                                                    setBarnetHarIkkeFnr(harBarnetFnr)
                                                }
                                            />
                                        )}
                                    {!(!!fordelingState.skalTilK9 || visSakstypeValg) && (
                                        <Knapp
                                            mini
                                            onClick={() => handleVidereClick()}
                                            disabled={
                                                skalViseFeilmelding(identState.ident2) ||
                                                (!identState.ident2 && !barnetHarIkkeFnr)
                                            }
                                        >
                                            {intlHelper(intl, 'fordeling.knapp.videre')}
                                        </Knapp>
                                    )}
                                </>
                            )}
                        </div>
                        <VerticalSpacer sixteenPx />
                        {(!!fordelingState.skalTilK9 || visSakstypeValg) && (
                            <>
                                <RadioGruppe
                                    legend={intlHelper(intl, 'fordeling.overskrift')}
                                    className="fordeling-page__options"
                                >
                                    {Object.keys(TilgjengeligSakstype).map((key) => {
                                        if (key === TilgjengeligSakstype.SKAL_IKKE_PUNSJES && !erJournalfoert) {
                                            return null;
                                        }
                                        if (
                                            !(
                                                key === TilgjengeligSakstype.ANNET &&
                                                !kanJournalforingsoppgaveOpprettesiGosys
                                            )
                                        ) {
                                            return (
                                                <RadioPanel
                                                    key={key}
                                                    label={intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`)}
                                                    value={Sakstype[key]}
                                                    onChange={() => {
                                                        props.setSakstypeAction(Sakstype[key]);
                                                        setOmsorgspengerValgt(false);
                                                    }}
                                                    checked={konfigForValgtSakstype?.navn === key}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </RadioGruppe>
                                <VerticalSpacer eightPx />
                                {!!fordelingState.sakstype && fordelingState.sakstype === Sakstype.ANNET && (
                                    <div className="fordeling-page__gosysGjelderKategorier">
                                        <AlertStripeInfo>
                                            {' '}
                                            {intlHelper(intl, 'fordeling.infobox.opprettigosys')}
                                        </AlertStripeInfo>
                                        <GosysGjelderKategorier />
                                    </div>
                                )}
                                {!!fordelingState.sakstype &&
                                    fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && (
                                        <AlertStripeInfo>
                                            {' '}
                                            {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}
                                        </AlertStripeInfo>
                                    )}
                                <Behandlingsknapp
                                    norskIdent={identState.ident1}
                                    omfordel={omfordel}
                                    lukkJournalpostOppgave={lukkJournalpostOppgave}
                                    journalpost={journalpost}
                                    sakstypeConfig={konfigForValgtSakstype}
                                    gosysKategoriJournalforing={fordelingState.valgtGosysKategori}
                                />
                            </>
                        )}
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
