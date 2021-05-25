import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {Arbeidsforhold, JaNei, JaNeiVetikke, PunchStep} from 'app/models/enums';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {IInputError, IPunchFormState, ISignaturState, SelvstendigNaerinsdrivende} from 'app/models/types';
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
    updateSoknad, validerSoknad,
} from 'app/state/actions';
import {setHash} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeInfo} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import {
    CheckboksPanel,
    CheckboksPanelGruppe,
    Checkbox,
    Input,
    RadioPanelGruppe,
    Select,
    SkjemaGruppe
} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {
    ArbeidstidInfo,
    IPSBSoknad,
    IUtenlandsOpphold,
    PSBSoknad,
    SelvstendigNaeringsdrivendeOpptjening,
    TilleggsinformasjonV2,
} from "../../models/types/PSBSoknad";
import {ArbeidstidPeriodeMedTimer, IPeriodeV2, PeriodeMedTimerMinutter} from "../../models/types/PeriodeV2";
import {EkspanderbartpanelBase} from "nav-frontend-ekspanderbartpanel";
import {JaNeiIkkeOpplyst} from "../../models/enums/JaNeiIkkeOpplyst";
import VerticalSpacer from "../../components/VerticalSpacer";
import {Periodepaneler} from "./Periodepaneler";
import Panel from "nav-frontend-paneler";
import {BeredskapNattevaak} from "../../models/enums/BeredskapNattevaak";
import {PeriodeinfoPaneler} from "./PeriodeinfoPaneler";
import {RootStateType} from "../../state/RootState";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {connect} from "react-redux";
import {PunchFormPaneler} from "../../models/enums/PunchFormPaneler";
import {pfLand} from "./pfLand";
import {pfTimerMinutter} from "./pfTimerMinutter";
import {IPSBSoknadUt, PSBSoknadUt} from "../../models/types/PSBSoknadUt";
import CalendarSvg from "../../assets/SVG/CalendarSVG";
import BinSvg from "../../assets/SVG/BinSVG";
import AddCircleSvg from "../../assets/SVG/AddCircleSVG";
import {generateDateString} from "../../components/skjema/skjemaUtils";
import {RelasjonTilBarnet} from "../../models/enums/RelasjonTilBarnet";
import {IIdentState} from "../../models/types/IdentState";
import ModalWrapper from "nav-frontend-modal";
import SettPaaVentModal from "./SettPaaVentModal";
import {IJournalposterPerIdentState} from "../../models/types/JournalposterPerIdentState";
import {pfTilleggsinformasjon} from "./pfTilleggsinformasjon";
import {Container, Row} from "react-bootstrap";
import {pfArbeidstider} from "./pfArbeidstider";
import {arbeidstidInformasjon} from "./ArbeidstidInfo";
import {CountrySelect} from "../../components/country-select/CountrySelect";
import {Virksomhetstyper} from "../../models/enums/Virksomhetstyper";
import SettPaaVentErrorModal from "./SettPaaVentErrorModal";
import Hjelpetekst from "nav-frontend-hjelpetekst";
import {PopoverOrientering} from "nav-frontend-popover";
import {JaNeiIkkeRelevant} from "../../models/enums/JaNeiIkkeRelevant";
import OkGaaTilLosModal from "./OkGaaTilLosModal";
import {FrilanserOpptjening} from "../../models/types/FrilanserOpptjening";
import ErDuSikkerModal from "./ErDuSikkerModal";

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
}

export interface IPunchFormComponentState {
    soknad: IPSBSoknad;
    perioder?: IPeriodeV2;
    isFetched: boolean;
    showStatus: boolean;
    faktiskeTimer: string[][];
    iTilsynsordning: JaNeiVetikke | undefined;
    iUtlandet: JaNeiIkkeOpplyst | undefined;
    skalHaFerie: JaNeiIkkeOpplyst | undefined;
    arbeidstaker: boolean,
    frilanser: boolean,
    selvstendigNæringsdrivende: boolean;
    expandAll: boolean;
    frilanserStartdato: string;
    jobberFortsattSomFrilanser: JaNei | undefined;
    barnetSkalLeggesInn: JaNei | undefined;
    innleggelseUtlandet: IPeriodeV2[];
    harBoddIUtlandet: JaNeiIkkeOpplyst | undefined;
    skalBoIUtlandet: JaNeiIkkeOpplyst | undefined;
    medlemskap: IUtenlandsOpphold[];
    aapnePaneler: PunchFormPaneler[]
    showSettPaaVentModal: boolean;
    showErDuSikkerModal: boolean;
    errors: IInputError[];
    harRegnskapsfører: boolean;

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
            barn:
                {
                    norskIdent: '',
                    foedselsdato: '',
                },
            opptjeningAktivitet: {},
            arbeidstid: {},

