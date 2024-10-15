import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

export interface ISettPaaVentErrorModalProps {
    close: () => void;
}

const SettPaaVentErrorModal = (props: WrappedComponentProps & ISettPaaVentErrorModalProps) => {
    const { intl, close } = props;

    return (
        <div className="sett-paa-vent-ok">
            <FeilCircleSvg title="check" />
            <div className="infoFeil">{intlHelper(intl, 'modal.settpaavent.feil')}</div>
            <Button variant="secondary" size="small" onClick={() => close()}>
                {intlHelper(intl, 'modal.settpaavent.ok')}
            </Button>
        </div>
    );
};

export default injectIntl(SettPaaVentErrorModal);
