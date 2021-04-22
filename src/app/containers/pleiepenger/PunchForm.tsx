import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {Arbeidsforhold, JaNei, JaNeiVetikke, PunchStep} from 'app/models/enums';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {IPleiepengerPunchState, IPunchFormState, ISignaturState, ITilsyn,} from 'app/models/types';
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
import {Col, Container, Row} from 'react-bootstrap';
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {ISoknadV2, SoknadV2, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/Soknadv2";
import {IPeriodeV2, PeriodeMedFaktiskeTimer} from "../../models/types/PeriodeV2";
import {ISelvstendigNaeringsdrivendeV2} from "../../models/types/SelvstendigNæringsdrivendeV2";
import {IFrilanserV2} from "../../models/types/FrilanserV2";
import {PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {EkspanderbartpanelBase} from "nav-frontend-ekspanderbartpanel";
import './punchForm.less'
import {CountrySelect} from "../../components/country-select/CountrySelect";
import _ from "lodash";
import {JaNeiIkkeOpplyst} from "../../models/enums/JaNeiIkkeOpplyst";
import VerticalSpacer from "../../components/VerticalSpacer";
import {Periodepaneler} from "./Periodepaneler";
import Panel from "nav-frontend-paneler";
import {ArbeidstidinfoPaneler} from "./ArbeidstidinfoPaneler";
import {OppholdInput} from "../../components/opphold-input/OppholdInput";
import {PeriodInput} from "../../components/period-input/PeriodInput";
import {RootStateType} from "../../state/RootState";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {connect} from "react-redux";
import {BeredskapNattevaak} from "../../models/enums/BeredskapNattevaak";
import {pfTilleggsinformasjon} from "./pfTilleggsinformasjon";


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
    soknad: ISoknadV2;
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
    jobberFortsattSomFrilaser: JaNei;
    barnetSkalLeggesInn: JaNei;
    innleggelseUtlandet: IPeriodeV2[];
    beredskap: boolean;
    nattevaak: boolean;
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
            arbeidAktivitet: {},
            arbeidstid: {},

            omsorg: {},
            utenlandsopphold: []
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
        jobberFortsattSomFrilaser: JaNei.NEI,
        innleggelseUtlandet: []
    };

    private initialTilsyn: PeriodeinfoV2<ITilsyn> = {
        periode: {fom: '', tom: ''},
        mandag: null,
        tirsdag: null,
        onsdag: null,
        torsdag: null,
        fredag: null,
    };

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
                soknad: new SoknadV2(this.props.punchFormState.soknad as ISoknadV2),
                isFetched: true,
            });
            this.props.setIdentAction(
                soknad.soekerId || '',
            );
        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {
        const {intl, punchFormState, punchState, signaturState} = this.props;
        const soknad = new SoknadV2(this.state.soknad);
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

        const initialPeriode: IPeriodeV2 = {fom: '', tom: ''};

        const initialPeriodeMedTimer = new PeriodeMedFaktiskeTimer({
            periode: {fom: '', tom: ''},
            faktiskArbeidTimerPerDag: ''
        });

        const initialArbeidstaker = new ArbeidstakerV2({
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

        const initialSelvstendigNaeringsdrivende: ISelvstendigNaeringsdrivendeV2 = {
            perioder: [],
        };
        const initialFrilanser: IFrilanserV2 = {
            startDato: '',
            jobberFortsattSomFrilans: false,
        };

        const initialTilsyn = new TilsynsordningV2({
            periode: initialPeriode,
            etablertTilsynTimerPerDag: '',
        });


        const initialBeredskap = new TilleggsinformasjonV2({
            periode: initialPeriode,
            tilleggsinformasjon: '',
        });

        const initialNattevaak = new TilleggsinformasjonV2({
            periode: initialPeriode,
            tilleggsinformasjon: '',
        });

        const arbeidstakerperioder = () => {
            const updateTgStrings = () =>
                this.setState({
                    faktiskeTimer: this.faktiskTimer(soknad),
                });
            const arbeid = soknad.arbeidstid;
            const errorMessageFunction = (code: string) =>
                () => undefined;

            if (!arbeid.arbeidstakerList.length) {
                arbeid.arbeidstakerList.push(initialArbeidstaker)
            }
            return (<Listepaneler
                intl={intl}
                items={arbeid.arbeidstakerList}
                component={pfArbeidstaker(
                    this.state.faktiskeTimer,
                    (faktiskeTimer) => this.setState({faktiskeTimer}),
                    () => this.faktiskTimer(soknad)
                )}
                panelid={(i) => `arbeidstakerpanel_${i}`}
                initialItem={initialArbeidstaker}
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
                getErrorMessage={errorMessageFunction}
                feilkodeprefiks={'arbeid.arbeidstaker'}
                onAdd={updateTgStrings}
                onRemove={updateTgStrings}
                kanHaFlere={true}
            />)
        };

        const frilanserperioder = (harOverskrift?: boolean) => {
            const arbeid = soknad.arbeidstid;
            const errorMessageFunction = (code: string) =>
                () => undefined;

            if (!arbeid.frilanserArbeidstidInfo.perioder.length) {
                arbeid.frilanserArbeidstidInfo.perioder.push(initialPeriodeMedTimer)
            }

            return (
                <>
                    <Input
                        id="frilanser-startdato"
                        bredde={"M"}
                        label={intlHelper(intl, 'skjema.frilanserdato')}
                        type="date"
                        value={this.state.frilanserStartdato}
                        className={"frilanser-startdato"}
                        onChange={(e) => {
                            this.setState({frilanserStartdato: e.target.value})
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
                        checked={this.state.jobberFortsattSomFrilaser || undefined}
                        onChange={(event) =>
                            this.setState({jobberFortsattSomFrilaser: (event.target as HTMLInputElement).value as JaNei})
                        }/>
                    {this.state.jobberFortsattSomFrilaser === JaNei.JA &&
                    (<>
                        <p className={"frilanser-info"}>{intlHelper(intl, 'skjema.frilanser.periode')}</p>
                        <ArbeidstidinfoPaneler
                            intl={intl}
                            periods={arbeid.frilanserArbeidstidInfo.perioder}
                            panelid={(i) => `frilanserpanel_${i}`}
                            initialPeriodeinfo={initialPeriodeMedTimer}
                            editSoknad={(perioder) =>
                                this.updateSoknadInformasjon(
                                    {
                                        arbeidstid: {
                                            frilanserArbeidstidInfo: {
                                                ...arbeid.frilanserArbeidstidInfo,
                                                perioder
                                            }
                                        }
                                    },
                                )
                            }
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState(
                                    {
                                        arbeidstid: {
                                            frilanserArbeidstidInfo: {
                                                ...arbeid.frilanserArbeidstidInfo,
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
                                    : 'skjema.arbeid.frilanser.leggtilperiode'
                            }
                            textFjern="skjema.arbeid.frilanser.fjernperiode"
                            panelClassName="frilanserpanel"
                            getErrorMessage={errorMessageFunction}
                            feilkodeprefiks={'arbeid.frilanser'}
                            kanHaFlere={false}
                        /></>)}</>);
        };

        const arbeidsperioder = () => {
            const updateTgStrings = () =>
                this.setState({
                    faktiskeTimer: this.faktiskTimer(soknad),
                });
            const arbeid = soknad.arbeidstid;
            const errorMessageFunction = (code: string) =>
                () => undefined;

            const selvstendigperioder = (harOverskrift?: boolean) => (
                <PeriodeinfoPaneler
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
                    getErrorMessage={errorMessageFunction}
                    feilkodeprefiks={'arbeid.selvstendigNaeringsdrivende'}
                    kanHaFlere={true}
                />
            );

            const antallArbeidsperioder = soknad.arbeidAktivitet.numberOfWorkPeriods();

            const visning = () => {
                if (this.state.arbeidstaker) {
                    return arbeidstakerperioder()
                }
                if (!antallArbeidsperioder) {
                    return (
                        <Container className="arbeidsknapper">
                            <Row>
                                <Col>{arbeidstakerperioder()}</Col>
                                <Col>{selvstendigperioder()}</Col>
                            </Row>
                        </Container>
                    );
                } else if (arbeid.arbeidstakerList.length === antallArbeidsperioder) {
                    return (
                        <>
                            <h3>
                                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}
                            </h3>
                            {arbeidstakerperioder()}
                            <h3>
                                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
                            </h3>
                            <Container className="arbeidsknapper">
                                <Row>
                                    <Col>{selvstendigperioder()}</Col>
                                </Row>
                            </Container>
                        </>
                    );
                } else if (
                    arbeid.selvstendigNæringsdrivendeArbeidstidInfo.perioder.length === antallArbeidsperioder
                ) {
                    return (
                        <>
                            <h3>
                                {intlHelper(
                                    intl,
                                    'skjema.arbeid.selvstendignaeringsdrivende.overskrift'
                                )}
                            </h3>
                            {selvstendigperioder(true)}
                            <h3>
                                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
                            </h3>
                            <Container className="arbeidsknapper">
                                <Row>
                                    <Col>{arbeidstakerperioder()}</Col>
                                </Row>
                            </Container>
                        </>
                    );
                } else if (arbeid.frilanserArbeidstidInfo) {
                    return (
                        <>
                            <h3>
                                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
                            </h3>
                            <Container className="arbeidsknapper">
                                <Row>
                                    <Col>{arbeidstakerperioder()}</Col>
                                    <Col>{selvstendigperioder()}</Col>
                                </Row>
                            </Container>
                        </>
                    );
                } else {
                    return (
                        <>
                            <h3>
                                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}
                            </h3>
                            {arbeidstakerperioder()}
                            <h3>
                                {intlHelper(
                                    intl,
                                    'skjema.arbeid.selvstendignaeringsdrivende.overskrift'
                                )}
                            </h3>
                            {selvstendigperioder(true)}
                            <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
                        </>
                    );
                }
            };

            return visning();
        };

        const beredskapperioder = (
            <PeriodeinfoPaneler
                intl={intl}
                periods={soknad.beredskap}
                component={pfTilleggsinformasjon('beredskap')}
                panelid={(i) => `beredskapspanel_${i}`}
                initialPeriodeinfo={initialBeredskap}
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
        );


        return (
            <>
                {this.statusetikett()}
                {this.backButton()}
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
                        this.setState({expandAll: e.target.checked})
                    }}
                />
                <VerticalSpacer sixteenPx={true}/>
                <EkspanderbartpanelBase
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningeromsoknad")}
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

                            />
                            <Input
                                id={"grad"}
                                className={"right"}
                                bredde={"XS"}
                                label={intlHelper(intl, 'skjema.grad')}
                                value={""}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    // mottattDato: event.target.value,
                                }))}
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
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.utenlandsopphold.opplysninger")}>
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
                        <Panel className={"utenlandsoppholdpanel"}>
                            {Object.keys(soknad.utenlandsopphold).map((key) => (
                                <>
                                    <PeriodInput
                                        periode={_.get(soknad.utenlandsopphold[key], 'periode', '')}
                                        intl={intl}
                                        onChange={(periode) => this.handleOppholdPeriodeChange(+key, periode)}
                                        onBlur={() => this.setOpphold()}
                                    />
                                    <CountrySelect
                                        className={"countryselect"}
                                        bredde={"l"}
                                        name={`opphold_land_${key}`}
                                        onChange={event => this.handleOppholdLandChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        selectedcountry={_.get(soknad.utenlandsopphold[key], 'land', '')}
                                        unselectedoption={'Velg …'}
                                        label={intlHelper(intl, 'skjema.utenlandsopphold.land')}
                                    />
                                </>
                            ))}
                        </Panel>
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
                            initialPeriodeinfo={initialPeriode}
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
                            initialPeriodeinfo={initialPeriode}
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
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningeromsoker")}/>
                <EkspanderbartpanelBase
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningerombarnet")}>
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningeromarbeid")}>
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
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.omsorgstilbud.overskrift")}>
                    <h4>
                        {intlHelper(intl, "skjema.omsorgstilbud.info")}
                    </h4>
                    <OppholdInput
                        intl={intl}
                        periodeMedTimerMinutter={soknad.omsorg.periode}
                        onChange={(periode) => this.updateSoknad({
                            omsorg: {periode}
                        })}
                        onBlur={(periode) => this.updateSoknadState({
                            omsorg: {periode}
                        })}
                    />
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.state.expandAll}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.beredskapognattevaak.overskrift")}>
                    <CheckboksPanelGruppe
                        checkboxes={Object.values(BeredskapNattevaak).map((bn) => ({
                            label: intlHelper(intl, bn),
                            value: bn,
                            onChange: (e) => this.handleBeredskapNattevaakChange(bn, e.target.checked),
                            checked: this.getCheckedValueBeredskapNattevaak(bn)
                        }))}
                        onChange={() => undefined}/>
                    {this.state.beredskap && (

                    )}
                </EkspanderbartpanelBase>
            </>);
    }

    private handleArbeidsforholdChange = (af: Arbeidsforhold, checked: boolean) => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                this.setState({arbeidstaker: checked})
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
                break;
            case BeredskapNattevaak.NATTEVAAK:
                this.setState({nattevaak: checked})
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


    private faktiskTimer = (soknad: SoknadV2) => {
        // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
        return soknad ? soknad.arbeidstid.faktiskeTimer() : [];
    };

    private updateTilsynsordning(jaNeiVetikke: JaNeiVetikke) {
        this.setState({
            iTilsynsordning: jaNeiVetikke,
        });

        if (
            jaNeiVetikke === JaNeiVetikke.JA &&
            this.state.soknad.tilsynsordning!.length === 0
        ) {
            this.state.soknad.tilsynsordning!.push(this.initialTilsyn);
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
        return new SoknadV2(this.props.punchFormState.soknad as ISoknadV2)
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
            Partial<ISoknadV2>,
        showStatus ?: boolean
    ) {
        this.setState({
            soknad: {...this.state.soknad, ...soknad},
            showStatus: !!showStatus,
        });
    }

    private updateSoknadInformasjon = (
        soknad: Partial<ISoknadV2>
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
        change: (event: any) => Partial<ISoknadV2>
    ) => ({
        onChange: (event: any) =>
            this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknadInformasjon(change(event)),
    });

    private onChangeOnlyUpdate = (
        change: (event: any) => Partial<ISoknadV2>
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

    private updateSoknad = (soknad: Partial<ISoknadV2>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            {...this.getSoknadFromStore(), ...soknad},
        );
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
        soknad: Partial<ISoknadV2>
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
