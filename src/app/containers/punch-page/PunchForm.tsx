import {CountrySelect}                                 from 'app/components/country-select/CountrySelect';
import {PunchStep}                                     from 'app/models/enums';
import {IPunchFormState, IPunchState, ISoknad}         from 'app/models/types';
import {
    getMappe,
    resetMappeAction,
    setIdentAction,
    setStepAction,
    submitSoknad,
    undoChoiceOfMappeAction,
    updateSoknad
}                                                      from 'app/state/actions';
import {RootStateType}                                 from 'app/state/RootState';
import {changePath}                                    from 'app/utils';
import intlHelper                                      from 'app/utils/intlUtils';
import _                                               from 'lodash';
import {AlertStripeInfo}                               from 'nav-frontend-alertstriper';
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from 'nav-frontend-etiketter';
import {Knapp}                                         from 'nav-frontend-knapper';
import Lukknapp                                        from 'nav-frontend-lukknapp';
import {Checkbox, Input, Select, Textarea}             from 'nav-frontend-skjema';
import NavFrontendSpinner                              from 'nav-frontend-spinner';
import * as React                                      from 'react';
import {InjectedIntlProps, injectIntl}                 from 'react-intl';
import {connect}                                       from 'react-redux';
import {RouteComponentProps, withRouter}               from 'react-router-dom';

interface IPunchFormComponentProps {
    getPunchPath:   (step: PunchStep, values?: any) => string;
    journalpostid:  string;
    match?:         any;
}

interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    punchState:     IPunchState;
}

interface IPunchFormDispatchProps {
    getMappe:                   typeof getMappe;
    resetMappeAction:           typeof resetMappeAction;
    setIdentAction:             typeof setIdentAction;
    setStepAction:              typeof setStepAction;
    undoChoiceOfMappeAction:    typeof undoChoiceOfMappeAction;
    updateSoknad:               typeof updateSoknad;
    submitSoknad:               typeof submitSoknad;
}

interface IPunchFormPageState {
    soknad:     ISoknad;
    isFetched:  boolean;
    showStatus: boolean;
}

type IPunchFormProps = IPunchFormComponentProps
                       & RouteComponentProps
                       & InjectedIntlProps
                       & IPunchFormStateProps
                       & IPunchFormDispatchProps;

class PunchForm extends React.Component<IPunchFormProps, IPunchFormPageState> {

    state: IPunchFormPageState = {
        soknad: {
            soker: {
                norsk_identitetsnummer: '',
                spraak_valg: 'nb'
            },
            periode: {
                fra_og_med: undefined,
                til_og_med: undefined
            },
            relasjon_til_barnet: '',
            barn: {},
            medlemskap: {
                opphold: [],
                har_bodd_i_utlandet_siste_12_mnd: false,
                skal_bo_i_utlandet_neste_12_mnd: false
            },
            beredskap: {
                svar: false,
                tilleggsinformasjon: ''
            },
            nattevaak: {
                svar: false,
                tilleggsinformasjon: ''
            }
        },
        isFetched: false,
        showStatus: false
    };

