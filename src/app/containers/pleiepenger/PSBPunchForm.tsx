/* eslint-disable */
import { Arbeidsforhold, JaNei, PunchStep } from 'app/models/enums';
import { IInputError, IPunchFormState, ISignaturState, SelvstendigNaerinsdrivende } from 'app/models/types';
import {
    getSoknad,
    hentPerioderFraK9Sak,
    resetPunchFormAction,
    resetSoknadAction,
    setIdentAction,
    setJournalpostPaaVentResetAction,
    setSignaturAction,
    setStepAction,
    settJournalpostPaaVent,
    submitSoknad,
    undoChoiceOfEksisterendeSoknadAction,
    updateSoknad,
    validerSoknad,
    validerSoknadResetAction,
} from 'app/state/actions';
import { nummerPrefiks, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { EtikettAdvarsel, EtikettFokus, EtikettSuksess } from 'nav-frontend-etiketter';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { PopoverOrientering } from 'nav-frontend-popover';
import { CheckboksPanel, Checkbox, Input, RadioPanelGruppe, Select } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import VerticalSpacer from '../../components/VerticalSpacer';
import { ArbeidstidInfo } from '../../models/types/ArbeidstidInfo';
import { BeredskapNattevaak } from '../../models/enums/BeredskapNattevaak';
import { JaNeiIkkeOpplyst } from '../../models/enums/JaNeiIkkeOpplyst';
import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../models/enums/PunchFormPaneler';
import { RelasjonTilBarnet } from '../../models/enums/RelasjonTilBarnet';
import { Virksomhetstyper } from '../../models/enums/Virksomhetstyper';
import { Arbeidstaker } from '../../models/types/Arbeidstaker';
import { FrilanserOpptjening } from '../../models/types/FrilanserOpptjening';
import { IIdentState } from '../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { ArbeidstidPeriodeMedTimer, IPeriode, PeriodeMedTimerMinutter } from '../../models/types/Periode';
import {
    IPSBSoknad,
    IUtenlandsOpphold,
    PSBSoknad,
    SelvstendigNaeringsdrivendeOpptjening,
    Tilleggsinformasjon,
} from '../../models/types/PSBSoknad';
import { IPSBSoknadUt, PSBSoknadUt } from '../../models/types/PSBSoknadUt';
import { RootStateType } from '../../state/RootState';
import { initializeDate } from '../../utils/timeUtils';
import ErDuSikkerModal from './ErDuSikkerModal';
import OkGaaTilLosModal from './OkGaaTilLosModal';
import { PeriodeinfoPaneler } from './PeriodeinfoPaneler';
import { Periodepaneler } from './Periodepaneler';
import { pfLand } from './pfLand';
import { pfTilleggsinformasjon } from './pfTilleggsinformasjon';
import { pfTimerMinutter } from './pfTimerMinutter';
import ArbeidsforholdPanel from './PSBPunchForm/Arbeidsforhold/ArbeidsforholdPanel';
import { sjekkHvisArbeidstidErAngitt } from './PSBPunchForm/arbeidstidOgPerioderHjelpfunksjoner';
import OpplysningerOmSoknad from './PSBPunchForm/OpplysningerOmSoknad/OpplysningerOmSoknad';
import EndringAvSøknadsperioder from './PSBPunchForm/EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import Soknadsperioder from './PSBPunchForm/Soknadsperioder';
import SettPaaVentErrorModal from './SettPaaVentErrorModal';
import SettPaaVentModal from './SettPaaVentModal';
import Feilmelding from '../../components/Feilmelding';
import SoknadKvittering from './SoknadKvittering/SoknadKvittering';

export interface IPunchFormComponentProps {
    getPunchPath: (step: PunchStep, values?: any) => string;
    journalpostid: string;
    id: string;
}

export interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

export interface IPunchFormDispatchProps {
    getSoknad: typeof getSoknad;
    hentPerioder: typeof hentPerioderFraK9Sak;
    resetSoknadAction: typeof resetSoknadAction;
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    undoChoiceOfEksisterendeSoknadAction: typeof undoChoiceOfEksisterendeSoknadAction;
    updateSoknad: typeof updateSoknad;
    submitSoknad: typeof submitSoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerSoknad;
    validerSoknadReset: typeof validerSoknadResetAction;
}

export interface IPunchFormComponentState {
    soknad: IPSBSoknad;
    perioder?: IPeriode;
    isFetched: boolean;
    showStatus: boolean;
    faktiskeTimer: string[][];
    iTilsynsordning: boolean | undefined;
    iUtlandet: JaNeiIkkeOpplyst | undefined;
    skalHaFerie: JaNeiIkkeOpplyst | undefined;
    arbeidstaker: boolean;
    frilanser: boolean;
    selvstendigNæringsdrivende: boolean;
    expandAll: boolean;
    frilanserStartdato: string;
    jobberFortsattSomFrilanser: JaNei | undefined;
    barnetSkalLeggesInn: JaNei | undefined;
    innleggelseUtlandet: IPeriode[];
    harBoddIUtlandet: JaNeiIkkeOpplyst | undefined;
    skalBoIUtlandet: JaNeiIkkeOpplyst | undefined;
    medlemskap: IUtenlandsOpphold[];
    aapnePaneler: PunchFormPaneler[];
    showSettPaaVentModal: boolean;
    visErDuSikkerModal: boolean;
    errors: IInputError[];
    harRegnskapsfører: boolean;
    feilmeldingStier: Set<string>;
    harForsoektAaSendeInn: boolean;
}

type IPunchFormProps = IPunchFormComponentProps &
    WrappedComponentProps &
    IPunchFormStateProps &
    IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps, IPunchFormComponentState> {
    state: IPunchFormComponentState = {
        soknad: {
            soeknadId: '',
            soekerId: '',
            mottattDato: '',
            journalposter: new Set([]),
            barn: {
                norskIdent: '',
                foedselsdato: '',
            },
            opptjeningAktivitet: {},
            arbeidstid: {},

            tilsynsordning: {},
            utenlandsopphold: [],
            omsorg: {},
            harInfoSomIkkeKanPunsjes: false,
            harMedisinskeOpplysninger: false,
            skalTrekkePerioder: false,
        },
        perioder: undefined,
        isFetched: false,
        showStatus: false,
        faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
        iTilsynsordning: undefined,
        arbeidstaker: false,
        frilanser: false,
        selvstendigNæringsdrivende: false,
        expandAll: false,
        frilanserStartdato: '',
        jobberFortsattSomFrilanser: undefined,
        innleggelseUtlandet: [],
        barnetSkalLeggesInn: undefined,
        harBoddIUtlandet: undefined,
        skalBoIUtlandet: undefined,
        medlemskap: [],
        iUtlandet: undefined,
        skalHaFerie: undefined,
        aapnePaneler: [],
        showSettPaaVentModal: false,
        visErDuSikkerModal: false,
        errors: [],
        harRegnskapsfører: false,
        feilmeldingStier: new Set(),
        harForsoektAaSendeInn: false,
    };

    private initialPeriode: IPeriode = { fom: '', tom: '' };
    private getSoknadsperiode = () => {
        const { soknad } = this.state;
        if (soknad?.soeknadsperiode && soknad.soeknadsperiode.length > 0) {
            return soknad.soeknadsperiode;
        } else {
            return [this.initialPeriode];
        }
    };

    private initialPeriodeTimerMinutter = new PeriodeMedTimerMinutter({
        timer: 0,
        minutter: 0,
    });

    private initialPeriodeMedTimer = new ArbeidstidPeriodeMedTimer({
        periode: { fom: '', tom: '' },
        faktiskArbeidTimerPerDag: '',
    });

    private initialTillegsinfo = () => {
        const periode = this.getSoknadsperiode()[0];
        return new Tilleggsinformasjon({
            periode,
            tilleggsinformasjon: '',
        });
    };
    private initialArbeidstaker = () =>
        new Arbeidstaker({
            arbeidstidInfo: {
                perioder: [
                    {
                        periode: this.getSoknadsperiode()[0],
                        faktiskArbeidTimerPerDag: '',
                        jobberNormaltTimerPerDag: '',
                    },
                ],
            },
            organisasjonsnummer: '',
            norskIdent: null,
        });

    private initialArbeidstidInfo = () =>
        new ArbeidstidInfo({
            perioder: [
                {
                    periode: this.getSoknadsperiode()[0],
                    faktiskArbeidTimerPerDag: '',
                    jobberNormaltTimerPerDag: '',
                },
            ],
        });

    private initialFrilanser = new FrilanserOpptjening({
        jobberFortsattSomFrilans: undefined,
        startdato: undefined,
    });

    private initialSelvstedigNæringsdrivende = new SelvstendigNaerinsdrivende({
        periode: this.getSoknadsperiode()[0],
        virksomhetstyper: [],
        registrertIUtlandet: false,
        landkode: '',
    });

    private initialSelvstendigNæringsdrivendeOpptjening = new SelvstendigNaeringsdrivendeOpptjening({
        virksomhetNavn: '',
        organisasjonsnummer: '',
        info: this.initialSelvstedigNæringsdrivende,
    });

    componentDidMount(): void {
        const { id } = this.props;
        this.props.getSoknad(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
        this.setState(this.state);
        const { ident1, ident2 } = this.props.identState;
        if (ident1 && ident2) {
            this.props.hentPerioder(ident1, ident2);
        }
    }

    componentDidUpdate(
        prevProps: Readonly<IPunchFormProps>,
        prevState: Readonly<IPunchFormComponentState>,
        snapshot?: any
    ): void {
        const { soknad } = this.props.punchFormState;
        if (!!soknad && !this.state.isFetched) {
            this.setState({
                soknad: new PSBSoknad(this.props.punchFormState.soknad as IPSBSoknad),
                isFetched: true,
            });
            if (!soknad.barn || !soknad.barn.norskIdent || soknad.barn.norskIdent === '') {
                this.updateSoknad({ barn: { norskIdent: this.props.identState.ident2 || '' } });
            }
        }
    }

    render() {
        const { intl, punchFormState, signaturState } = this.props;

        const soknad = new PSBSoknad(this.state.soknad);
        const { signert } = signaturState;
        const eksisterendePerioder = punchFormState.perioder;

        if (punchFormState.isComplete) {
            setHash(this.props.getPunchPath(PunchStep.COMPLETED));
            return null;
        }

        if (punchFormState.isSoknadLoading) {
            return <NavFrontendSpinner />;
        }

        if (!!punchFormState.error) {
            return (
                <>
                    <AlertStripeFeil>
                        {intlHelper(intl, 'skjema.feil.ikke_funnet', { id: this.props.id })}
                    </AlertStripeFeil>
                    <p>
                        <Knapp onClick={this.handleStartButtonClick}>{intlHelper(intl, 'skjema.knapp.tilstart')}</Knapp>
                    </p>
                </>
            );
        }

        if (!soknad) {
            return null;
        }

        const initialUtenlandsopphold: IUtenlandsOpphold = { land: '' };

        const beredskapperioder = () => {
            return (
                <PeriodeinfoPaneler
                    intl={intl}
                    periods={soknad.beredskap}
                    panelid={(i) => `beredskapspanel_${i}`}
                    initialPeriodeinfo={this.initialTillegsinfo()}
                    component={pfTilleggsinformasjon('beredskap')}
                    editSoknad={(beredskap) => this.updateSoknad({ beredskap })}
                    editSoknadState={(beredskap, showStatus) => this.updateSoknadState({ beredskap }, showStatus)}
                    textLeggTil="skjema.beredskap.leggtilperiode"
                    textFjern="skjema.beredskap.fjernperiode"
                    className="beredskapsperioder"
                    panelClassName="beredskapspanel"
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhaandterteFeil}
                    feilkodeprefiks={'ytelse.beredskap'}
                    kanHaFlere={true}
                    medSlettKnapp={false}
                />
            );
        };

        const nattevaakperioder = () => {
            return (
                <PeriodeinfoPaneler
                    intl={intl}
                    periods={soknad.nattevaak}
                    panelid={(i) => `nattevaakspanel_${i}`}
                    initialPeriodeinfo={this.initialTillegsinfo()}
                    component={pfTilleggsinformasjon('nattevaak')}
                    editSoknad={(nattevaak) => this.updateSoknad({ nattevaak })}
                    editSoknadState={(nattevaak, showStatus) => this.updateSoknadState({ nattevaak }, showStatus)}
                    textLeggTil="skjema.nattevaak.leggtilperiode"
                    textFjern="skjema.nattevaak.fjernperiode"
                    className="nattevaaksperioder"
                    panelClassName="nattevaakspanel"
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhaandterteFeil}
                    feilkodeprefiks={'ytelse.nattevåk'}
                    kanHaFlere={true}
                    medSlettKnapp={false}
                />
            );
        };

        return (
            <>
                {this.statusetikett()}
                <VerticalSpacer sixteenPx={true} />
                <Soknadsperioder
                    updateSoknadState={this.updateSoknadStateCallbackFunction}
                    updateSoknad={this.updateSoknad}
                    initialPeriode={this.initialPeriode}
                    getErrorMessage={this.getErrorMessage}
                    soknad={soknad}
                />
                <VerticalSpacer sixteenPx={true} />
                <OpplysningerOmSoknad
                    intl={intl}
                    changeAndBlurUpdatesSoknad={this.changeAndBlurUpdatesSoknad}
                    getErrorMessage={this.getErrorMessage}
                    setSignaturAction={this.props.setSignaturAction}
                    signert={signert}
                    soknad={soknad}
                />
                <VerticalSpacer sixteenPx={true} />
                <Checkbox
                    label={intlHelper(intl, 'skjema.ekspander')}
                    onChange={(e) => {
                        this.setState({ expandAll: e.target.checked });
                        this.forceUpdate();
                    }}
                />
                <VerticalSpacer sixteenPx={true} />
                <EndringAvSøknadsperioder
                    isOpen={this.checkOpenState(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                    intl={intl}
                    getErrorMessage={this.getErrorMessage}
                    soknad={soknad}
                    updateSoknad={this.updateSoknad}
                    updateSoknadState={this.updateSoknadState}
                    eksisterendePerioder={eksisterendePerioder}
                />
                <VerticalSpacer sixteenPx={true} />
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    className={'punchform__paneler'}
                    tittel={intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}
                >
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                            label: intlHelper(intl, jnv),
                            value: jnv,
                        }))}
                        name="utlandjaneiikeeopplyst"
                        legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                        onChange={(event) =>
                            this.updateUtenlandsopphold((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                        }
                        checked={
                            !!this.state.soknad.utenlandsopphold?.length ? JaNeiIkkeOpplyst.JA : this.state.iUtlandet
                        }
                    />
                    {!!soknad.utenlandsopphold.length && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.utenlandsopphold}
                            component={pfLand()}
                            panelid={(i) => `utenlandsoppholdpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(perioder) => this.updateSoknad({ utenlandsopphold: perioder })}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({ utenlandsopphold: perioder }, showStatus)
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="utenlandsopphold"
                            panelClassName="utenlandsoppholdpanel"
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks={'ytelse.utenlandsopphold'}
                            kanHaFlere={true}
                            medSlettKnapp={false}
                        />
                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.FERIE)}
                    className={classNames('punchform__paneler', 'feriepanel')}
                    tittel={intlHelper(intl, PunchFormPaneler.FERIE)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.FERIE)}
                >
                    <VerticalSpacer eightPx={true} />
                    <CheckboksPanel
                        label={intlHelper(intl, 'skjema.ferie.leggtil')}
                        value={'skjema.ferie.leggtil'}
                        onChange={(e) => this.updateSkalHaFerie(e.target.checked)}
                        checked={!!soknad.lovbestemtFerie.length}
                    />
                    {!!soknad.lovbestemtFerie.length && (
                        <Periodepaneler
                            intl={intl}
                            periods={soknad.lovbestemtFerie}
                            panelid={(i) => `ferieperiodepanel_${i}`}
                            initialPeriode={this.initialPeriode}
                            editSoknad={(perioder) => this.updateSoknad({ lovbestemtFerie: perioder })}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({ lovbestemtFerie: perioder }, showStatus)
                            }
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks={'ytelse.lovbestemtFerie'}
                            minstEn={false}
                            kanHaFlere={true}
                        />
                    )}
                    <VerticalSpacer eightPx={true} />
                    {eksisterendePerioder && eksisterendePerioder?.length > 0 && !punchFormState.hentPerioderError && (
                        <>
                            <CheckboksPanel
                                label={intlHelper(intl, 'skjema.ferie.fjern')}
                                value={'skjema.ferie.fjern'}
                                onChange={(e) => this.updateIkkeSkalHaFerie(e.target.checked)}
                                checked={!!soknad.lovbestemtFerieSomSkalSlettes.length}
                            />
                            {!!soknad.lovbestemtFerieSomSkalSlettes.length && (
                                <>
                                    <AlertStripeInfo>{intlHelper(intl, 'skjema.ferie.fjern.info')}</AlertStripeInfo>
                                    <Periodepaneler
                                        intl={intl}
                                        periods={soknad.lovbestemtFerieSomSkalSlettes}
                                        panelid={(i) => `ferieperiodepanel_${i}`}
                                        initialPeriode={this.initialPeriode}
                                        editSoknad={(perioder) =>
                                            this.updateSoknad({ lovbestemtFerieSomSkalSlettes: perioder })
                                        }
                                        editSoknadState={(perioder, showStatus) =>
                                            this.updateSoknadState(
                                                { lovbestemtFerieSomSkalSlettes: perioder },
                                                showStatus
                                            )
                                        }
                                        getErrorMessage={() => undefined}
                                        getUhaandterteFeil={this.getUhaandterteFeil}
                                        feilkodeprefiks={'lovbestemtFerie'}
                                        minstEn={false}
                                        kanHaFlere={true}
                                    />
                                </>
                            )}
                        </>
                    )}
                </EkspanderbartpanelBase>
                <ArbeidsforholdPanel
                    isOpen={this.checkOpenState(PunchFormPaneler.ARBEID)}
                    onPanelClick={() => this.handlePanelClick(PunchFormPaneler.ARBEID)}
                    handleArbeidsforholdChange={this.handleArbeidsforholdChange}
                    getCheckedValueArbeid={this.getCheckedValueArbeid}
                    soknad={soknad}
                    initialArbeidstaker={this.initialArbeidstaker()}
                    updateSoknad={this.updateSoknad}
                    updateSoknadState={this.updateSoknadState}
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhaandterteFeil}
                    handleFrilanserChange={this.handleFrilanserChange}
                    updateVirksomhetstyper={this.updateVirksomhetstyper}
                />
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    className={'punchform__paneler'}
                    tittel={intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                >
                    <Select
                        value={soknad.omsorg.relasjonTilBarnet}
                        label={intlHelper(intl, 'skjema.relasjontilbarnet')}
                        {...this.changeAndBlurUpdatesSoknad((event) => ({
                            omsorg: { ...soknad.omsorg, relasjonTilBarnet: event.target.value },
                        }))}
                    >
                        {Object.values(RelasjonTilBarnet).map((rel) => (
                            <option key={rel} value={rel}>
                                {rel}
                            </option>
                        ))}
                    </Select>
                    {soknad.omsorg.relasjonTilBarnet === RelasjonTilBarnet.ANNET && (
                        <Input
                            bredde={'M'}
                            label={intlHelper(intl, 'skjema.omsorg.beskrivelse')}
                            className="beskrivelseAvOmsorgsrollen"
                            value={soknad.omsorg.beskrivelseAvOmsorgsrollen}
                            {...this.changeAndBlurUpdatesSoknad((event) => ({
                                omsorg: { ...soknad.omsorg, beskrivelseAvOmsorgsrollen: event.target.value },
                            }))}
                        />
                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OMSORGSTILBUD)}
                    className={classNames('punchform__paneler', 'tilsynsordning')}
                    tittel={intlHelper(intl, PunchFormPaneler.OMSORGSTILBUD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OMSORGSTILBUD)}
                >
                    <CheckboksPanel
                        label={intlHelper(intl, 'skjema.omsorgstilbud.checkboks')}
                        value={'skjema.omsorgstilbud.checkboks'}
                        onChange={(e) => this.updateOmsorgstilbud(e.target.checked)}
                        checked={!!soknad.tilsynsordning.perioder.length}
                    />
                    {!!soknad.tilsynsordning.perioder.length && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={
                                soknad.tilsynsordning.perioder.length
                                    ? soknad.tilsynsordning.perioder
                                    : [this.initialPeriodeTimerMinutter]
                            }
                            component={pfTimerMinutter()}
                            panelid={(i) => `tilsynsordningpanel_${i}`}
                            initialPeriodeinfo={this.initialPeriodeTimerMinutter}
                            editSoknad={(perioder) =>
                                this.updateSoknad({
                                    tilsynsordning: {
                                        ...this.state.soknad.tilsynsordning,
                                        perioder,
                                    },
                                })
                            }
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState(
                                    {
                                        tilsynsordning: {
                                            ...this.state.soknad.tilsynsordning,
                                            perioder,
                                        },
                                    },
                                    showStatus
                                )
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            panelClassName="tilsynsordningpanel"
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks={'ytelse.tilsynsordning'}
                            kanHaFlere={true}
                            medSlettKnapp={false}
                        />
                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                    className={'punchform__paneler'}
                    tittel={intlHelper(intl, PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                >
                    <CheckboksPanel
                        label={intlHelper(intl, BeredskapNattevaak.BEREDSKAP)}
                        value={BeredskapNattevaak.BEREDSKAP}
                        onChange={(e) =>
                            this.handleBeredskapNattevaakChange(BeredskapNattevaak.BEREDSKAP, e.target.checked)
                        }
                        checked={!!soknad.beredskap.length}
                    />
                    {!!soknad.beredskap.length && <>{beredskapperioder()}</>}
                    <VerticalSpacer eightPx={true} />
                    <CheckboksPanel
                        label={intlHelper(intl, BeredskapNattevaak.NATTEVAAK)}
                        value={BeredskapNattevaak.NATTEVAAK}
                        onChange={(e) =>
                            this.handleBeredskapNattevaakChange(BeredskapNattevaak.NATTEVAAK, e.target.checked)
                        }
                        checked={!!soknad.nattevaak.length}
                    />
                    {!!soknad.nattevaak.length && <>{nattevaakperioder()}</>}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                    className={'punchform__paneler'}
                    tittel={intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}
                >
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        name="medlemskapjanei"
                        legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                        onChange={(event) =>
                            this.handleMedlemskapChange((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                        }
                        checked={!!soknad.bosteder.length ? JaNeiIkkeOpplyst.JA : this.state.harBoddIUtlandet}
                    />
                    {!!soknad.bosteder.length && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.bosteder}
                            component={pfLand()}
                            panelid={(i) => `bostederpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(bosteder) => this.updateSoknad({ bosteder })}
                            editSoknadState={(bosteder, showStatus) => this.updateSoknadState({ bosteder }, showStatus)}
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="bosteder"
                            panelClassName="bostederpanel"
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks={'ytelse.bosteder'}
                            kanHaFlere={true}
                            medSlettKnapp={false}
                        />
                    )}
                </EkspanderbartpanelBase>
                <VerticalSpacer thirtyTwoPx={true} />
                <p className={'ikkeregistrert'}>{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
                <div className={'flex-container'}>
                    <CheckboksPanel
                        id={'medisinskeopplysningercheckbox'}
                        label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                        checked={!!soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateMedisinskeOpplysninger(event.target.checked)}
                    />
                    <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                        {intlHelper(intl, 'skjema.medisinskeopplysninger.hjelpetekst')}
                    </Hjelpetekst>
                </div>
                <VerticalSpacer eightPx={true} />
                <div className={'flex-container'}>
                    <CheckboksPanel
                        id={'opplysningerikkepunsjetcheckbox'}
                        label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                        checked={!!soknad.harInfoSomIkkeKanPunsjes}
                        onChange={(event) => this.updateOpplysningerIkkeKanPunsjes(event.target.checked)}
                    />
                    <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                        {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                    </Hjelpetekst>
                </div>
                <VerticalSpacer twentyPx={true} />
                {this.getUhaandterteFeil('')
                    .map((feilmelding, index) => nummerPrefiks(feilmelding || '', index + 1))
                    .map((feilmelding) => {
                        return <Feilmelding key={feilmelding} feil={feilmelding} />;
                    })}

                {punchFormState.isAwaitingValidateResponse && (
                    <div className={classNames('loadingSpinner')}>
                        <NavFrontendSpinner />
                    </div>
                )}
                <div className={'submit-knapper'}>
                    <p className="sendknapp-wrapper">
                        <Knapp
                            className={'send-knapp'}
                            onClick={() => this.handleSubmit()}
                            disabled={!sjekkHvisArbeidstidErAngitt(this.props.punchFormState)}
                        >
                            {intlHelper(intl, 'skjema.knapp.send')}
                        </Knapp>

                        <Knapp
                            className={'vent-knapp'}
                            onClick={() => this.setState({ showSettPaaVentModal: true })}
                            disabled={!sjekkHvisArbeidstidErAngitt(this.props.punchFormState)}
                        >
                            {intlHelper(intl, 'skjema.knapp.settpaavent')}
                        </Knapp>
                    </p>
                </div>
                <VerticalSpacer sixteenPx={true} />
                {!!punchFormState.updateSoknadError && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>
                )}
                {!!punchFormState.inputErrors?.length && (
                    <AlertStripeFeil className={'valideringstripefeil'}>
                        {intlHelper(intl, 'skjema.feil.validering')}
                    </AlertStripeFeil>
                )}
                {!!punchFormState.submitSoknadError && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>
                )}
                {!!punchFormState.submitSoknadConflict && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.konflikt')}</AlertStripeFeil>
                )}
                {!sjekkHvisArbeidstidErAngitt(this.props.punchFormState) && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.sletteferie_manglerarbeidstid')}</AlertStripeFeil>
                )}

                {this.state.showSettPaaVentModal && (
                    <ModalWrapper
                        key={'settpaaventmodal'}
                        className={'settpaaventmodal'}
                        onRequestClose={() => this.setState({ showSettPaaVentModal: false })}
                        contentLabel={'settpaaventmodal'}
                        isOpen={this.state.showSettPaaVentModal}
                        closeButton={false}
                    >
                        <div className="">
                            <SettPaaVentModal
                                journalposter={this.props.journalposterState.journalposter.filter(
                                    (jp) => jp.journalpostId !== this.props.journalpostid
                                )}
                                soknadId={soknad.soeknadId}
                                submit={() => this.handleSettPaaVent()}
                                avbryt={() => this.setState({ showSettPaaVentModal: false })}
                            />
                        </div>
                    </ModalWrapper>
                )}
                {punchFormState.settPaaVentSuccess && (
                    <ModalWrapper
                        key={'settpaaventokmodal'}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={'settpaaventokmodal'}
                        closeButton={false}
                        isOpen={punchFormState.settPaaVentSuccess}
                    >
                        <OkGaaTilLosModal melding={'modal.settpaavent.til'} />
                    </ModalWrapper>
                )}
                {!!punchFormState.settPaaVentError && (
                    <ModalWrapper
                        key={'settpaaventerrormodal'}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={'settpaaventokmodal'}
                        closeButton={false}
                        isOpen={!!punchFormState.settPaaVentError}
                    >
                        <SettPaaVentErrorModal close={() => this.props.settPaaventResetAction()} />
                    </ModalWrapper>
                )}

                {this.props.punchFormState.isValid &&
                    !this.state.visErDuSikkerModal &&
                    this.props.punchFormState.validertSoknad && (
                        <ModalWrapper
                            key={'validertSoknadModal'}
                            className={'validertSoknadModal'}
                            onRequestClose={() => this.props.validerSoknadReset()}
                            contentLabel={'validertSoknadModal'}
                            closeButton={false}
                            isOpen={!!this.props.punchFormState.isValid}
                        >
                            <div className={classNames('validertSoknadOppsummeringContainer')}>
                                <SoknadKvittering
                                    intl={intl}
                                    response={this.props.punchFormState.validertSoknad}
                                    skalViseTrukkedePerioder={soknad.skalTrekkePerioder}
                                />
                            </div>
                            <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                                <Hovedknapp
                                    mini={true}
                                    className="validertSoknadOppsummeringContainer_knappVidere"
                                    onClick={() => this.setState({ visErDuSikkerModal: true })}
                                >
                                    {intlHelper(intl, 'fordeling.knapp.videre')}
                                </Hovedknapp>
                                <Knapp
                                    mini={true}
                                    className="validertSoknadOppsummeringContainer_knappTilbake"
                                    onClick={() => this.props.validerSoknadReset()}
                                >
                                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                                </Knapp>
                            </div>
                        </ModalWrapper>
                    )}

                {this.state.visErDuSikkerModal && (
                    <ModalWrapper
                        key={'erdusikkermodal'}
                        className={'erdusikkermodal'}
                        onRequestClose={() => this.props.validerSoknadReset()}
                        contentLabel={'erdusikkermodal'}
                        closeButton={false}
                        isOpen={this.state.visErDuSikkerModal}
                    >
                        <ErDuSikkerModal
                            melding={'modal.erdusikker.sendinn'}
                            extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                            onSubmit={() => this.props.submitSoknad(this.state.soknad.soekerId, this.props.id)}
                            submitKnappText={'skjema.knapp.send'}
                            onClose={() => {
                                this.props.validerSoknadReset();
                                this.setState({ visErDuSikkerModal: false });
                            }}
                        />
                    </ModalWrapper>
                )}
            </>
        );
    }

    private handleSubmit = () => {
        let navarandeSoknad: IPSBSoknad = this.state.soknad;
        if (!this.state.soknad.skalTrekkePerioder) {
            navarandeSoknad.trekkKravPerioder = [];
        }
        const journalposter = {
            journalposter: Array.from(
                navarandeSoknad && navarandeSoknad.journalposter ? navarandeSoknad?.journalposter : []
            ),
        };
        this.setState({ harForsoektAaSendeInn: true });
        this.props.validateSoknad({ ...navarandeSoknad, ...journalposter });
    };

    private handleSettPaaVent = () => {
        this.props.settJournalpostPaaVent(this.props.journalpostid, this.state.soknad.soeknadId!);
        this.setState({ showSettPaaVentModal: false });
    };

    private handlePanelClick = (p: PunchFormPaneler) => {
        const { aapnePaneler } = this.state;
        if (aapnePaneler.some((panel) => panel === p)) {
            aapnePaneler.splice(aapnePaneler.indexOf(p), 1);
        } else {
            aapnePaneler.push(p);
        }
        this.forceUpdate();
    };

    private checkOpenState = (p: PunchFormPaneler): boolean => {
        const { aapnePaneler, expandAll } = this.state;
        if (!!this.props.punchFormState.inputErrors?.length) {
            return true;
        }
        if (expandAll && aapnePaneler.some((panel) => panel === p)) {
            return false;
        } else if (expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return true;
        } else if (!expandAll && aapnePaneler.some((panel) => panel === p)) {
            return true;
        } else if (!expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return false;
        }
        return false;
    };

    private updateVirksomhetstyper = (v: Virksomhetstyper, checked: boolean) => {
        const sn = this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende;

        if (checked && !sn?.info?.virksomhetstyper?.some((vtype) => vtype === v)) {
            sn?.info?.virksomhetstyper?.push(v);
        } else {
            if (sn?.info?.virksomhetstyper?.some((vtype) => vtype === v)) {
                sn?.info?.virksomhetstyper?.splice(sn?.info?.virksomhetstyper?.indexOf(v), 1);
            }
        }
        this.forceUpdate();
    };

    private handleArbeidsforholdChange = (af: Arbeidsforhold, checked: boolean) => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                this.setState({ arbeidstaker: checked });
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.arbeidstakerList?.length) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                arbeidstakerList: [this.initialArbeidstaker()],
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({ arbeidstid: { ...this.state.soknad.arbeidstid, arbeidstakerList: [] } });
                    this.updateSoknad({ arbeidstid: { ...this.state.soknad.arbeidstid, arbeidstakerList: [] } });
                }
                break;
            case Arbeidsforhold.FRILANSER:
                this.setState({ frilanser: checked });
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.frilanserArbeidstidInfo) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                frilanserArbeidstidInfo: this.initialArbeidstidInfo(),
                            },
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                frilanser: this.initialFrilanser,
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            frilanserArbeidstidInfo: null,
                        },
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            frilanser: null,
                        },
                    });
                    this.updateSoknad({
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            frilanserArbeidstidInfo: null,
                        },
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            frilanser: null,
                        },
                    });
                }
                break;
            case Arbeidsforhold.SELVSTENDIG:
                this.setState({ selvstendigNæringsdrivende: checked });
                if (checked) {
                    if (
                        !this.state.soknad.opptjeningAktivitet ||
                        !this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende
                    ) {
                        this.updateSoknadState({
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                selvstendigNaeringsdrivende: this.initialSelvstendigNæringsdrivendeOpptjening,
                            },
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                selvstendigNæringsdrivendeArbeidstidInfo: this.initialArbeidstidInfo(),
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            selvstendigNaeringsdrivende: null,
                        },
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            selvstendigNæringsdrivendeArbeidstidInfo: null,
                        },
                    });
                    this.updateSoknad({
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            selvstendigNaeringsdrivende: null,
                        },
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            selvstendigNæringsdrivendeArbeidstidInfo: null,
                        },
                    });
                }
                break;
        }
    };

    private getCheckedValueArbeid = (af: Arbeidsforhold): boolean => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                if (this.state.soknad.arbeidstid?.arbeidstakerList?.length) {
                    return true;
                } else {
                    return false;
                }

            case Arbeidsforhold.FRILANSER:
                if (this.state.soknad.opptjeningAktivitet.frilanser) {
                    return true;
                } else {
                    return false;
                }
            case Arbeidsforhold.SELVSTENDIG:
                if (this.state.soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende) {
                    return true;
                } else {
                    return false;
                }
        }
    };

    private handleBeredskapNattevaakChange = (bn: BeredskapNattevaak, checked: boolean) => {
        switch (bn) {
            case BeredskapNattevaak.BEREDSKAP:
                if (checked) {
                    this.updateSoknadState({ beredskap: [this.initialTillegsinfo()] });
                } else {
                    this.updateSoknadState({ beredskap: [] });
                }
                break;
            case BeredskapNattevaak.NATTEVAAK:
                if (checked) {
                    this.updateSoknadState({ nattevaak: [this.initialTillegsinfo()] });
                } else {
                    this.updateSoknadState({ nattevaak: [] });
                }
                break;
        }
    };

    private updateUtenlandsopphold(jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) {
        this.setState({
            iUtlandet: jaNeiIkkeOpplyst,
        });

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA && this.state.soknad.utenlandsopphold!.length === 0) {
            this.addOpphold();
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({ utenlandsopphold: [] }, true);
            this.updateSoknad({ utenlandsopphold: [] });
        }
    }

    private handleMedlemskapChange(jaNei: JaNeiIkkeOpplyst) {
        this.setState({
            harBoddIUtlandet: jaNei,
        });

        if (jaNei === JaNeiIkkeOpplyst.JA && this.state.soknad.bosteder!.length === 0) {
            this.state.soknad.bosteder!.push({ periode: { fom: '', tom: '' }, land: '' });
            this.forceUpdate();
        }

        if (jaNei !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({ bosteder: [] }, true);
            this.updateSoknad({ bosteder: [] });
        }
    }

    private handleFrilanserChange = (jaNei: JaNei) => {
        if (jaNei === JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: this.initialArbeidstidInfo(),
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true,
                        sluttdato: undefined,
                    },
                },
            });
            this.updateSoknad({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true,
                    },
                },
            });
            this.forceUpdate();
        }

        if (jaNei !== JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false,
                    },
                },
            });
            this.updateSoknad({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet,
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false,
                    },
                },
            });
            this.forceUpdate();
        }
    };

    private updateSkalHaFerie(checked: boolean) {
        if (!this.state.soknad.lovbestemtFerie) {
            this.state.soknad = { ...this.state.soknad, lovbestemtFerie: [{}] };
        }
        if (!!checked && this.state.soknad.lovbestemtFerie?.length === 0) {
            this.addSkalHaFerie();
        } else {
            this.updateSoknadState({ lovbestemtFerie: [] }, true);
            this.updateSoknad({ lovbestemtFerie: [] });
        }
    }

    private updateIkkeSkalHaFerie(checked: boolean) {
        const { aapnePaneler } = this.state;
        if (!this.state.soknad.lovbestemtFerieSomSkalSlettes) {
            this.state.soknad = { ...this.state.soknad, lovbestemtFerieSomSkalSlettes: [{}] };
        }

        if (!!checked && !aapnePaneler.some((panel) => panel === PunchFormPaneler.ARBEID)) {
            aapnePaneler.push(PunchFormPaneler.ARBEID);
        } else if (!checked && aapnePaneler.some((panel) => panel === PunchFormPaneler.ARBEID)) {
            aapnePaneler.splice(aapnePaneler.indexOf(PunchFormPaneler.ARBEID), 1);
        }

        if (!!checked && this.state.soknad.lovbestemtFerieSomSkalSlettes?.length === 0) {
            this.addIkkeSkalHaFerie();
        } else {
            this.updateSoknadState({ lovbestemtFerieSomSkalSlettes: [] }, true);
            this.updateSoknad({ lovbestemtFerieSomSkalSlettes: [] });
        }
    }

    private addSkalHaFerie = () => {
        if (!this.state.soknad.lovbestemtFerie) {
            this.state.soknad = { ...this.state.soknad, lovbestemtFerie: [{}] };
        }
        this.state.soknad.lovbestemtFerie!.push({ fom: '', tom: '' });
        this.forceUpdate();
        this.updateSoknad({ lovbestemtFerie: this.state.soknad.lovbestemtFerie });
    };

    private addIkkeSkalHaFerie = () => {
        if (!this.state.soknad.lovbestemtFerieSomSkalSlettes) {
            this.state.soknad = { ...this.state.soknad, lovbestemtFerieSomSkalSlettes: [{}] };
        }
        this.state.soknad.lovbestemtFerieSomSkalSlettes!.push({ fom: '', tom: '' });
        this.forceUpdate();
        this.updateSoknad({ lovbestemtFerieSomSkalSlettes: this.state.soknad.lovbestemtFerieSomSkalSlettes });
    };

    private updateOmsorgstilbud(checked: boolean) {
        this.setState({
            iTilsynsordning: checked,
        });

        if (
            !!checked &&
            (!this.state.soknad.tilsynsordning || this.state.soknad.tilsynsordning?.perioder?.length === 0)
        ) {
            this.addOmsorgstilbud();
        }

        if (!checked) {
            this.updateSoknadState({ tilsynsordning: undefined }, true);
            this.updateSoknad({ tilsynsordning: undefined });
        }
    }

    private updateMedisinskeOpplysninger(checked: boolean) {
        this.updateSoknadState({ harMedisinskeOpplysninger: !!checked }, true);
        this.updateSoknad({ harMedisinskeOpplysninger: !!checked });
    }

    private updateOpplysningerIkkeKanPunsjes(checked: boolean) {
        this.updateSoknadState({ harInfoSomIkkeKanPunsjes: !!checked }, true);
        this.updateSoknad({ harInfoSomIkkeKanPunsjes: !!checked });
    }

    private getSoknadFromStore = () => {
        return new PSBSoknadUt(this.props.punchFormState.soknad as IPSBSoknadUt);
    };

    private getManglerFromStore = () => {
        return this.props.punchFormState.inputErrors;
    };

    private erFremITid(dato: string) {
        const naa = new Date();
        return naa < new Date(dato);
    }

    private erFremITidKlokkeslett(dato: string) {
        const { mottattDato } = this.state.soknad;
        const naa = new Date();
        if (
            !!mottattDato &&
            naa.getDate() === new Date(mottattDato!).getDate() &&
            initializeDate(naa).format('HH:mm') < dato
        ) {
            return true;
        }
        return false;
    }

    getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        if (!this.state.feilmeldingStier.has(attribute)) {
            this.setState({ feilmeldingStier: this.state.feilmeldingStier.add(attribute) });
        }

        const uhaandterteFeilmeldinger = this.getManglerFromStore()?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                const andreFeilmeldingStier = new Set(this.state.feilmeldingStier);
                andreFeilmeldingStier.delete(attribute);
                if (attribute === felt) {
                    return true;
                }
                if (andreFeilmeldingStier.has(felt)) {
                    return false;
                }
            }
            return false;
        });

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => error.feilmelding).filter(Boolean);
        }
        return [];
    };

    private getErrorMessage = (attribute: string, indeks?: number) => {
        const { mottattDato, klokkeslett } = this.state.soknad;
        if (!this.state.feilmeldingStier.has(attribute)) {
            this.setState({ feilmeldingStier: this.state.feilmeldingStier.add(attribute) });
        }

        if (attribute === 'klokkeslett' || attribute === 'mottattDato') {
            if (klokkeslett === null || klokkeslett === '' || mottattDato === null || mottattDato === '') {
                return intlHelper(this.props.intl, 'skjema.feil.ikketom');
            }
        }

        if (attribute === 'mottattDato' && !!mottattDato && this.erFremITid(mottattDato!)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        if (attribute === 'klokkeslett' && !!klokkeslett && this.erFremITidKlokkeslett(klokkeslett!)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        const errorMsg = this.getManglerFromStore()?.filter((m: IInputError) => m.felt === attribute)?.[indeks || 0]
            ?.feilmelding;

        if (errorMsg) {
            if (errorMsg.startsWith('Mangler søknadsperiode')) {
                return intlHelper(this.props.intl, 'skjema.feil.søknadsperiode/endringsperiode');
            }
            if (attribute === 'nattevåk' || attribute === 'beredskap' || 'lovbestemtFerie') {
                return errorMsg;
            }
        }

        return !!errorMsg
            ? // intlHelper(intl, `skjema.feil.${attribute}`) : undefined;

              intlHelper(
                  this.props.intl,
                  `skjema.feil.${attribute}.${errorMsg}`
                      .replace(/\[\d+]/g, '[]')
                      .replace(
                          /^skjema\.feil\..+\.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED$/,
                          'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED'
                      )
                      .replace(/^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/, 'skjema.feil.fraOgMed.MAA_SETTES')
                      .replace(
                          /^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/,
                          'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED'
                      )
                      .replace(/^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/, 'skjema.feil.tilOgMed.MAA_SETTES')
                      .replace(/^skjema.feil.mottattDato.must not be null$/, 'skjema.feil.datoMottatt.MAA_SETTES')
              )
            : undefined;
    };

    private updateSoknadState = (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => {
        this.state.soknad.journalposter!.add(this.props.journalpostid);
        this.setState({
            soknad: { ...this.state.soknad, ...soknad },
            showStatus: !!showStatus,
        });
    };

    private updateSoknadStateCallbackFunction = (soknad: Partial<IPSBSoknad>) => {
        this.updateSoknadState(soknad);
    };

    private updateSoknad = (soknad: Partial<IPSBSoknad>) => {
        this.setState({ showStatus: true });
        const navarandeSoknad: PSBSoknadUt = this.getSoknadFromStore();
        const journalposter = Array.from(navarandeSoknad?.journalposter ? navarandeSoknad?.journalposter : []);

        if (!journalposter.includes(this.props.journalpostid)) {
            journalposter.push(this.props.journalpostid);
        }

        if (this.state.harForsoektAaSendeInn) {
            this.props.validateSoknad({...this.getSoknadFromStore(), ...soknad, journalposter: journalposter}, true)
        }

        return this.props.updateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter: journalposter });
    };

    private handleStartButtonClick = () => {
        this.props.resetPunchFormAction();
        setHash('/');
    };

    private changeAndBlurUpdatesSoknad = (change: (event: any) => Partial<IPSBSoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event)),
    });

    private addOmsorgstilbud = () => {
        if (!this.state.soknad.tilsynsordning) {
            this.state.soknad = { ...this.state.soknad, tilsynsordning: { perioder: [] } };
        }
        this.state.soknad.tilsynsordning!.perioder!.push({ periode: {}, timer: 0, minutter: 0 });
        this.forceUpdate();
        this.updateSoknad({ tilsynsordning: this.state.soknad.tilsynsordning });
    };

    private addOpphold = () => {
        if (!this.state.soknad.utenlandsopphold) {
            this.state.soknad = { ...this.state.soknad, utenlandsopphold: [{}] };
        }
        const utenlandsopphold = [{ land: undefined, periode: {} }];
        this.updateSoknadState({ utenlandsopphold });
        this.updateSoknad({ utenlandsopphold });
    };

    private statusetikett() {
        if (!this.state.showStatus) {
            return null;
        }

        const { punchFormState } = this.props;
        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{ className }}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateSoknadError) {
            return <EtikettAdvarsel {...{ className }}>Lagring feilet</EtikettAdvarsel>;
        }
        return <EtikettSuksess {...{ className }}>Lagret</EtikettSuksess>;
    }
}

const mapStateToProps = (state: RootStateType): IPunchFormStateProps => ({
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    signaturState: state.PLEIEPENGER_SYKT_BARN.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getSoknad(id)),
    hentPerioder: (ident1: string, ident2: string) => dispatch(hentPerioderFraK9Sak(ident1, ident2)),
    resetSoknadAction: () => dispatch(resetSoknadAction()),
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeSoknadAction()),
    updateSoknad: (soknad: Partial<IPSBSoknadUt>) => dispatch(updateSoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitSoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchFormAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (soknad: IPSBSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerSoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerSoknadResetAction()),
});

export const PSBPunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent));
/* eslint-enable */
