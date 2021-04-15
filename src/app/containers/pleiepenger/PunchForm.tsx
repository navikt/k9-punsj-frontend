import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {JaNei, JaNeiVetikke, PunchStep} from 'app/models/enums';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {IPleiepengerPunchState, IPunchFormState, ISignaturState, ITilsyn,} from 'app/models/types';
import {
    getSoknad,
    resetPunchFormAction,
    resetSoknadAction,
    setIdentAction, setSignaturAction,
    setStepAction,
    submitSoknad,
    undoChoiceOfEksisterendeSoknadAction,
    updateSoknad,
} from 'app/state/actions';
import {setHash} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeFeil} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import {Input, RadioPanelGruppe, SkjemaGruppe,} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {ISoknadV2, SoknadV2, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/Soknadv2";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {RootStateType} from "../../state/RootState";
import {connect} from "react-redux";
import {IPeriodeV2} from "../../models/types/PeriodeV2";
import {ISelvstendigNaeringsdrivendeV2} from "../../models/types/SelvstendigNæringsdrivendeV2";
import {IFrilanserV2} from "../../models/types/FrilanserV2";
import {PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import './punchForm.less'


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

            omsorg: {
                samtykketOmsorgForBarnet: false,
                beskrivelseAvOmsorgsrollen: '',
                relasjonTilBarnet: ''
            }
        },
        isFetched: false,
        showStatus: false,
        faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
        iTilsynsordning: JaNeiVetikke.NEI
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

        const initialArbeidstaker = new ArbeidstakerV2({
            arbeidstidInfo: undefined,
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

                <Ekspanderbartpanel
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningeromsoknad")}
                >
                    <SkjemaGruppe>
                    <Input
                        id="soknad-dato"
                        bredde={"M"}
                        label={intlHelper(intl, 'skjema.mottakelsesdato')}
                        type="date"
                        className="bold-label"
                        value={soknad.mottattDato}
                        {...this.changeAndBlurUpdatesSoknad((event) => ({
                            mottattDato: event.target.value,
                        }))}
                        //       feil={this.getErrorMessage('datoMottatt')}

                    />
                        <h2>{intlHelper(intl, 'ident.signatur.overskrift')}</h2>
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
                </Ekspanderbartpanel>
                <Ekspanderbartpanel
                    className={"punchform__paneler"}
                    tittel={intlHelper(intl, "skjema.opplysningeromsoker")}/>
            </>);
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
        soknad: Partial<ISoknadV2>,
        showStatus?: boolean
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
