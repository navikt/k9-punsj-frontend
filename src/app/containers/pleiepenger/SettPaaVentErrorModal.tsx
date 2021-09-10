import * as React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Knapp } from 'nav-frontend-knapper';
import intlHelper from '../../utils/intlUtils';

import './okGaaTilLosModal.less';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';

export interface ISettPaaVentErrorModalProps {
    close: () => void;
}

class SettPaaVentErrorModal extends React.Component<WrappedComponentProps & ISettPaaVentErrorModalProps> {
    render() {
        const { intl, close } = this.props;

        return (
            <div className="sett-paa-vent-ok">
                <FeilCircleSvg title="check" />
                <div className="infoFeil">{intlHelper(intl, 'modal.settpaavent.feil')}</div>
                <Knapp mini onClick={() => close()}>
                    {intlHelper(intl, 'modal.settpaavent.ok')}
                </Knapp>
            </div>
        );
    }
}
export default injectIntl(SettPaaVentErrorModal);
