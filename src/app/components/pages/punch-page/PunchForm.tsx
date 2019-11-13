import {IOpphold, IPunchFormState, IPunchState, ISoknad} from "app/models/types";
import {setOppholdAction, setSoknadAction} from "app/state/actions";
import {RootStateType} from "app/state/RootState";
import intlHelper from "../../../utils/intlUtils";

import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {Knapp} from "nav-frontend-knapper";
import Lukknapp from "nav-frontend-lukknapp";
import {Checkbox, Input, Select, TextareaControlled} from "nav-frontend-skjema";

import _ from 'lodash';
import * as React from 'react';
import {InjectedIntlProps, injectIntl} from "react-intl";
import {connect} from "react-redux";

interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    punchState:     IPunchState;
}

interface IPunchFormDispatchProps {
    setSoknadAction:    typeof setSoknadAction;
    setOppholdAction:   typeof setOppholdAction;
}

interface IPunchFormPageState {
    opphold: IOpphold[];
}

type IPunchFormProps = InjectedIntlProps & IPunchFormStateProps & IPunchFormDispatchProps;

class PunchForm extends React.Component<IPunchFormProps, IPunchFormPageState> {

    state: IPunchFormPageState = {opphold: []};

    componentDidMount(): void {

        if (!!this.props.punchState.chosenMappe && !!this.props.punchState.chosenMappe.innhold) {
            this.props.setSoknadAction(this.props.punchState.chosenMappe.innhold);
            this.setState({opphold: this.props.punchState.chosenMappe.innhold.medlemskap.opphold});
        } else {
            this.setState({opphold: this.props.punchFormState.soknad.medlemskap.opphold});
        }

    }

