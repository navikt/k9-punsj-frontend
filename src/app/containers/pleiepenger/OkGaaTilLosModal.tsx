import * as React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Hovedknapp } from 'nav-frontend-knapper';
import intlHelper from '../../utils/intlUtils';

import { getEnvironmentVariable } from '../../utils';
import './okGaaTilLosModal.less';
import CheckCircleSvg from '../../assets/SVG/CheckCircleSVG';
import { Row } from 'react-bootstrap';
import moment from 'moment';

interface IOkGaaTilLOsModalProps {
    melding: string;
    extraInfo?: string;
}

const getDate = () => moment()
        .add(21, 'days')
        .format('DD.MM.YYYY');

const utledMelding = (mld: string) => {
    if (mld === 'modal.settpaavent.til') {
        return <FormattedMessage id={mld} values={{ dato: getDate() }} />;
    } 
        return <FormattedMessage id={mld} />;
    
};

class OkGaaTilLosModal extends React.Component<WrappedComponentProps & IOkGaaTilLOsModalProps> {
    render() {
        const { intl, melding, extraInfo } = this.props;

        return (
            <div className="ok-gaa-til-los">
                <CheckCircleSvg title="check" />
                <div className="vl" />
                <div className="info">
                    <Row>{utledMelding(melding)}</Row>
                    <Row>
                        <FormattedMessage id="modal.okgaatillos.tillos" />
                    </Row>
                </div>
                <Hovedknapp
                    className="okknapp"
                    mini
                    onClick={() => (window.location.href = getEnvironmentVariable('K9_LOS_URL'))}
                >
                    {intlHelper(intl, 'modal.okgaatillos.ok')}
                </Hovedknapp>
            </div>
        );
    }
}
export default injectIntl(OkGaaTilLosModal);
