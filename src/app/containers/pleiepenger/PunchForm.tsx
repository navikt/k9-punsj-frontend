import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {Arbeidsforhold, JaNei, JaNeiVetikke, PunchStep} from 'app/models/enums';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {IPleiepengerPunchState, IPunchFormState, ISignaturState} from 'app/models/types';
import {
    getSoknad,
    resetPunchFormAction,
    resetSoknadAction,
    setIdentAction,
    setSignaturAction,
    setStepAction,
    submitSoknad,
    undoChoiceOfEksisterendeSoknadAction,
    updateSoknad,
} from 'app/state/actions';
import {setHash} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeFeil} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import {CheckboksPanelGruppe, Checkbox, Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {
    IPSBSoknad,
    ISelvstendigNaeringsdrivendeOpptjening,
    IUtenlandsOpphold,
    PSBSoknad,
    TilleggsinformasjonV2,
} from "../../models/types/PSBSoknad";
import {
    IPeriodeMedTimerMinutter,
    IPeriodeV2,
    PeriodeMedFaktiskeTimer,
    PeriodeMedTimerMinutter
} from "../../models/types/PeriodeV2";
import {IFrilanserOpptjening} from "../../models/types/FrilanserOpptjening";
import {EkspanderbartpanelBase} from "nav-frontend-ekspanderbartpanel";
import './punchForm.less'
import {JaNeiIkkeOpplyst} from "../../models/enums/JaNeiIkkeOpplyst";
import VerticalSpacer from "../../components/VerticalSpacer";
import {Periodepaneler} from "./Periodepaneler";
import Panel from "nav-frontend-paneler";
import {BeredskapNattevaak} from "../../models/enums/BeredskapNattevaak";
import {PeriodeinfoPaneler} from "./PeriodeinfoPaneler";
import {pfTilleggsinformasjon} from "./pfTilleggsinformasjon";
import {RootStateType} from "../../state/RootState";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {connect} from "react-redux";
import {PunchFormPaneler} from "../../models/enums/PunchFormPaneler";
import {ArbeidstidInput} from "../../components/arbeidstid-input/ArbeidstidInput";
import {pfLand} from "./pfLand";
import {pfTimerMinutter} from "./pfTimerMinutter";
import {IPSBSoknadUt, PSBSoknadUt} from "../../models/types/PSBSoknadUt";


export interface IPunchFormComponentProps {
    getPunchPath: (step: PunchStep, values?: any) => string;
    journalpostid: string;
    id: string;
}

export interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    punchState: IPleiepengerPunchState;
    signaturState: ISignaturState;
}

export interface IPunchFormDispatchProps {
    getSoknad: typeof getSoknad;
    resetSoknadAction: typeof resetSoknadAction;
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    undoChoiceOfEksisterendeSoknadAction: typeof undoChoiceOfEksisterendeSoknadAction;
    updateSoknad: typeof updateSoknad;
    submitSoknad: typeof submitSoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
}

export interface IPunchFormComponentState {
    soknad: IPSBSoknad;
    isFetched: boolean;
    showStatus: boolean;
    faktiskeTimer: string[][];
    iTilsynsordning: JaNeiVetikke;
    iUtlandet: JaNeiIkkeOpplyst;
    skalHaFerie: JaNeiIkkeOpplyst;
    arbeidstaker: boolean,
    frilanser: boolean,
    selvstendigNæringsdrivende: boolean;
    expandAll: boolean;
    frilanserStartdato: string;
    jobberFortsattSomFrilanser: JaNei;
    barnetSkalLeggesInn: JaNei;
    innleggelseUtlandet: IPeriodeV2[];
    beredskap: boolean;
    nattevaak: boolean;
    harBoddIUtlandet: JaNei;
    skalBoIUtlandet: JaNei;
    medlemskap: IUtenlandsOpphold[];
    aapnePaneler: PunchFormPaneler[]

}