    render() {

        const {intl, punchState, punchFormState} = this.props;
        const {soknad} = punchFormState;
        const infomelding = !!punchState.chosenMappe
            ? `Fortsett å fylle ut informasjon om mappe ${punchState.chosenMappe.mappe_id}.`
            : `Fødselsnummeret har ingen tilknyttede, ufullstendige søknader. Fyll ut skjemaet for å opprette en ny.`;

/*        const tilsynukedager = [];
        for (const ukedag in Object.keys(Ukedag).filter(key => isNaN(Number(Ukedag[key])))) {
            if (Number(ukedag) < 5) {
                tilsynukedager.push(
                    <tr key={ukedag}>
                        <td>{intlHelper(intl, `Ukedag.${ukedag}`)}</td>
                        <td><Input name={`tilsyn_${ukedag}_timer`} label=""/></td>
                        <td><Input name={`tilsyn_${ukedag}_minutter`} label=""/></td>
                    </tr>
                );
            }
        }*/

        return (<>
            <AlertStripeInfo>{infomelding}</AlertStripeInfo>
            <h2>{intlHelper(intl, 'skjema.soker.opplysninger')}</h2>
            <Select
                name="sprak"
                label={`${intlHelper(intl, 'skjema.soker.sprak')}:`}
                className="bold-label"
            >
                <option
                    value='nb'
                    selected={_.get(soknad, 'soker.spraak_valg') === 'nb'}
                >Bokmål</option>
                <option
                    value='nn'
                    selected={_.get(soknad, 'soker.spraak_valg') === 'nn'}
                >Nynorsk</option>
            </Select>
            <Input
                name="medsoker"
                label={`${intlHelper(intl, 'skjema.soker.medsoker.fnr')}:`}
                className="bold-label"
                defaultValue={_.get(soknad, 'medsoker.norsk_identitetsnummer', '')}
            />
            <Input
                name="relasjon"
                label={`${intlHelper(intl, 'skjema.soker.relasjon')}:`}
                className="bold-label"
                defaultValue={_.get(soknad, 'relasjon_til_barnet', '')}
            />
            {/*<Fieldset legend="Arbeidsforhold 1:">
                {Object.values(Arbeidsforhold).map(arbeidsforhold => (
                    <Radio
                        key={`arbeidsforhold1_${arbeidsforhold}`}
                        name="arbeidsforhold1"
                        label={intlHelper(intl, `skjema.arbeidsforhold.${arbeidsforhold}`)}
                        value={arbeidsforhold}
                    />
                ))}
            </Fieldset>
            <TextareaControlled
                name="arbeidsgiver1"
                label="Arbeidsgiverens navn og adresse:"
                defaultValue=""
            />
            <Fieldset legend="Arbeidsforhold 2:">
                {Object.values(Arbeidsforhold).map(arbeidsforhold => (
                    <Radio
                        key={`arbeidsforhold1_${arbeidsforhold}`}
                        name="arbeidsforhold2"
                        label={intlHelper(intl, `skjema.arbeidsforhold.${arbeidsforhold}`)}
                        value={arbeidsforhold}
                    />
                ))}
            </Fieldset>
            <TextareaControlled
                name="arbeidsgiver2"
                label="Arbeidsgiverens navn og adresse:"
                defaultValue=""
            />*/}
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
            {!!this.state.opphold.length && <table className="tabell tabell--stripet">
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
                            <td><Input
                                name={`opphold_land_${key}`}
                                onChange={event => this.handleOppholdLandChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                defaultValue={_.get(this.state.opphold[key], 'land', '')}
                                label=""
                            /></td>
                            <td><Input
                                name={`opphold_fom_${key}`}
                                onChange={event => this.handleOppholdFomChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                type="date"
                                defaultValue={_.get(this.state.opphold[key], 'periode.fra_og_med', '')}
                                label=""
                            /></td>
                            <td><Input
                                name={`opphold_tom_${key}`}
                                onChange={event => this.handleOppholdTomChange(+key, event.target.value)}
                                onBlur={() => this.setOpphold()}
                                type="date"
                                defaultValue={_.get(this.state.opphold[key], 'periode.til_og_med', '')}
                                label=""
                            /></td>
                            <td><Lukknapp bla={true} onClick={() => this.removeOpphold(+key)}/></td>
                        </tr>
                    ))}
                </tbody>
            </table>}
            <p><Knapp onClick={this.addOpphold}>{intlHelper(intl, 'skjema.utenlandsopphold.legg_til')}</Knapp></p>
            {/*<h2>Opplysninger om tilsyn av barnet</h2>
            <Fieldset legend="Skal barnet gå i barnehage eller på skole/SFO eller være i annet etablert tilsyn i pleiepengeperioden?">
                {Object.values(JaNeiVetikke).map(janeivetikke => (
                    <Radio
                        key={`tilsyn_${janeivetikke}`}
                        name="tilsyn"
                        label={intlHelper(intl, janeivetikke)}
                        value={janeivetikke}
                        onChange={this.handleTilsynChange}
                        checked={this.props.punchFormState.tilsyn === janeivetikke}
                    />
                ))}
            </Fieldset>
            {
                this.props.punchFormState.tilsyn === JaNeiVetikke.JA && (<>
                    <AlertStripeInfo>Før opp hele timer/minutter med tilsyn på ukedager.</AlertStripeInfo>
                    <table className="tabell tabell--stripet">
                        <thead>
                            <tr>
                                <th>Ukedag</th>
                                <th>Timer</th>
                                <th>Minutter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(Ukedag)
                                   .filter(ukedag => isNaN(Number(Ukedag[ukedag])))
                                   .filter(ukedag => Number(ukedag) < 5)
                                   .map(ukedag => (
                                        <tr key={ukedag}>
                                            <td>{intlHelper(intl, `Ukedag.${ukedag}`)}</td>
                                            <td><Input name={`tilsyn_${ukedag}_timer`} label=""/></td>
                                            <td><Input name={`tilsyn_${ukedag}_minutter`} label=""/></td>
                                        </tr>
                                   ))}
                        </tbody>
                    </table>
                </>)
            }
            <h2>Tilleggsopplysninger</h2>
            <TextareaControlled name="tilleggsopplysninger" label="" defaultValue=""/>
            <h2>Legeerklæring</h2>
            <TextareaControlled name="legeerklaering" label="" defaultValue=""/>*/}
            <h2>Beredskap</h2>
            <Checkbox
                label="Beredskap"
                defaultChecked={_.get(soknad, 'beredskap.svar', false)}
            />
            <TextareaControlled
                label="Tilleggsopplysninger:"
                defaultValue={_.get(soknad, 'beredskap.tilleggsinformasjon', '')}
            />
            <h2>Nattevåk</h2>
            <Checkbox
                label="Nattevåk"
                defaultChecked={_.get(soknad, 'nattevaak.svar', false)}
            />
            <TextareaControlled
                label="Tilleggsopplysninger:"
                defaultValue={_.get(soknad, 'nattevaak.tilleggsinformasjon', '')}
            />
            <h2>Søknad om pleiepenger</h2>
            <Input
                name="fom"
                type="date"
                label="Fra og med:"
                className="bold-label"
                defaultValue={_.get(soknad, 'periode.fra_og_med', '')}
            />
            <Input
                name="tom"
                type="date"
                label="Til og med:"
                className="bold-label"
                defaultValue={_.get(soknad, 'periode.til_og_med', '')}
            />
            <Checkbox
                name="underskrift"
                label="Søknaden er underskrevet"
                className="bold-label"
            />
            <p><Knapp>Send inn</Knapp></p>
        </>);
    }

    private handleOppholdLandChange = (index: number, land: string) => {
        this.state.opphold[index].land = land;
        this.forceUpdate();
    };

    private handleOppholdFomChange = (index: number, fom: string) => {
        this.state.opphold[index].periode = {...this.state.opphold[index].periode, fra_og_med: fom};
        this.forceUpdate();
    };

    private handleOppholdTomChange = (index: number, tom: string) => {
        this.state.opphold[index].periode = {...this.state.opphold[index].periode, til_og_med: tom};
        this.forceUpdate();
    };

    private addOpphold = () => {
        this.state.opphold.push({land: '', periode: {}});
        this.forceUpdate();
        this.setOpphold();
    };

    private removeOpphold = (index: number) => {
        this.state.opphold.splice(index, 1);
        this.forceUpdate();
        this.setOpphold();
    };

    private setOpphold = () => this.props.setOppholdAction(this.state.opphold);

    // private handleTilsynChange = (event: any) => this.props.setTilsynAction(event.target.value);
}

function mapStateToProps(state: RootStateType) {return {
    punchFormState: state.punchFormState,
    punchState:     state.punchState
}}

function mapDispatchToProps(dispatch: any) {return {
    setSoknadAction:    (soknad: ISoknad)       => dispatch(setSoknadAction(soknad)),
    setOppholdAction:   (opphold: IOpphold[])   => dispatch(setOppholdAction(opphold))
}}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchForm));