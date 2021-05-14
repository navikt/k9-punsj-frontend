import * as React from "react";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import intlHelper from "../../utils/intlUtils";

import {Knapp} from "nav-frontend-knapper";
import {getEnvironmentVariable} from "../../utils";
import './settPaaVentModal.less'
import CheckCircleSvg from "../../assets/SVG/CheckCircleSVG";
import {Row} from "react-bootstrap";
import moment from 'moment';

const getDate = () => {
    return moment().add(21, 'days').format('DD.MM.YYYY');

}
class SettPaaVentOkModal extends React.Component<WrappedComponentProps> {

    render() {
        const {intl} = this.props;

        return (
            <div className={"sett-paa-vent-ok"}>
                <CheckCircleSvg title={"check"}/>
                <div className={"vl"}/>
                <div className={"info"}>
                    <Row><FormattedMessage id={'modal.settpaavent.til'} values={{dato: getDate()}}/></Row>
                    <Row><FormattedMessage id={'modal.settpaavent.tillos'}/></Row>
                </div>
                <Knapp mini={true} onClick={() => window.location.href = getEnvironmentVariable('K9_LOS_URL')}>{intlHelper(intl, 'modal.settpaavent.ok')}</Knapp>
            </div>
        );
    }
}
export default injectIntl(SettPaaVentOkModal);