            tilsynsordning: {},
            utenlandsopphold: [],
            omsorg: {},
        },
        perioder: undefined,
        isFetched: false,
        showStatus: false,
        faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
        iTilsynsordning: JaNeiVetikke.NEI,
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
        showErDuSikkerModal: false,
        errors: [],
        harRegnskapsfører: false,
    };

    private initialPeriode: IPeriodeV2 = {fom: '', tom: ''};

    private initialPeriodeTimerMinutter = new PeriodeMedTimerMinutter({
        timer: 0,
        minutter: 0
    });

    private initialPeriodeMedTimer = new ArbeidstidPeriodeMedTimer({
        periode: {fom: '', tom: ''},
        faktiskArbeidTimerPerDag: ''
    });

    private initialTillegsinfo = new TilleggsinformasjonV2({
        periode: this.initialPeriode,
        tilleggsinformasjon: '',
    });

    private initialArbeidstaker = new ArbeidstakerV2({
        arbeidstidInfo: {
            perioder: [{
                periode: {
                    fom: '',
                    tom: '',
                },
                faktiskArbeidTimerPerDag: '',
                jobberNormaltTimerPerDag: '',
            }],

        },
        organisasjonsnummer: '',
        norskIdent: null,
    });

    private initialArbeidstidInfo = new ArbeidstidInfo({
        perioder: [{
            periode: {
                fom: '',
                tom: '',
            },
            faktiskArbeidTimerPerDag: '',
            jobberNormaltTimerPerDag: '',
        }]
    });

    private initialFrilanser = new FrilanserOpptjening(
        {
            jobberFortsattSomFrilans: undefined,
            startDato: undefined
        }
    )

    private initialSelvstedigNæringsdrivende = new SelvstendigNaerinsdrivende({
        periode: this.initialPeriode,
        virksomhetstyper: [],
        registrertIUtlandet: false,
        landkode: '',
    });

    private initialSelvstendigNæringsdrivendeOpptjening = new SelvstendigNaeringsdrivendeOpptjening({
        virksomhetNavn: '',
        organisasjonsnummer: '',
        info: this.initialSelvstedigNæringsdrivende
    });


    componentDidMount(): void {
        const {id} = this.props;
        this.props.getSoknad(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
        this.setState(this.state);
        const {ident1, ident2} = this.props.identState;
        if (ident1 && ident2) {
            this.props.hentPerioder(ident1, ident2)
        }
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
            });

        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {
        const {intl, punchFormState, signaturState, identState} = this.props;

        const soknad = new PSBSoknad(this.state.soknad);
        const {signert} = signaturState;
        const eksisterendePerioder = punchFormState.perioder;


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

        const initialUtenlandsopphold: IUtenlandsOpphold = {land: ''};


        const arbeidstakerperioder = () => {
            const arbeid = soknad.arbeidstid;

            return (<Listepaneler
                intl={intl}
                items={arbeid.arbeidstakerList}
                component={pfArbeidstaker()}
                panelid={(i) => `arbeidstakerpanel_${i}`}
                initialItem={this.initialArbeidstaker}
                editSoknad={(arbeidstakerList) =>
                    this.updateSoknad(
                        {
                            arbeidstid: {
                                ...arbeid,
                                arbeidstakerList
                            }
                        }
                    )
                }
                editSoknadState={(arbeidstakerList, showStatus) =>
                    this.updateSoknadState(
                        {
                            arbeidstid: {
                                ...arbeid,
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
                kanHaFlere={true}
            />)
        };

        const frilanserperioder = () => {
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
                            this.updateSoknadState({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    frilanser: {
                                        ...soknad.opptjeningAktivitet.frilanser,
                                        startDato: e.target.value
                                    }
                                }
                            })
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
                            this.handleFrilanserChange((event.target as HTMLInputElement).value as JaNei)
                        }}/>
                    <VerticalSpacer eightPx={true}/>
                    {this.state.soknad.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans &&
                    (<>
                        {arbeidstidInformasjon(intl)}
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={arbeid.frilanserArbeidstidInfo?.perioder || []}
                            panelid={(i) => `frilanserpanel_${i}`}
                            initialPeriodeinfo={this.initialPeriodeMedTimer}
                            editSoknad={(perioder) => this.updateSoknad(
                                {arbeidstid: {...arbeid, frilanserArbeidstidInfo: {perioder}}})}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({
                                    arbeidstid: {
                                        ...arbeid,
                                        frilanserArbeidstidInfo: {perioder}
                                    }
                                }, showStatus)
                            }
                            component={pfArbeidstider()}
                            minstEn={true}
                            textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                            kanHaFlere={true}
                        />
                    </>)}</>);
        };

        const selvstendigperioder = () => {
            const opptjening = soknad.opptjeningAktivitet;
            const arbeid = soknad.arbeidstid;
            return (<>
                    <Container className="infoContainer">
                        <CheckboksPanelGruppe
                            className={"virksomhetstypercheckbox"}
                            legend={intlHelper(intl, 'skjema.arbeid.sn.type')}
                            checkboxes={Object.values(Virksomhetstyper).map((v) => ({
                                label: v,
                                value: v,
                                onChange: (e) => this.updateVirksomhetstyper(v, e.target.checked),
                                checked: opptjening.selvstendigNaeringsdrivende?.info?.virksomhetstyper.some(vt => vt === v)
                            }))}
                            onChange={() => undefined}/>
                        <div className={"generelleopplysiniger"}>
                            <Row noGutters={true}>
                                <Input label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                                       bredde={"M"}
                                       value={opptjening.selvstendigNaeringsdrivende?.virksomhetNavn || ''}
                                       className="virksomhetsNavn"
                                       onChange={event => this.updateSoknad({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   virksomhetNavn: event.target.value
                                               }
                                           }
                                       })}
                                       onBlur={event => this.updateSoknadState({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   virksomhetNavn: event.target.value
                                               }
                                           }
                                       })}/>

                            </Row>
                            <Row noGutters={true}>
                                <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                       bredde={"M"}
                                       value={opptjening.selvstendigNaeringsdrivende?.organisasjonsnummer || ''}
                                       className="sn-organisasjonsnummer"
                                       onChange={event => this.updateSoknad({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   organisasjonsnummer: event.target.value
                                               }
                                           }
                                       })}
                                       onBlur={event => this.updateSoknadState({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   organisasjonsnummer: event.target.value
                                               }
                                           }
                                       })}/>
                            </Row>
                        </div>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            name={"virksomhetRegistrertINorge"}
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                            checked={!opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet ? JaNei.JA : JaNei.NEI}
                            onChange={event => {
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                registrertIUtlandet:
                                                    ((event.target as HTMLInputElement).value as JaNei) === JaNei.NEI ? true : false
                                            }
                                        }
                                    }
                                });
                            }}/>
                        {!!opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet &&
                        <CountrySelect
                            value={opptjening.selvstendigNaeringsdrivende.info.landkode}
                            label={intlHelper(intl, 'skjema.sn.registrertLand')}
                            onChange={event => {
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                landkode:
                                                event.target.value
                                            }
                                        }
                                    }
                                });
                            }}
                        />
                        }
                        <Input
                            label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                            bredde={"M"}
                            value={opptjening.selvstendigNaeringsdrivende?.info?.bruttoInntekt}
                            onChange={event => this.updateSoknad({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            bruttoInntekt: event.target.value
                                        }
                                    }
                                }
                            })}
                            onBlur={event => this.updateSoknadState({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            bruttoInntekt: event.target.value
                                        }
                                    }
                                }
                            })}
                            onFocus={event => event.target.selectionStart = 0}
                        />
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            name={"harRegnskapsfører"}
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                            checked={!!this.state.harRegnskapsfører ? JaNei.JA : JaNei.NEI}
                            onChange={event => {
                                this.handleRegnskapsførerChange((event.target as HTMLInputElement).value as JaNei)
                            }}/>
                        <h3>{intlHelper(intl, 'skjema.arbeid.sn.når')}</h3>
                        <div className={"sn-startdatocontainer"}>
                            <Input
                                bredde={"M"}
                                label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                                type="date"
                                className="fom"
                                value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom || ''}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                periode: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                    fom: event.target.value
                                                }
                                            }
                                        }
                                    },
                                }))}

                            />
                            <Input
                                bredde={"M"}
                                label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                                type="date"
                                className="tom"
                                value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.tom || ''}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                periode: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                    tom: event.target.value
                                                }
                                            }
                                        }
                                    },
                                }))}
                            />
                        </div>
                        {this.state.harRegnskapsfører &&
                        <div className={"generelleopplysiniger"}>
                            <Row noGutters={true}>
                                <Input label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn')}
                                       bredde={"M"}
                                       value={opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn || ''}
                                       className="regnskapsførerNavn"
                                       onChange={event => this.updateSoknad({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   info: {
                                                       ...opptjening.selvstendigNaeringsdrivende?.info,
                                                       regnskapsførerNavn: event.target.value
                                                   }
                                               }
                                           }
                                       })}
                                       onBlur={event => this.updateSoknadState({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   info: {
                                                       ...opptjening.selvstendigNaeringsdrivende?.info,
                                                       regnskapsførerNavn: event.target.value
                                                   }
                                               }
                                           }
                                       })}/>

                            </Row>
                            <Row noGutters={true}>
                                <Input label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                       bredde={"M"}
                                       value={opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerTlf || ''}
                                       className="sn-regskasførertlf"
                                       onChange={event => this.updateSoknad({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   info: {
                                                       ...opptjening.selvstendigNaeringsdrivende?.info,
                                                       regnskapsførerTlf: event.target.value
                                                   }
                                               }
                                           }
                                       })}
                                       onBlur={event => this.updateSoknadState({
                                           opptjeningAktivitet: {
                                               ...opptjening,
                                               selvstendigNaeringsdrivende: {
                                                   ...opptjening.selvstendigNaeringsdrivende,
                                                   info: {
                                                       ...opptjening.selvstendigNaeringsdrivende?.info,
                                                       regnskapsførerTlf: event.target.value
                                                   }
                                               }
                                           }
                                       })}/>
                            </Row>
                        </div>}

                        <VerticalSpacer eightPx={true}/>
                        {arbeidstidInformasjon(intl)}
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={arbeid.selvstendigNæringsdrivendeArbeidstidInfo?.perioder || [this.initialPeriodeMedTimer]}
                            panelid={(i) => `snpanel_${i}`}
                            initialPeriodeinfo={this.initialPeriodeMedTimer}
                            editSoknad={(perioder) => this.updateSoknad(
                                {arbeidstid: {...arbeid, selvstendigNæringsdrivendeArbeidstidInfo: {perioder}}})}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({
                                    arbeidstid: {
                                        ...arbeid,
                                        selvstendigNæringsdrivendeArbeidstidInfo: {perioder}
                                    }
                                }, showStatus)
                            }
                            component={pfArbeidstider()}
                            minstEn={true}
                            textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                            kanHaFlere={true}
                        />
                    </Container>
                </>
            )
        };

        const beredskapperioder = () => {
            return (<PeriodeinfoPaneler
                    intl={intl}
                    periods={soknad.beredskap}
                    panelid={(i) => `beredskapspanel_${i}`}
                    initialPeriodeinfo={this.initialTillegsinfo}
                    component={pfTilleggsinformasjon("beredskap")}
                    editSoknad={(beredskap) => this.updateSoknad({beredskap})}
                    editSoknadState={(beredskap, showStatus) =>
                        this.updateSoknadState({beredskap}, showStatus)
                    }
                    textLeggTil="skjema.beredskap.leggtilperiode"
                    textFjern="skjema.beredskap.fjernperiode"
                    className="beredskapsperioder"
                    panelClassName="beredskapspanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'beredskap'}
                    kanHaFlere={true}
                />
            )
        };

        const nattevaakperioder = () => {
            return (<PeriodeinfoPaneler
                    intl={intl}
                    periods={soknad.nattevaak}
                    panelid={(i) => `nattevaakspanel_${i}`}
                    initialPeriodeinfo={this.initialTillegsinfo}
                    component={pfTilleggsinformasjon("nattevaak")}
                    editSoknad={(nattevaak) => this.updateSoknad
                    ({nattevaak})}
                    editSoknadState={(nattevaak, showStatus) =>
                        this.updateSoknadState({nattevaak}, showStatus)
                    }
                    textLeggTil="skjema.nattevaak.leggtilperiode"
                    textFjern="skjema.nattevaak.fjernperiode"
                    className="nattevaaksperioder"
                    panelClassName="nattevaakspanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'nattevåk'}
                    kanHaFlere={true}
                />
            )
        };

        return (
            <>
                {this.statusetikett()}
                <AlertStripeInfo>{intlHelper(intl, 'skjema.generellinfo')}</AlertStripeInfo>
                <VerticalSpacer sixteenPx={true}/>
                <Panel className={"eksiterendesoknaderpanel"}>
                    <h3>{intlHelper(intl, 'skjema.eksisterende')}</h3>
                    {eksisterendePerioder?.length === 0 && !punchFormState.hentPerioderError &&
                    <p>{intlHelper(intl, 'skjema.eksisterende.ingen')}</p>}
                    {punchFormState.hentPerioderError && <p>{intlHelper(intl, 'skjema.eksisterende.feil')}</p>}
                    {!punchFormState.hentPerioderError && !!eksisterendePerioder?.length && <>
                        {eksisterendePerioder.map((p, i) => <div key={i} className={"datocontainer"}><CalendarSvg
                            title={"calendar"}/>
                            <div className={"periode"}>{generateDateString(p)}</div>
                        </div>)}
                    </>}
                    {!!soknad.soeknadsperiode &&
                    <div className={"soknadsperiodecontainer"}>
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
                            feil={this.getErrorMessage('søknadsperiode/endringsperiode')}

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

                        />
                        <div
                            id="fjern"
                            className={"fjern"}
                            role="button"
                            onClick={() => {
                                this.updateSoknadState({soeknadsperiode: undefined});
                            }}
                            tabIndex={0}>
                            <BinSvg title={"fjern"}/></div>
                    </div>}
                    {!soknad.soeknadsperiode && <div className={"knappecontainer"}>
                        <div
                            id="leggtil"
                            className={"leggtil"}
                            role="button"
                            onClick={() => this.updateSoknadState({soeknadsperiode: this.initialPeriode})}
                            tabIndex={0}
                        >
                            <div className={"leggtilcircle"}><AddCircleSvg title={"leggtilcircle"}/></div>
                            {intlHelper(intl, 'skjema.soknadsperiode.leggtil')}
                        </div>
                    </div>}
                </Panel>
                <VerticalSpacer sixteenPx={true}/>
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
                                feil={this.getErrorMessage('mottattDato')}
                            /></div>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            name="signatur"
                            legend={intlHelper(intl, 'ident.signatur.etikett')}
                            checked={signert || undefined}
                            onChange={(event) =>
                                this.props.setSignaturAction(
                                    ((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || null
                                )
                            }
                        />
                    </SkjemaGruppe>
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
                        checked={this.state.soknad.utenlandsopphold?.length ? JaNeiIkkeOpplyst.JA : this.state.iUtlandet}
                    />
                    {!!soknad.utenlandsopphold.length && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.utenlandsopphold}
                            component={pfLand()}
                            panelid={(i) => `utenlandsoppholdpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(perioder) => this.updateSoknad
                            ({utenlandsopphold: perioder})}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({utenlandsopphold: perioder}, showStatus)
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
                    {this.state.iUtlandet === JaNeiIkkeOpplyst.JA &&
                    (<RadioPanelGruppe
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
                    />)}
                    {this.state.barnetSkalLeggesInn === JaNei.JA && (
                        <Periodepaneler
                            intl={intl}
                            periods={this.state.innleggelseUtlandet}
                            panelid={(i) => `innleggelseperiodepanel_${i}`}
                            initialPeriode={this.initialPeriode}
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
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.FERIE)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.FERIE)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.FERIE)}>
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
                        checked={this.state.soknad.lovbestemtFerie?.length ? JaNeiIkkeOpplyst.JA : this.state.skalHaFerie}
                    />
                    {!!soknad.lovbestemtFerie.length && (
                        <Periodepaneler
                            intl={intl}
                            periods={soknad.lovbestemtFerie}
                            panelid={(i) => `ferieperiodepanel_${i}`}
                            initialPeriode={this.initialPeriode}
                            editSoknad={(perioder) =>
                                this.updateSoknad
                                (
                                    {lovbestemtFerie: perioder})
                            }
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState(
                                    {lovbestemtFerie: perioder},
                                    showStatus
                                )
                            }
                            getErrorMessage={this.getErrorMessage}
                            feilkodeprefiks={'lovbestemtFerie'}
                            minstEn={false}
                            kanHaFlere={true}
                        />)}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}>
                    <Select value={soknad.omsorg.relasjonTilBarnet}
                            label={intlHelper(intl, 'skjema.relasjontilbarnet')}
                            {...this.changeAndBlurUpdatesSoknad((event) => ({
                                omsorg: {...soknad.omsorg, relasjonTilBarnet: event.target.value}
                            }))}>
                        {Object.values(RelasjonTilBarnet).map(rel =>
                            <option key={rel} value={rel}>{rel}</option>)}
                    </Select>
                    {soknad.omsorg.relasjonTilBarnet === RelasjonTilBarnet.ANNET &&
                    <Input
                        bredde={"M"}
                        label={intlHelper(intl, 'skjema.omsorg.beskrivelse')}
                        className="beskrivelseAvOmsorgsrollen"
                        value={soknad.omsorg.beskrivelseAvOmsorgsrollen}
                        {...this.changeAndBlurUpdatesSoknad((event) => ({
                            omsorg: {...soknad.omsorg, beskrivelseAvOmsorgsrollen: event.target.value},
                        }))}
                    />}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.ARBEID)}
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, PunchFormPaneler.ARBEID)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.ARBEID)}>
                    <CheckboksPanel
                        label={intlHelper(intl, Arbeidsforhold.ARBEIDSTAKER)}
                        value={Arbeidsforhold.ARBEIDSTAKER}
                        onChange={(e) => this.handleArbeidsforholdChange(Arbeidsforhold.ARBEIDSTAKER, e.target.checked)}
                        checked={this.getCheckedValueArbeid(Arbeidsforhold.ARBEIDSTAKER)}
                    />
                    <VerticalSpacer eightPx={true}/>
                    {!!soknad.arbeidstid.arbeidstakerList.length && (
                        <>{arbeidstakerperioder()}</>
                    )}
                    <CheckboksPanel
                        label={intlHelper(intl, Arbeidsforhold.FRILANSER)}
                        value={Arbeidsforhold.FRILANSER}
                        onChange={(e) => this.handleArbeidsforholdChange(Arbeidsforhold.FRILANSER, e.target.checked)}
                        checked={this.getCheckedValueArbeid(Arbeidsforhold.FRILANSER)}
                    />
                    <VerticalSpacer eightPx={true}/>
                    {!!this.state.frilanser && (
                        <Panel className={"frilanserpanel"}>
                            {frilanserperioder()}
                        </Panel>
                    )}
                    <CheckboksPanel
                        label={intlHelper(intl, Arbeidsforhold.SELVSTENDIG)}
                        value={Arbeidsforhold.SELVSTENDIG}
                        onChange={(e) => this.handleArbeidsforholdChange(Arbeidsforhold.SELVSTENDIG, e.target.checked)}
                        checked={this.getCheckedValueArbeid(Arbeidsforhold.SELVSTENDIG)}
                    />
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
                        periods={soknad.tilsynsordning.perioder.length ? soknad.tilsynsordning.perioder : [this.initialPeriodeTimerMinutter]}
                        component={pfTimerMinutter()}
                        panelid={(i) => `tilsynsordningpanel_${i}`}
                        initialPeriodeinfo={this.initialPeriodeTimerMinutter}
                        editSoknad={(perioder) => this.updateSoknad({
                            tilsynsordning: {
                                ...this.state.soknad.tilsynsordning,
                                perioder
                            }
                        })}
                        editSoknadState={(perioder, showStatus) =>
                            this.updateSoknadState({
                                tilsynsordning: {
                                    ...this.state.soknad.tilsynsordning,
                                    perioder
                                }
                            }, showStatus)
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
                    <CheckboksPanel
                        label={intlHelper(intl, BeredskapNattevaak.BEREDSKAP)}
                        value={BeredskapNattevaak.BEREDSKAP}
                        onChange={(e) => this.handleBeredskapNattevaakChange(BeredskapNattevaak.BEREDSKAP, e.target.checked)}
                        checked={!!soknad.beredskap.length}
                    />
                    {!!soknad.beredskap.length && (
                        <>{beredskapperioder()}</>

                    )}
                    <VerticalSpacer eightPx={true}/>
                    <CheckboksPanel
                        label={intlHelper(intl, BeredskapNattevaak.NATTEVAAK)}
                        value={BeredskapNattevaak.NATTEVAAK}
                        onChange={(e) => this.handleBeredskapNattevaakChange(BeredskapNattevaak.NATTEVAAK, e.target.checked)}
                        checked={!!soknad.nattevaak.length}
                    />
                    {!!soknad.nattevaak.length && (
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
                        radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        name="medlemskapjanei"
                        legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                        onChange={(event) =>
                            this.handleMedlemskapChange((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                        }
                        checked={this.state.harBoddIUtlandet}
                    />
                    {this.state.harBoddIUtlandet === JaNeiIkkeOpplyst.JA && (
                        <PeriodeinfoPaneler
                            intl={intl}
                            periods={soknad.bosteder}
                            component={pfLand()}
                            panelid={(i) => `bostederpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(bosteder) => this.updateSoknad
                            ({bosteder})}
                            editSoknadState={(bosteder, showStatus) =>
                                this.updateSoknadState({bosteder}, showStatus)
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
                <VerticalSpacer thirtyTwoPx={true}/>
                <p className={"ikkeregistrert"}>{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
                <div className={"flex-container"}>
                    <CheckboksPanel
                        label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                        checked={this.state.soknad.harInfoSomIkkeKanPunsjes}
                        onChange={(event) => this.updateSoknadState({harInfoSomIkkeKanPunsjes: event.target.checked})}
                    /><Hjelpetekst
                    className={"hjelpetext"}
                    type={PopoverOrientering.OverHoyre}
                >{intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}</Hjelpetekst></div>
                <VerticalSpacer eightPx={true}/>
                <div className={"flex-container"}>
                    <CheckboksPanel
                        label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                        checked={this.state.soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateSoknadState({harMedisinskeOpplysninger: event.target.checked})}
                    />
                    <Hjelpetekst
                        className={"hjelpetext"}
                        type={PopoverOrientering.OverHoyre}
                    >{intlHelper(intl, 'skjema.medisinskeopplysninger.hjelpetekst')}</Hjelpetekst>
                </div>
                <VerticalSpacer twentyPx={true}/>

                <div className={"submit-knapper"}>
                    <p className="sendknapp-wrapper">
                        <Knapp
                            onClick={() => this.handleSubmit()}
                        >
                            {intlHelper(intl, punchFormState.isComplete ? 'skjema.knapp.send' : 'skjema.knapp.valider')}
                        </Knapp>

                        <Knapp
                            className={"vent"}
                            onClick={() => this.setState({showSettPaaVentModal: true})}
                            disabled={false}
                        >
                            {intlHelper(intl, 'skjema.knapp.settpaavent')}
                        </Knapp>
                    </p>
                </div>
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
                {this.state.showSettPaaVentModal && (
                    <ModalWrapper
                        key={"settpaaventmodal"}
                        onRequestClose={() => this.setState({showSettPaaVentModal: false})}
                        contentLabel={"settpaaventmodal"}
                        isOpen={this.state.showSettPaaVentModal}
                        closeButton={false}
                    >
                        <div className="">
                            <SettPaaVentModal
                                journalposter={this.props.journalposterState.journalposter.filter(jp => jp.journalpostId !== this.props.journalpostid)}
                                soknadId={soknad.soeknadId}
                                submit={() => this.handleSettPaaVent()}
                                avbryt={() => this.setState({showSettPaaVentModal: false})}
                            />
                        </div>
                    </ModalWrapper>
                )}
                {punchFormState.settPaaVentSuccess && (
                    <ModalWrapper
                        key={"settpaaventokmodal"}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={"settpaaventokmodal"}
                        closeButton={false}
                        isOpen={punchFormState.settPaaVentSuccess}
                    >
                        <OkGaaTilLosModal melding={'modal.settpaavent.til'}/>
                    </ModalWrapper>
                )}
                {!!punchFormState.settPaaVentError && (
                    <ModalWrapper
                        key={"settpaaventerrormodal"}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={"settpaaventokmodal"}
                        closeButton={false}
                        isOpen={!!punchFormState.settPaaVentError}
                    >
                        <SettPaaVentErrorModal close={() => this.props.settPaaventResetAction()}/>
                    </ModalWrapper>
                )}
                {!!this.state.showErDuSikkerModal && (
                    <ModalWrapper
                        key={"erdusikkermodal"}
                        onRequestClose={() => this.setState({showErDuSikkerModal: false})}
                        contentLabel={"erdusikkermodal"}
                        closeButton={false}
                        isOpen={!!this.state.showErDuSikkerModal}
                    >
                        <ErDuSikkerModal
                            melding={'modal.erdusikker.sendinn'}
                            extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                            onSubmit={() => this.props.submitSoknad(this.props.identState.ident1, this.props.id)}
                            submitKnappText={'skjema.knapp.send'}
                            onClose={() => this.setState({showErDuSikkerModal: false})}/>
                    </ModalWrapper>
                )}
            </>);
    }

    private handleSubmit = () => {
        if (this.props.punchFormState.isComplete) {
            this.setState({showErDuSikkerModal: true})
        } else {
            this.props.validateSoknad(
                this.props.identState.ident1,
                this.props.id
            )
        }
    }

    private handleSettPaaVent = () => {
        this.props.settJournalpostPaaVent(this.props.journalpostid, this.state.soknad.soeknadId!);
        this.setState({showSettPaaVentModal: false});
    }


    private handlePanelClick = (p: PunchFormPaneler) => {
        const {aapnePaneler} = this.state;
        if (aapnePaneler.some((panel) => panel === p)) {
            aapnePaneler.splice(aapnePaneler.indexOf(p), 1);
        } else {
            aapnePaneler.push(p);
        }
        this.forceUpdate();
    }

    private checkOpenState = (p: PunchFormPaneler): boolean => {
        const {aapnePaneler, expandAll} = this.state;
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
    }

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
    }

    private handleRegnskapsførerChange = (jn: JaNei) => {
        if (jn === JaNei.JA) {
            this.setState({harRegnskapsfører: true})
        } else {
            this.setState({harRegnskapsfører: false});
            this.updateSoknad({
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    selvstendigNaeringsdrivende: {
                        ...this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende,
                        info: {
                            ...this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende?.info,
                            regnskapsførerNavn: '',
                            regnskapsførerTlf: ''
                        }
                    }
                }
            });
            this.updateSoknadState({
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    selvstendigNaeringsdrivende: {
                        ...this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende,
                        info: {
                            ...this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende?.info,
                            regnskapsførerNavn: '',
                            regnskapsførerTlf: ''
                        }
                    }
                }
            });
        }

    }

    private handleArbeidsforholdChange = (af: Arbeidsforhold, checked: boolean) => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                this.setState({arbeidstaker: checked})
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.arbeidstakerList?.length) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                arbeidstakerList: [this.initialArbeidstaker]
                            }
                        })
                    }
                } else {
                    this.updateSoknadState({arbeidstid: {...this.state.soknad.arbeidstid, arbeidstakerList: []}})
                }
                break;
            case Arbeidsforhold.FRILANSER:
                this.setState({frilanser: checked})
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.frilanserArbeidstidInfo) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                frilanserArbeidstidInfo: this.initialArbeidstidInfo
                            },
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                frilanser: this.initialFrilanser
                            }
                        })
                    }
                } else {
                    this.updateSoknadState({
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            frilanserArbeidstidInfo: null
                        },
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            frilanser: null
                        }
                    })
                }
                break;
            case Arbeidsforhold.SELVSTENDIG:
                this.setState({selvstendigNæringsdrivende: checked})
                if (checked) {
                    if (!this.state.soknad.opptjeningAktivitet || !this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende) {
                        this.updateSoknadState({
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                selvstendigNaeringsdrivende: this.initialSelvstendigNæringsdrivendeOpptjening
                            }
                        })
                    }
                } else {
                    this.updateSoknadState({
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            selvstendigNaeringsdrivende: null
                        }
                    })
                }
                break;
        }
    }


    private getCheckedValueArbeid = (af: Arbeidsforhold): boolean => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                if (this.state.soknad.arbeidstid?.arbeidstakerList?.length) {
                    return true;
                } else {
                    return false
                }

            case Arbeidsforhold.FRILANSER:
                if (this.state.soknad.opptjeningAktivitet.frilanser || this.state.soknad.arbeidstid?.frilanserArbeidstidInfo) {
                    return true;
                } else {
                    return false
                }
            case Arbeidsforhold.SELVSTENDIG:
                if (this.state.soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende) {
                    return true;
                } else {
                    return false
                }
        }
    }

    private handleBeredskapNattevaakChange = (bn: BeredskapNattevaak, checked: boolean) => {
        switch (bn) {
            case BeredskapNattevaak.BEREDSKAP:
                if (checked) {
                    if (!this.state.soknad.beredskap?.length) {
                        this.updateSoknadState({beredskap: [this.initialTillegsinfo]})
                    }
                } else {
                    this.updateSoknadState({beredskap: []})
                }
                break;
            case BeredskapNattevaak.NATTEVAAK:
                if (checked) {
                    if (!this.state.soknad.nattevaak?.length) {
                        this.updateSoknadState({nattevaak: [this.initialTillegsinfo]})
                    }
                } else {
                    this.updateSoknadState({nattevaak: []})
                }
                break;

        }
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
            this.updateSoknad
            ({utenlandsopphold: []})
        }
    }

    private handleBarnetSkalLeggesInn(jaNei: JaNei) {
        this.setState({
            barnetSkalLeggesInn: jaNei,
        });

        if (jaNei === JaNei.JA &&
            this.state.innleggelseUtlandet!.length === 0) {
            this.state.innleggelseUtlandet!.push({fom: '', tom: ''});
            this.forceUpdate();
        }
        ;

        if (jaNei !== JaNei.JA) {
            this.setState({innleggelseUtlandet: []})
        }
    }

    private handleMedlemskapChange(jaNei: JaNeiIkkeOpplyst) {
        this.setState({
            harBoddIUtlandet: jaNei,
        });

        if (jaNei === JaNeiIkkeOpplyst.JA &&
            this.state.soknad.bosteder!.length === 0) {
            this.state.soknad.bosteder!.push({periode: {fom: '', tom: ''}, land: ''});
            this.forceUpdate();
        }
        ;
    }

    private handleFrilanserChange(jaNei: JaNei) {

        if (jaNei === JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: this.initialArbeidstidInfo
                }, opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true
                    }
                }
            })
            this.updateSoknad
            ({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.forceUpdate();
        }
        ;

        if (jaNei !== JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.updateSoknad
            ({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {}
                }, opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet,
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false
                    }
                }
            })
            this.forceUpdate();
        }
        ;
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
            this.updateSoknad
            ({lovbestemtFerie: []})
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

    private getManglerFromStore = () => {
        return this.props.punchFormState.inputErrors;
    };

    private getErrorMessage = (attribute: string) => {
        const errorMsg = this.getManglerFromStore()?.filter(
            (m: IInputError) => m.felt === attribute)?.[0]?.feilmelding;

        if (errorMsg) {
            if (errorMsg.startsWith('Mangler søknadsperiode')) {
                return intlHelper(this.props.intl, 'skjema.feil.søknadsperiode/endringsperiode')
            }
            if (attribute === 'nattevåk' || attribute === 'beredskap' || 'lovbestemtFerie') {
                return errorMsg
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
                    .replace(
                        /^skjema.feil.mottattDato.must not be null$/,
                        'skjema.feil.datoMottatt.MAA_SETTES'
                    )
            )
            : undefined;
    };

    private updateSoknadState(soknad: Partial<IPSBSoknad>, showStatus ?: boolean) {
        if (!this.state.soknad.barn.norskIdent) {
            this.updateSoknad
            ({barn: {norskIdent: this.props.identState.ident2 || ''}});
        }
        this.setState({
            soknad: {...this.state.soknad, ...soknad},
            showStatus: !!showStatus,
        });
    }

    private updateSoknad = (soknad: Partial<IPSBSoknad>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            {...this.getSoknadFromStore(), ...soknad},
            //   {...this.getDobbelSoknadFromStore().soknad(nr)!.values(), ...soknad}
        );
        this.forceUpdate();
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
        onBlur: (event: any) => this.updateSoknad
        (change(event)),
    });


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
    signaturState: state.PLEIEPENGER_SYKT_BARN.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getSoknad(id)),
    hentPerioder: (ident1: string, ident2: string) => dispatch(hentPerioderFraK9Sak(ident1, ident2)),
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
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) =>
        dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) => dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (ident: string, soeknadid: string) =>
        dispatch(validerSoknad(ident, soeknadid)),
});

export const PunchForm = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)
);
