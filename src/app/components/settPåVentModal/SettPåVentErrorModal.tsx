import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@navikt/ds-react';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';

import './settPåVentModal.less';

export interface Props {
    close: () => void;
}

const SettPaaVentErrorModal: React.FC<Props> = ({ close }: Props) => {
    return (
        <div className="sett-paa-vent-ok">
            <FeilCircleSvg title="check" />
            <div className="infoFeil">
                <FormattedMessage id={'modal.settpaavent.feil'} />
            </div>
            <Button variant="secondary" size="small" onClick={() => close()}>
                <FormattedMessage id={'modal.settpaavent.ok'} />
            </Button>
        </div>
    );
};

export default SettPaaVentErrorModal;
