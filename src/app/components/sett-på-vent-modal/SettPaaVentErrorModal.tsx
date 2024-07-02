import React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { Button } from '@navikt/ds-react';
import FeilCircleSvg from 'app/assets/SVG/FeilCircleSVG';
import intlHelper from 'app/utils/intlUtils';

import './settPaaVentModal.less';

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
