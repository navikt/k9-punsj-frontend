import {Arbeidsforhold, JaNeiVetikke} from "app/models/enums";
import {Ukedag} from "app/models/enums/Ukedag";
import {IPunchFormState, IPunchState} from "app/models/types";
import {setTilsynAction} from "app/state/actions";
import {RootStateType} from "app/state/RootState";

import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {Knapp} from "nav-frontend-knapper";
import {Checkbox, Fieldset, Input, Radio, TextareaControlled} from "nav-frontend-skjema";

import * as React from 'react';
import {InjectedIntlProps, injectIntl} from "react-intl";
import {connect} from "react-redux";
import intlHelper from "../../../utils/intlUtils";

interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    punchState: IPunchState;
}

interface IPunchFormDispatchProps {
    setTilsynAction: typeof setTilsynAction;
}

type IPunchFormProps = InjectedIntlProps & IPunchFormStateProps & IPunchFormDispatchProps;

class PunchForm extends React.Component<IPunchFormProps> {

    render() {

        const {intl, punchState} = this.props;
        const infomelding = !!punchState.chosenMappe
            ? `Fortsett å fylle ut informasjon om mappe ${punchState.chosenMappe.mappe_id}.`
            : `Fødselsnummeret har ingen tilknyttede, ufullstendige søknader. Fyll ut skjemaet for å opprette en ny.`;

        const tilsynukedager = [];
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
        }

        return (<>
            <AlertStripeInfo>{infomelding}</AlertStripeInfo>
            <h2>Opplysninger om søkeren</h2>
            <Input
                name="relasjon"
                label="Slektskap/relasjon til barnet:"
                className="bold-label"
            />
            <Fieldset legend="Arbeidsforhold 1:">
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
            />
            <h2>Opplysninger om barnet</h2>
            <Input
                name="barnetsnavn"
                label="Barnets navn:"
            />
            <Input
                name="barnetsfnr"
                label="Barnets fødselsnummer:"
            />
            <h2>Opplysninger om tilsyn av barnet</h2>
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
            <TextareaControlled name="legeerklaering" label="" defaultValue=""/>
            <h2>Søknad om pleiepenger</h2>
            <Input
                name="fom"
                type="date"
                label="Fra og med:"
                className="bold-label"
            />
            <Input
                name="tom"
                type="date"
                label="Til og med:"
                className="bold-label"
            />
            <Checkbox
                name="underskrift"
                label="Søknaden er underskrevet"
                className="bold-label"
            />
            <p><Knapp>Send inn</Knapp></p>
        </>);
    }

    private handleTilsynChange = (event: any) => this.props.setTilsynAction(event.target.value);
}

function mapStateToProps(state: RootStateType) {return {
    punchFormState: state.punchFormState,
    punchState: state.punchState
}}

function mapDispatchToProps(dispatch: any) {return {
    setTilsynAction: (tilsyn: JaNeiVetikke) => dispatch(setTilsynAction(tilsyn))
}}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchForm));