import {IPunchState} from "app/models/types";
import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {Knapp} from "nav-frontend-knapper";
import * as React from 'react';
import {InjectedIntlProps, injectIntl} from "react-intl";
import {connect} from "react-redux";

import {RootStateType} from "../../../state/RootState";

interface IPunchFormStateProps {
    punchState: IPunchState;
}

type IPunchFormProps = InjectedIntlProps & IPunchFormStateProps;

class PunchForm extends React.Component<IPunchFormProps> {
    render() {
        const {punchState} = this.props;
        const infomelding = !!punchState.chosenMappe
            ? `Fortsett å fylle ut informasjon om mappe ${punchState.chosenMappe.mappe_id}.`
            : `Fødselsnummeret har ingen tilknyttede, ufullstendige søknader. Fyll ut skjemaet for å opprette en ny.`;
        return (<>
            <AlertStripeInfo>{infomelding}</AlertStripeInfo>
            <p>Skjema her</p>
            <p><Knapp>Send inn</Knapp></p>
        </>);
    }
}

function mapStateToProps(state: RootStateType) {return {
    punchState: state.punchState
}}

export default injectIntl(connect(mapStateToProps)(PunchForm));