    componentDidMount(): void {
        const {id} = this.props.match.params;
        this.props.getMappe(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
    }

    componentDidUpdate(prevProps: Readonly<IPunchFormProps>, prevState: Readonly<IPunchFormPageState>, snapshot?: any): void {
        const {mappe} = this.props.punchFormState;
        if (!!mappe && !this.state.isFetched) {
            this.setState({soknad: mappe.innhold, isFetched: true});
            this.props.setIdentAction(mappe.norsk_ident || mappe.innhold?.soker?.norsk_identitetsnummer || '');
        }
    }

    render() {

        const {intl, punchFormState} = this.props;
        const {soknad} = this.state;
        const infomelding = "Fyll ut informasjon.";

        if (punchFormState.isComplete) {
            changePath(this.props.getPunchPath(PunchStep.COMPLETED));
            return null;
        }

        if (punchFormState.isMappeLoading) {
            return <NavFrontendSpinner/>;
        }

        return (<>
            {this.statusetikett()}
            <p><Knapp onClick={this.handleBackButtonClick}>Til søknadsoversikten</Knapp></p>
            <AlertStripeInfo>{infomelding}</AlertStripeInfo>
            <h2>{intlHelper(intl, 'skjema.soker.opplysninger')}</h2>
            <Select
                name="sprak"
                label={`${intlHelper(intl, 'skjema.soker.sprak')}:`}
                className="bold-label"
                value={soknad.soker?.spraak_valg || 'nb'}
                {...this.onChangeOnlyUpdate(event => ({soker: {spraak_valg: event.target.value}}))}
            >
                <option value='nb'>Bokmål</option>
                <option value='nn'>Nynorsk</option>
            </Select>
            <Input
                name="medsoker"
                label={`${intlHelper(intl, 'skjema.soker.medsoker.fnr')}:`}
                className="bold-label"
                value={_.get(soknad, 'medsoker.norsk_identitetsnummer', '')}
                {...this.changeAndBlurUpdates(event => ({medsoker: {norsk_identitetsnummer: event.target.value}}))}
            />
            <Input
                name="relasjon"
                label={`${intlHelper(intl, 'skjema.soker.relasjon')}:`}
                className="bold-label"
                value={_.get(soknad, 'relasjon_til_barnet', '')}
                {...this.changeAndBlurUpdates(event => ({relasjon_til_barnet: event.target.value}))}
            />
            <h2>{intlHelper(intl, 'skjema.barn.opplysninger')}</h2>
            <Input
                name="barnetsnavn"
                label={`${intlHelper(intl, 'skjema.barn.navn')}:`}
                className="bold-label"
            />
            <Input
                name="barnetsfnr"
                label={`${intlHelper(intl, 'skjema.barn.fnr')}:`}
                className="bold-label"
            />
            <h2>{intlHelper(intl, 'skjema.utenlandsopphold.opplysninger')}</h2>
            {!!soknad?.medlemskap?.opphold.length && (
                <table className="tabell tabell--stripet">
                    <thead>
                    <tr>
                        <th>{intlHelper(intl, 'skjema.utenlandsopphold.land')}</th>
                        <th>{intlHelper(intl, 'skjema.utenlandsopphold.fom')}</th>
                        <th>{intlHelper(intl, 'skjema.utenlandsopphold.tom')}</th>
                        <th>{intlHelper(intl, 'skjema.utenlandsopphold.fjern')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(soknad.medlemskap.opphold).map((key) => (
                        <tr key={key}>
                            <td><CountrySelect
                                name={`opphold_land_${key}`}
                                onChange={event => this.handleOppholdLandChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                selectedcountry={_.get(soknad.medlemskap!.opphold[key], 'land', '')}
                                unselectedoption={'Velg …'}
                                label=""
                            /></td>
                            <td><Input
                                name={`opphold_fom_${key}`}
                                onChange={event => this.handleOppholdFomChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                type="date"
                                value={_.get(soknad.medlemskap!.opphold[key], 'periode.fra_og_med', '')}
                                label=""
                            /></td>
                            <td><Input
                                name={`opphold_tom_${key}`}
                                onChange={event => this.handleOppholdTomChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                type="date"
                                value={_.get(soknad.medlemskap!.opphold[key], 'periode.til_og_med', '')}
                                label=""
                            /></td>
                            <td><Lukknapp bla={true} onClick={() => this.removeOpphold(+key)}/></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            <p><Knapp onClick={this.addOpphold}>{intlHelper(intl, 'skjema.utenlandsopphold.legg_til')}</Knapp></p>
            <h2>Beredskap</h2>
            <Checkbox
                label="Beredskap"
                checked={_.get(soknad, 'beredskap.svar', false)}
                {...this.onChangeOnlyUpdate(event => ({beredskap: {...soknad.beredskap, svar: event.target.checked}}))}
            />
            <Textarea
                label="Tilleggsopplysninger:"
                value={_.get(soknad, 'beredskap.tilleggsinformasjon', '')}
                {...this.changeAndBlurUpdates(event => ({beredskap: {...soknad.beredskap, tilleggsinformasjon: event.target.value}}))}
            />
            <h2>Nattevåk</h2>
            <Checkbox
                label="Nattevåk"
                checked={_.get(soknad, 'nattevaak.svar', false)}
                {...this.onChangeOnlyUpdate(event => ({nattevaak: {...soknad.nattevaak, svar: event.target.checked}}))}
            />
            <Textarea
                label="Tilleggsopplysninger:"
                value={_.get(soknad, 'nattevaak.tilleggsinformasjon', '')}
                {...this.changeAndBlurUpdates(event => ({nattevaak: {...soknad.nattevaak, tilleggsinformasjon: event.target.value}}))}
            />
            <h2>Søknad om pleiepenger</h2>
            <Input
                name="fom"
                type="date"
                label="Fra og med:"
                className="bold-label"
                value={_.get(soknad, 'periode.fra_og_med', '')}
                {...this.changeAndBlurUpdates(event => ({periode: {...soknad.periode, fra_og_med: event.target.value}}))}
            />
            <Input
                name="tom"
                type="date"
                label="Til og med:"
                className="bold-label"
                value={_.get(soknad, 'periode.til_og_med', '')}
                {...this.changeAndBlurUpdates(event => ({periode: {...soknad.periode, til_og_med: event.target.value}}))}
            />
            <Checkbox
                name="underskrift"
                label="Søknaden er underskrevet"
                className="bold-label"
            />
            <p><Knapp
                onClick={() => this.props.submitSoknad(this.props.match.params.id)}
                disabled={!punchFormState.mappe?.mangler || punchFormState.mappe.mangler.length}
            >Send inn</Knapp></p>
        </>);
    }

    private updateSoknadState(soknad: Partial<ISoknad>, showStatus: boolean) {
        this.setState({soknad: {...this.state.soknad, ...soknad}, showStatus});
    }

    private handleBackButtonClick = () => {
        const {punchState, getPunchPath} = this.props;
        this.props.resetMappeAction();
        this.props.undoChoiceOfMappeAction();
        changePath(getPunchPath(PunchStep.CHOOSE_SOKNAD, {ident: punchState.ident}));
    };

    private changeAndBlurUpdates = (change: (event: any) => Partial<ISoknad>) => ({
        onChange:   (event: any) => this.updateSoknadState(change(event), false),
        onBlur:     (event: any) => this.updateSoknad(change(event))
    });

    private onChangeOnlyUpdate = (change: (event: any) => Partial<ISoknad>) => ({onChange: (event: any) => {
        this.updateSoknadState(change(event), true);
        this.updateSoknad(change(event));
    }});

    private handleOppholdLandChange = (index: number, land: string) => {
        this.state.soknad.medlemskap!.opphold[index].land = land;
        this.forceUpdate();
    };

    private handleOppholdFomChange = (index: number, fom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, fra_og_med: fom};
        this.forceUpdate();
    };

    private handleOppholdTomChange = (index: number, tom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, til_og_med: tom};
        this.forceUpdate();
    };

    private addOpphold = () => {
        if (!this.state.soknad.medlemskap) {
            this.state.soknad = {...this.state.soknad, medlemskap: {opphold: []}};
        } else if (!this.state.soknad.medlemskap.opphold) {
            this.state.soknad.medlemskap = {...this.state.soknad.medlemskap, opphold: []};
        }
        this.state.soknad.medlemskap!.opphold.push({land: '', periode: {}});
        this.forceUpdate();
        this.setOpphold();
    };

    private removeOpphold = (index: number) => {
        this.state.soknad.medlemskap!.opphold.splice(index, 1);
        this.forceUpdate();
        this.setOpphold();
    };

    private setOpphold = () => this.updateSoknad({medlemskap: {...this.props.punchFormState.mappe.innhold.medlemskap, opphold: this.state.soknad.medlemskap!.opphold}});

    private updateSoknad = (soknad: Partial<ISoknad>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            this.props.match.params.id,
            this.props.punchState.ident,
            this.props.journalpostid,
            {...this.props.punchFormState.mappe.innhold, ...soknad}
        );
    };

    private statusetikett() {

        if (!this.state.showStatus) {
            return null;
        }

        const {punchFormState} = this.props;
        const className = "statusetikett";

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{className}}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateMappeError) {
            return <EtikettAdvarsel {...{className}}>Lagring feilet</EtikettAdvarsel>;
        }
        return <EtikettSuksess {...{className}}>Lagret</EtikettSuksess>;
    }
}

const mapStateToProps = (state: RootStateType) => ({
    punchFormState: state.punchFormState,
    punchState: state.punchState
});

const mapDispatchToProps = (dispatch: any) => ({
    getMappe:                   (id: string)                => dispatch(getMappe(id)),
    resetMappeAction:           ()                          => dispatch(resetMappeAction()),
    setIdentAction:             (ident: string)             => dispatch(setIdentAction(ident)),
    setStepAction:              (step: PunchStep)           => dispatch(setStepAction(step)),
    undoChoiceOfMappeAction:    ()                          => dispatch(undoChoiceOfMappeAction()),
    updateSoknad:               (mappeid: string,
                                 norskIdent: string,
                                 journalpostid: string,
                                 soknad: Partial<ISoknad>)  => dispatch(updateSoknad(mappeid, norskIdent, journalpostid, soknad)),
    submitSoknad:               (mappeid: string)           => dispatch(submitSoknad(mappeid))
});

export default withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchForm)));