type IPunchFormProps = IPunchFormComponentProps &
    WrappedComponentProps &
    IPunchFormStateProps &
    IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps,
    IPunchFormComponentState> {
    state: IPunchFormComponentState = {
        soknad: {
            soeknadId: '',
            soekerId: '',
            erFraK9: false,
            mottattDato: '',
            journalposter: [],
            sendtInn: false,
            barn: {
                norskIdent: '',
                foedselsdato: '',
            },
            opptjeningAktivitet: {},
            arbeidstid: {},

            tilsynsordning: {},
            utenlandsopphold: [],
            omsorg: {},
        },
        isFetched: false,
        showStatus: false,
        faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
        iTilsynsordning: JaNeiVetikke.NEI,
        arbeidstaker: false,
        frilanser: false,
        selvstendigNæringsdrivende: false,
        expandAll: false,
        frilanserStartdato: '',
        jobberFortsattSomFrilanser: JaNei.NEI,
        innleggelseUtlandet: [],
        barnetSkalLeggesInn: JaNei.NEI,
        beredskap: false,
        nattevaak: false,
        harBoddIUtlandet: JaNei.NEI,
        skalBoIUtlandet: JaNei.NEI,
        medlemskap: [],
        iUtlandet: JaNeiIkkeOpplyst.IKKE_OPPLYST,
        skalHaFerie: JaNeiIkkeOpplyst.IKKE_OPPLYST,
        aapnePaneler: [],
    };

    private initialPeriode: IPeriodeV2 = {fom: '', tom: ''};

    private initialPeriodeTimerMinutter = new PeriodeMedTimerMinutter({
        periode: {fom: '', tom: ''},
        timer: '',
        minutter: ''
    });

    private initialPeriodeMedTimer = new PeriodeMedFaktiskeTimer({
        periode: {fom: '', tom: ''},
        faktiskArbeidTimerPerDag: ''
    });

    private initialBeredskap = new TilleggsinformasjonV2({
        periode: this.initialPeriode,
        tilleggsinformasjon: '',
    });

    private  initialNattevaak = new TilleggsinformasjonV2({
        periode: this.initialPeriode,
        tilleggsinformasjon: '',
    });

    private initialArbeidstaker = new ArbeidstakerV2({
        arbeidstidInfo: {
            jobberNormaltTimerPerDag: '',
            perioder: [{
                periode: {
                    fom: '',
                    tom: '',
                },
                faktiskArbeidTimerPerDag: ''
            }],

        },
        organisasjonsnummer: '',
        norskIdent: null,
    });


    componentDidMount(): void {
        const {id} = this.props;
        this.props.getSoknad(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
        this.setState(this.state);
    }

    componentDidUpdate(
        prevProps: Readonly<IPunchFormProps>,
        prevState: Readonly<IPunchFormComponentState>,
        snapshot?: any
    ): void {
        const {soknad} = this.props.punchFormState;
        if (!!soknad && !this.state.isFetched) {
            this.setState({
                soknad: new PSBSoknad(this.props.punchFormState.soknad as IPSBSoknad),
                isFetched: true,
                faktiskeTimer: this.faktiskTimer(new PSBSoknad(this.state.soknad))
            });

        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {
        const {intl, punchFormState, punchState, signaturState} = this.props;

        const soknad = new PSBSoknad(this.state.soknad);
        const {signert} = signaturState;


        if (punchFormState.isComplete) {
            setHash(this.props.getPunchPath(PunchStep.COMPLETED));
            return null;
        }

        if (punchFormState.isSoknadLoading) {
            return <NavFrontendSpinner/>;
        }

        if (!!punchFormState.error) {
            return (
                <>
                    <AlertStripeFeil>
                        {intlHelper(intl, 'skjema.feil.ikke_funnet', {id: this.props.id})}
                    </AlertStripeFeil>
                    <p>
                        <Knapp onClick={this.handleStartButtonClick}>
                            {intlHelper(intl, 'skjema.knapp.tilstart')}
                        </Knapp>
                    </p>
                </>
            );
        }

        if (!soknad) {
            return null;
        }

        const initialUtenlandsopphold: IUtenlandsOpphold = {periode: {fom: '', tom: ''}, land: ''};

        const initialTimerMinutter: IPeriodeMedTimerMinutter = { periode: {fom: '', tom: ''}, timer: '', minutter: ''}

        const initialSelvstendigNaeringsdrivende: ISelvstendigNaeringsdrivendeOpptjening = {
            perioder: [],
        };
        const initialFrilanser: IFrilanserOpptjening = {
            startDato: '',
            jobberFortsattSomFrilans: false,
        };

        const arbeidstakerperioder = () => {
            const updateTgStrings = () =>
                this.setState({
                    faktiskeTimer: this.faktiskTimer(soknad),
                });
            const arbeid = soknad.arbeidstid;

            return (<Listepaneler
                intl={intl}
                items={arbeid.arbeidstakerList}
                component={pfArbeidstaker(this.state.faktiskeTimer,
                    (faktiskeTimer) => this.setState({ faktiskeTimer }),
                    () => this.faktiskTimer(soknad))}
                panelid={(i) => `arbeidstakerpanel_${i}`}
                initialItem={this.initialArbeidstaker}
                editSoknad={(arbeidstakerList) =>
                    this.updateSoknad(
                        {
                            arbeidstid: {
                                arbeidstakerList
                            }
                        }
                    )
                }
                editSoknadState={(arbeidstakerList, showStatus) =>
                    this.updateSoknadState(
                        {
                            arbeidstid: {
                                arbeidstakerList
                            }
                        },
                        showStatus
                    )

                }
                textLeggTil={'skjema.arbeid.arbeidstaker.leggtilperiode'
                }
                textFjern="skjema.arbeid.arbeidstaker.fjernarbeidsgiver"
                panelClassName="arbeidstakerpanel"
                feilkodeprefiks={'arbeid.arbeidstaker'}
                onAdd={updateTgStrings}
                onRemove={updateTgStrings}
                kanHaFlere={true}
            />)
        };

        const frilanserperioder = (harOverskrift?: boolean) => {
            const arbeid = soknad.arbeidstid;
            const opptjening = soknad.opptjeningAktivitet;
            return (
                <>
                    <Input
                        id="frilanser-startdato"
                        bredde={"M"}
                        label={intlHelper(intl, 'skjema.frilanserdato')}
                        type="date"
                        value={this.state.soknad.opptjeningAktivitet.frilanser?.startDato || ''}
                        className={"frilanser-startdato"}
                        onChange={(e) => {
                            this.updateSoknadState({opptjeningAktivitet: {frilanser: {...soknad.opptjeningAktivitet.frilanser, startDato: e.target.value}}})
                        }}
                    />
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        name={"fortsattFrilanser"}
                        radios={Object.values(JaNei).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        legend={intlHelper(intl, 'skjema.fortsattfrilanser')}
                        checked={opptjening.frilanser ? (opptjening.frilanser.jobberFortsattSomFrilans ? JaNei.JA : JaNei.NEI) : JaNei.NEI}
                        onChange={(event) => {
                            this.handleFrilanserChange((event.target as HTMLInputElement).value as JaNei)}}/>
                    {this.state.soknad.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans &&
                    (<>
                        <p className={"frilanser-info"}>{intlHelper(intl, 'skjema.frilanser.periode')}</p>
                        <ArbeidstidInput
                            intl={intl}
                            periodeMedTimer={arbeid.frilanserArbeidstidInfo || {}}
                            onChange={(periode => {this.updateSoknadState({
                                arbeidstid: {
                                    frilanserArbeidstidInfo: periode}})})}
                            onBlur={(periode => {this.updateSoknadInformasjon({
                                arbeidstid: {
                                    frilanserArbeidstidInfo: periode}})})}

                        /></>)}</>);
        };


        const selvstendigperioder = (harOverskrift?: boolean) => {
        const arbeid = soknad.arbeidstid;
            return (<PeriodeinfoPaneler
                intl={intl}
                periods={arbeid.selvstendigNæringsdrivendeArbeidstidInfo.perioder}
                panelid={(i) => `selvstendignaeringsdrivendepanel_${i}`}
                initialPeriodeinfo={initialSelvstendigNaeringsdrivende}
                editSoknad={(perioder) =>
                    this.updateSoknadInformasjon(
                        {
                            arbeidstid: {
                                selvstendigNæringsdrivendeArbeidstidInfo: {
                                    ...arbeid.selvstendigNæringsdrivendeArbeidstidInfo,
                                    perioder
                                }
                            }
                        }
                    )
                }
                editSoknadState={(perioder, showStatus) =>
                    this.updateSoknadState(
                        {
                            arbeidstid: {
                                selvstendigNæringsdrivendeArbeidstidInfo: {
                                    ...arbeid.selvstendigNæringsdrivendeArbeidstidInfo,
                                    perioder
                                }
                            }
                        },
                        showStatus
                    )
                }
                textLeggTil={
                    harOverskrift
                        ? 'skjema.arbeid.leggtilperiode'
                        : 'skjema.arbeid.selvstendignaeringsdrivende.leggtilperiode'
                }
                textFjern="skjema.arbeid.selvstendignaeringsdrivende.fjernperiode"
                panelClassName="selvstendignaeringsdrivendepanel"
              //  getErrorMessage={errorMessageFunction}
                feilkodeprefiks={'arbeid.selvstendigNaeringsdrivende'}
                kanHaFlere={true}
            />
        )};

        const beredskapperioder = () => {
            return (<PeriodeinfoPaneler
                intl={intl}
                periods={soknad.beredskap}
                component={pfTilleggsinformasjon('beredskap')}
                panelid={(i) => `beredskapspanel_${i}`}
                initialPeriodeinfo={this.initialBeredskap}
                editSoknad={(beredskap) => this.updateSoknad( { beredskap })}
                editSoknadState={(beredskap, showStatus) =>
                    this.updateSoknadState({ beredskap }, showStatus)
                }
                textLeggTil="skjema.beredskap.leggtilperiode"
                textFjern="skjema.beredskap.fjernperiode"
                className="beredskapsperioder"
                panelClassName="beredskapspanel"
                getErrorMessage={() => undefined}
                feilkodeprefiks={'beredskap'}
                kanHaFlere={true}
            />
        )};

        const nattevaakperioder = () => {
            return (<PeriodeinfoPaneler
                intl={intl}
                periods={soknad.nattevaak}
                component={pfTilleggsinformasjon('nattevaak')}
                panelid={(i) => `nattevaakspanel_${i}`}
                initialPeriodeinfo={this.initialNattevaak}
                editSoknad={(nattevaak) => this.updateSoknadInformasjon({ nattevaak } )}
                editSoknadState={(nattevaak, showStatus) =>
                    this.updateSoknadState({nattevaak} , showStatus)
                }
                textLeggTil="skjema.nattevaak.leggtilperiode"
                textFjern="skjema.nattevaak.fjernperiode"
                className="nattevaaksperioder"
                panelClassName="nattevaakspanel"
                getErrorMessage={() => undefined}
                feilkodeprefiks={'nattevaak'}
                kanHaFlere={true}
            />
        )};


        return (
            <>
                {this.backButton()}
                {this.statusetikett()}
                {!!punchFormState.updateSoknadError && (
                    <AlertStripeFeil>
                        {intlHelper(intl, 'skjema.feil.ikke_lagret')}
                    </AlertStripeFeil>
                )}
                {!!punchFormState.submitSoknadError && (
                    <AlertStripeFeil>
                        {intlHelper(intl, 'skjema.feil.ikke_sendt')}
                    </AlertStripeFeil>
                )}
                <Checkbox
                    label={intlHelper(intl, "skjema.ekspander")}
                    onChange={(e) => {
                        this.setState({expandAll: e.target.checked});
                        this.forceUpdate();
                    }}
                />
                <VerticalSpacer sixteenPx={true}/>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}
                >
                    <SkjemaGruppe>
                        <div className={"input-row"}>
                            <Input
                                id="soknad-dato"
                                bredde={"M"}
                                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                                type="date"
                                value={soknad.mottattDato}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    mottattDato: event.target.value,
                                }))}
                                //       feil={this.getErrorMessage('datoMottatt')}

                            /></div>
                        <div className={"datocontainer"}>
                            <Input
                                id="soknadsperiode-fra"
                                bredde={"M"}
                                label={intlHelper(intl, 'skjema.soknasperiodefra')}
                                type="date"
                                className="fom"
                                value={soknad.soeknadsperiode.fom || ''}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    soeknadsperiode: {...soknad.soeknadsperiode, fom: event.target.value}
                                }))}
                                //       feil={this.getErrorMessage('datoMottatt')}

                            />
                            <Input
                                id="soknadsperiode-til"
                                bredde={"M"}
                                label={intlHelper(intl, 'skjema.soknasperiodetil')}
                                type="date"
                                className="tom"
                                value={soknad.soeknadsperiode.tom || ''}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    soeknadsperiode: {...soknad.soeknadsperiode, tom: event.target.value},
                                }))}
                                //       feil={this.getErrorMessage('datoMottatt')}

                            />
                        </div>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            name="signatur"
                            legend={intlHelper(intl, 'ident.signatur.etikett')}
                            checked={signert || undefined}
                            onChange={(event) =>
                                this.props.setSignaturAction(
                                    ((event.target as HTMLInputElement).value as JaNei) || null
                                )
                            }
                        /></SkjemaGruppe>
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}>
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                            label: intlHelper(intl, jnv),
                            value: jnv,
                        }))}
                        name="utlandjaneiikeeopplyst"
                        legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                        onChange={(event) =>
                            this.updateUtenlandsopphold(
                                (event.target as HTMLInputElement).value as JaNeiIkkeOpplyst
                            )
                        }
                        checked={this.state.iUtlandet}
                    />
                    {!!soknad.utenlandsopphold.length && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.utenlandsopphold}
                            component={pfLand()}
                            panelid={(i) => `utenlandsoppholdpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(perioder) => this.updateSoknadInformasjon({ utenlandsopphold: perioder } )}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({utenlandsopphold: perioder} , showStatus)
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="utenlandsopphold"
                            panelClassName="utenlandsoppholdpanel"
                            getErrorMessage={() => undefined}
                            feilkodeprefiks={'utenlandsopphold'}
                            kanHaFlere={true}
                        />
                    )}
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNei).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        name="innleggelseiutlandetjanei"
                        legend={intlHelper(intl, 'skjema.utenlandsopphold.innleggelse')}
                        onChange={(event) =>
                            this.handleBarnetSkalLeggesInn((event.target as HTMLInputElement).value as JaNei)
                        }
                        checked={this.state.barnetSkalLeggesInn}
                    />
                    {this.state.barnetSkalLeggesInn === JaNei.JA && (
                        <Periodepaneler
                            intl={intl}
                            periods={this.state.innleggelseUtlandet}
                            panelid={(i) => `innleggelseperiodepanel_${i}`}
                            initialPeriodeinfo={this.initialPeriode}
                            editSoknad={(perioder) =>
                                this.setState(
                                    {innleggelseUtlandet: perioder})
                            }
                            editSoknadState={(perioder, showStatus) =>
                                this.setState(
                                    {innleggelseUtlandet: perioder}
                                )
                            }
                            getErrorMessage={() => undefined}
                            feilkodeprefiks={'perioder'}
                            minstEn={false}
                            kanHaFlere={true}
                        />)}

                    <VerticalSpacer eightPx={true}/>
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                            label: intlHelper(intl, jnv),
                            value: jnv,
                        }))}
                        name="feriejaneiikeeopplyst"
                        legend={intlHelper(intl, 'skjema.ferie.label')}
                        onChange={(event) =>
                            this.updateFerie(
                                (event.target as HTMLInputElement).value as JaNeiIkkeOpplyst
                            )
                        }
                        checked={this.state.skalHaFerie}
                    />
                    {!!soknad.lovbestemtFerie.length && (
                        <Periodepaneler
                            intl={intl}
                            periods={soknad.lovbestemtFerie}
                            panelid={(i) => `ferieperiodepanel_${i}`}
                            initialPeriodeinfo={this.initialPeriode}
                            editSoknad={(perioder) =>
                                this.updateSoknadInformasjon(
                                    {lovbestemtFerie: perioder})
                            }
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState(
                                    {lovbestemtFerie: perioder},
                                    showStatus
                                )
                            }
                            getErrorMessage={() => undefined}
                            feilkodeprefiks={'perioder'}
                            minstEn={false}
                            kanHaFlere={true}
                        />)
                    }
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}>
                    <Input
                        id="relasjontilbarnet"
                        bredde={"S"}
                        label={intlHelper(intl, 'skjema.relasjontilbarnet')}
                        className="relasjontilbarnet"
                        value={soknad.omsorg.relasjonTilBarnet || ''}
                        {...this.changeAndBlurUpdatesSoknad((event) => ({
                            omsorg: {...soknad.omsorg, relasjonTilBarnet: event.target.value}
                        }))}/>
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.ARBEID)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.ARBEID)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.ARBEID)}>
                    <CheckboksPanelGruppe
                        checkboxes={Object.values(Arbeidsforhold).map((af) => ({
                            label: intlHelper(intl, af),
                            value: af,
                            onChange: (e) => this.handleArbeidsforholdChange(af, e.target.checked),
                            checked: this.getCheckedValueArbeid(af)
                        }))}
                        onChange={() => undefined}/>
                    {!!this.state.arbeidstaker && (
                        <>{arbeidstakerperioder()}</>
                    )}
                    {!!this.state.frilanser && (
                        <Panel className={"frilanserpanel"}>
                            {frilanserperioder()}
                        </Panel>
                    )}
                    {!!this.state.selvstendigNæringsdrivende && (
                        <Panel className={"selvstendigpanel"}>
                            {selvstendigperioder()}
                        </Panel>
                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OMSORGSTILBUD)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.OMSORGSTILBUD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OMSORGSTILBUD)}>
                    <h4>
                        {intlHelper(intl, "skjema.omsorgstilbud.info")}
                    </h4>
                    <PeriodeinfoPaneler
                        intl={intl}
                        periods={soknad.tilsynsordning.perioder}
                        component={pfTimerMinutter()}
                        panelid={(i) => `tilsynsordningpanel_${i}`}
                        initialPeriodeinfo={initialTimerMinutter}
                        editSoknad={(perioder) => this.updateSoknadInformasjon({ tilsynsordning: {perioder} } )}
                        editSoknadState={(perioder, showStatus) =>
                            this.updateSoknadState({tilsynsordning: {perioder}} , showStatus)
                        }
                        textLeggTil="skjema.perioder.legg_til"
                        textFjern="skjema.perioder.fjern"
                        className="bosteder"
                        panelClassName="tilsynsordningpanel"
                        getErrorMessage={() => undefined}
                        feilkodeprefiks={'tilsynsordning'}
                        kanHaFlere={true}
                    />
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.BEREDSKAPNATTEVAAK)}>
                    <CheckboksPanelGruppe
                        checkboxes={Object.values(BeredskapNattevaak).map((bn) => ({
                            label: intlHelper(intl, bn),
                            value: bn,
                            onChange: (e) => this.handleBeredskapNattevaakChange(bn, e.target.checked),
                            checked: this.getCheckedValueBeredskapNattevaak(bn)
                        }))}
                        onChange={() => undefined}/>
                    {this.state.beredskap && (
                        <>{beredskapperioder()}</>

                    )}
                    {this.state.nattevaak && (
                        <>{nattevaakperioder()}</>

                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}>
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNei).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        name="medlemskapjanei"
                        legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                        onChange={(event) =>
                            this.handleMedlemskapChange((event.target as HTMLInputElement).value as JaNei)
                        }
                        checked={this.state.harBoddIUtlandet}
                    />
                    {this.state.harBoddIUtlandet === JaNei.JA && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.bosteder}
                            component={pfLand()}
                            panelid={(i) => `bostederpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(bosteder) => this.updateSoknadInformasjon({ bosteder } )}
                            editSoknadState={(bosteder, showStatus) =>
                                this.updateSoknadState({bosteder} , showStatus)
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="bosteder"
                            panelClassName="utenlandsoppholdpanel"
                            getErrorMessage={() => undefined}
                            feilkodeprefiks={'bosteder'}
                            kanHaFlere={true}
                        />
                    )}
                </EkspanderbartpanelBase>
                <p className="sendknapp-wrapper">
                    <Knapp
                        onClick={() => {
                            this.updateSoknadInformasjon({barn: {norskIdent: punchState.ident2 || ''}});
                            this.props.submitSoknad(
                                this.props.punchState.ident1,
                                this.props.id
                            )
                        }}
                        disabled={false}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Knapp>
                </p>
            </>);
    }

    private submitSoknad = () => {
        const oppdatertSoknad = this.getSoknadFromStore()
    }

    private handlePanelClick = (p: PunchFormPaneler) => {
        const { aapnePaneler } = this.state;
        if (aapnePaneler.some((panel) => panel === p)) {
            aapnePaneler.splice(aapnePaneler.indexOf(p), 1);
        } else {
            aapnePaneler.push(p);
        }
        this.forceUpdate();
    }

    private checkOpenState = (p: PunchFormPaneler): boolean => {
        const { aapnePaneler, expandAll } = this.state;
        if (expandAll && aapnePaneler.some((panel) => panel === p)) {
            return false;
        }
        else if (expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return true;
        }
        else if (!expandAll && aapnePaneler.some((panel) => panel === p)) {
            return true;
        }
        else if (!expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return false;
        }
        return false;
    }

    private handleArbeidsforholdChange = (af: Arbeidsforhold, checked: boolean) => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                this.setState({arbeidstaker: checked})
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.arbeidstakerList?.length) {
                        this.updateSoknadState({arbeidstid: { arbeidstakerList: [this.initialArbeidstaker]}})
                    }
                } else {
                    this.updateSoknadState({arbeidstid: { arbeidstakerList: []}})
                }
                break;
            case Arbeidsforhold.FRILANSER:
                this.setState({frilanser: checked})
                break;
            case Arbeidsforhold.SELVSTENDIG:
                this.setState({selvstendigNæringsdrivende: checked})
                break;

        }
    }


    private getCheckedValueArbeid = (af: Arbeidsforhold): boolean => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                return this.state.arbeidstaker
            case Arbeidsforhold.FRILANSER:
                return this.state.frilanser
            case Arbeidsforhold.SELVSTENDIG:
                return this.state.selvstendigNæringsdrivende
        }
    }

    private handleBeredskapNattevaakChange = (bn: BeredskapNattevaak, checked: boolean) => {
        switch (bn) {
            case BeredskapNattevaak.BEREDSKAP:
                this.setState({beredskap: checked})
                if(checked) {
                    if (!this.state.soknad.beredskap?.length) {
                        this.updateSoknadState({beredskap: [this.initialBeredskap]})
                    }
                } else {
                    this.updateSoknadState({beredskap: []})
                }
                break;
            case BeredskapNattevaak.NATTEVAAK:
                this.setState({nattevaak: checked})
                if(checked) {
                    if (!this.state.soknad.nattevaak?.length) {
                        this.updateSoknadState({nattevaak: [this.initialBeredskap]})
                    }
                } else {
                    this.updateSoknadState({nattevaak: []})
                }
                break;

        }
    }

    private getCheckedValueBeredskapNattevaak = (bn: BeredskapNattevaak): boolean => {
        switch (bn) {
            case BeredskapNattevaak.BEREDSKAP:
                return this.state.beredskap
            case BeredskapNattevaak.NATTEVAAK:
                return this.state.nattevaak
        }
    }


    private faktiskTimer = (soknad: PSBSoknad) => {
        // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
        return soknad ? soknad.arbeidstid.faktiskeTimer() : [];
    };

    private updateTilsynsordning(jaNeiVetikke: JaNeiVetikke) {
        this.setState({
            iTilsynsordning: jaNeiVetikke,
        });

        if (
            jaNeiVetikke === JaNeiVetikke.JA &&
            this.state.soknad.tilsynsordning!.perioder!.length === 0
        ) {
            this.state.soknad.tilsynsordning!.perioder!.push(this.initialPeriodeTimerMinutter);
        }
//    this.updateSoknadState({ tilsynsordning }, true);
//    this.updateSoknadInformasjon({ tilsynsordning });
    }

    private updateUtenlandsopphold(jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) {
        this.setState({
            iUtlandet: jaNeiIkkeOpplyst,
        });

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA &&
            this.state.soknad.utenlandsopphold!.length === 0) {
            this.addOpphold()
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({utenlandsopphold: []}, true);
            this.updateSoknadInformasjon({utenlandsopphold: []})
        }
    }

    private handleBarnetSkalLeggesInn(jaNei: JaNei) {
        this.setState({
            barnetSkalLeggesInn: jaNei,
        });

        if (jaNei === JaNei.JA &&
            this.state.innleggelseUtlandet!.length === 0) {
            this.state.innleggelseUtlandet!.push({ fom: '', tom: ''});
            this.forceUpdate();
        };


        if (jaNei !== JaNei.JA) {
            this.setState({innleggelseUtlandet: []})
        }
    }

    private handleMedlemskapChange(jaNei: JaNei) {
        this.setState({
            harBoddIUtlandet: jaNei,
        });

        if (jaNei === JaNei.JA &&
            this.state.soknad.bosteder!.length === 0) {
            this.state.soknad.bosteder!.push({periode: { fom: '', tom: ''}, land: ''});
            this.forceUpdate();
        };
    }

    private handleFrilanserChange(jaNei: JaNei) {

        if (jaNei === JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    frilanserArbeidstidInfo: this.initialPeriodeMedTimer
                }, opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true
                    }
                }
            })
            this.updateSoknadInformasjon({
                arbeidstid: {
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.forceUpdate();
        };

        if (jaNei !== JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.updateSoknadInformasjon({
                arbeidstid: {
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.forceUpdate();
        };
    }

    private updateFerie(jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) {
        this.setState({
            skalHaFerie: jaNeiIkkeOpplyst,
        });

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA &&
            this.state.soknad.lovbestemtFerie!.length === 0) {
            this.addFerie()
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({lovbestemtFerie: []}, true);
            this.updateSoknadInformasjon({lovbestemtFerie: []})
        }
    }

    private backButton() {
        return (
            <p>
                <Knapp onClick={this.handleBackButtonClick}>
                    {intlHelper(this.props.intl, 'skjema.knapp.tilbake')}
                </Knapp>
            </p>
        );
    }

    private getSoknadFromStore = () => {
        return new PSBSoknadUt(this.props.punchFormState.soknad as IPSBSoknadUt)
    };

    /*private getManglerFromStore = (nr?: 1 | 2) => {
       const { ident1, ident2 } = this.props.punchState;
       const ident = nr === 2 && ident2 ? ident2 : ident1;
       const personlig = this.props.punchFormState.mappe?.personer;
       return personlig?.[ident]?.mangler;
     };

     private getErrorMessage = (attribute: string, nr?: 1 | 2) => {
       const errorMsg = this.getManglerFromStore(nr)?.filter(
         (m: IInputError) => m.attributt === attribute
       )?.[0]?.melding;
       return !!errorMsg
         ? intlHelper(
             this.props.intl,
             `skjema.feil.${attribute}.${errorMsg}`
               .replace(/\[\d+]/g, '[]')
               .replace(
                 /^skjema\.feil\..+\.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED$/,
                 'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED'
               )
               .replace(
                 /^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/,
                 'skjema.feil.fraOgMed.MAA_SETTES'
               )
               .replace(
                 /^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/,
                 'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED'
               )
               .replace(
                 /^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/,
                 'skjema.feil.tilOgMed.MAA_SETTES'
               )
           )
         : undefined;
     };

     */


    private updateSoknadState(
        soknad
            :
            Partial<IPSBSoknad>,
        showStatus ?: boolean
    ) {
        this.setState({
            soknad: {...this.state.soknad, ...soknad},
            showStatus: !!showStatus,
        });
    }

    private updateSoknadInformasjon = (
        soknad: Partial<IPSBSoknad>
    ) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            {...this.getSoknadFromStore(), ...soknad}
        );
    };

    private handleBackButtonClick = () => {
        const {getPunchPath} = this.props;
        this.props.resetSoknadAction();
        this.props.undoChoiceOfEksisterendeSoknadAction();
        setHash(
            getPunchPath(PunchStep.CHOOSE_SOKNAD)
        );
    };

    private handleStartButtonClick = () => {
        this.props.resetPunchFormAction();
        setHash('/');
    };

    private changeAndBlurUpdatesSoknad = (
        change: (event: any) => Partial<IPSBSoknad>
    ) => ({
        onChange: (event: any) =>
            this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknadInformasjon(change(event)),
    });

    private onChangeOnlyUpdate = (
        change: (event: any) => Partial<IPSBSoknad>
    ) => ({
        onChange: (event: any) => {
            this.updateSoknadState(change(event), true);
            this.updateSoknadInformasjon(change(event));
        },
    });


    private handleOppholdLandChange = (index: number, land: string) => {
        this.state.soknad.utenlandsopphold![index].land = land;
        this.forceUpdate();
    };

    private handleOppholdFomChange = (index: number, fom: string) => {
        this.state.soknad.utenlandsopphold![index].periode = {
            ...this.state.soknad.utenlandsopphold![index].periode,
            fom
        };
        this.forceUpdate();
    };

    private handleOppholdTomChange = (index: number, tom: string) => {
        this.state.soknad.utenlandsopphold![index].periode = {
            ...this.state.soknad.utenlandsopphold![index].periode,
            tom
        };
        this.forceUpdate();
    };

    private handleOppholdPeriodeChange = (index: number, periode: IPeriodeV2) => {
        this.state.soknad.utenlandsopphold![index].periode = periode;
        this.forceUpdate();
    };

    private addOpphold = () => {
        if (!this.state.soknad.utenlandsopphold) {
            this.state.soknad = {...this.state.soknad, utenlandsopphold: [{}]};
        } else if (!this.state.soknad.utenlandsopphold) {
            this.state.soknad.utenlandsopphold = [{}];
        }
        this.state.soknad.utenlandsopphold!.push({land: '', periode: {}});
        this.forceUpdate();
        this.setOpphold();
    };

    private removeOpphold = (index: number) => {
        this.state.soknad.utenlandsopphold!.splice(index, 1);
        this.forceUpdate();
        this.setOpphold();
    };

    private setOpphold = () => this.updateSoknad({utenlandsopphold: this.state.soknad.utenlandsopphold});

    private handleMedlemskapPeriodeChange = (index: number, periode: IPeriodeV2) => {
        this.state.medlemskap![index].periode = periode;
        this.forceUpdate();
    };

    private handleMedlemskapLandChange = (index: number, land: string) => {
        this.state.medlemskap![index].land = land;
        this.forceUpdate();
    };

    private addOppholdMedlemskap = () => {
        this.state.medlemskap!.push({land: '', periode: {}});
        this.forceUpdate();
    };

    private removeOppholdMedlemskap = (index: number) => {
        this.state.medlemskap!.splice(index, 1);
        this.forceUpdate();
    };

    private addFerie = () => {
        if (!this.state.soknad.lovbestemtFerie) {
            this.state.soknad = {...this.state.soknad, lovbestemtFerie: [{}]};
        } else if (!this.state.soknad.lovbestemtFerie) {
            this.state.soknad.lovbestemtFerie = [{}];
        }
        this.state.soknad.lovbestemtFerie!.push({fom: '', tom: ''});
        this.forceUpdate();
        this.updateSoknad({lovbestemtFerie: this.state.soknad.lovbestemtFerie})
    };

    private updateSoknad = (soknad: Partial<IPSBSoknad>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            {...this.getSoknadFromStore(), ...soknad},
        );
        this.forceUpdate();
    };

    private statusetikett() {
        if (!this.state.showStatus) {
            return null;
        }

        const {punchFormState} = this.props;
        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{className}}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateSoknadError) {
            return (
                <EtikettAdvarsel {...{className}}>Lagring feilet</EtikettAdvarsel>
            );
        }
        return <EtikettSuksess {...{className}}>Lagret</EtikettSuksess>;
    }
}

const mapStateToProps = (state: RootStateType): IPunchFormStateProps => ({
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    signaturState: state.PLEIEPENGER_SYKT_BARN.signaturState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getSoknad(id)),
    resetSoknadAction: () => dispatch(resetSoknadAction()),
    setIdentAction: (ident1: string, ident2: string | null) =>
        dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeSoknadAction()),
    updateSoknad: (
        soknad: Partial<IPSBSoknad>
    ) => dispatch(updateSoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) =>
        dispatch(submitSoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchFormAction()),
    setSignaturAction: (signert: JaNei | null) =>
        dispatch(setSignaturAction(signert)),
});

export const PunchForm = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)
);
