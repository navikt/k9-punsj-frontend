import {IPunchState} from "app/models/types";
import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {Knapp} from "nav-frontend-knapper";
import {Fieldset, Radio} from "nav-frontend-skjema";
import * as React from 'react';
import {InjectedIntlProps, injectIntl} from "react-intl";
import {connect} from "react-redux";
import {Arbeidsforhold} from "../../../models/enums";

import {RootStateType} from "../../../state/RootState";
import intlHelper from "../../../utils/intlUtils";

interface IPunchFormStateProps {
    punchState: IPunchState;
}

type IPunchFormProps = InjectedIntlProps & IPunchFormStateProps;

class PunchForm extends React.Component<IPunchFormProps> {
    render() {
        const {intl, punchState} = this.props;
        const infomelding = !!punchState.chosenMappe
            ? `Fortsett å fylle ut informasjon om mappe ${punchState.chosenMappe.mappe_id}.`
            : `Fødselsnummeret har ingen tilknyttede, ufullstendige søknader. Fyll ut skjemaet for å opprette en ny.`;
        return (<>
            <AlertStripeInfo>{infomelding}</AlertStripeInfo>
            <Fieldset legend="Søkerens arbeidsforhold">
                <Radio
                    name='arbeidsforhold'
                    label={intlHelper(intl, `skjema.arbeidsforhold.${Arbeidsforhold.ARBEIDSTAKER}`)}
                    value={Arbeidsforhold.ARBEIDSTAKER}
                />
                <Radio
                    name='arbeidsforhold'
                    label={intlHelper(intl, `skjema.arbeidsforhold.${Arbeidsforhold.SELVSTENDIG}`)}
                    value={Arbeidsforhold.SELVSTENDIG}
                />
                <Radio
                    name='arbeidsforhold'
                    label={intlHelper(intl, `skjema.arbeidsforhold.${Arbeidsforhold.FRILANSER}`)}
                    value={Arbeidsforhold.FRILANSER}
                />
                <Radio
                    name='arbeidsforhold'
                    label={intlHelper(intl, `skjema.arbeidsforhold.${Arbeidsforhold.ANNET}`)}
                    value={Arbeidsforhold.ANNET}
                />
                <Radio
                    name='arbeidsforhold'
                    label={intlHelper(intl, `skjema.arbeidsforhold.${Arbeidsforhold.IKKE_OPPGITT}`)}
                    value={Arbeidsforhold.IKKE_OPPGITT}
                    checked={true}
                />
            </Fieldset>
            <p><Knapp>Send inn</Knapp></p>
        </>);
    }
}

function mapStateToProps(state: RootStateType) {return {
    punchState: state.punchState
}}

export default injectIntl(connect(mapStateToProps)(PunchForm));