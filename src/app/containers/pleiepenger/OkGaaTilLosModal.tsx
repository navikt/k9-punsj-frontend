import * as React from "react";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import intlHelper from "../../utils/intlUtils";

import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {getEnvironmentVariable} from "../../utils";
import './okGaaTilLosModal.less.less'
import CheckCircleSvg from "../../assets/SVG/CheckCircleSVG";
import {Row} from "react-bootstrap";
import moment from 'moment';

interface IOkGaaTilLOsModalProps {
    melding: string;
    extraInfo?: string;
}

const getDate = () => {
    return moment().add(21, 'days').format('DD.MM.YYYY');
}

const utledMelding = (mld: string) => {
    if (mld === 'modal.settpaavent.til') {
        return <FormattedMessage id={mld} values={{dato: getDate()}}/>
    } else {
        return <FormattedMessage id={mld} />
    }
}

class OkGaaTilLosModal extends React.Component<WrappedComponentProps & IOkGaaTilLOsModalProps> {

    render() {
        const {intl, melding, extraInfo} = this.props;

        return (
            <div className={"ok-gaa-til-los"}>
                <CheckCircleSvg title={"check"}/>
                <div className={"vl"}/>
                <div className={"info"}>
                    <Row>{utledMelding(melding)}</Row>
                    <Row><FormattedMessage id={'modal.okgaatillos.tillos'}/></Row>
                </div>
                <Hovedknapp className={"okknapp"} mini={true} onClick={() => window.location.href = getEnvironmentVariable('K9_LOS_URL')}>{intlHelper(intl, 'modal.okgaatillos.ok')}</Hovedknapp>
            </div>
        );
    }
}
export default injectIntl(OkGaaTilLosModal);
