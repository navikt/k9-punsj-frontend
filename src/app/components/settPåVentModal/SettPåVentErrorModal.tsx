import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Modal } from '@navikt/ds-react';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';

import './settPåVentModal.less';

export interface Props {
    onClose: () => void;
}

const SettPåVentErrorModal: React.FC<Props> = ({ onClose }: Props) => (
    <Modal key="settpaaventerrormodal" onClose={onClose} aria-label="settpaaventokmodal" open>
        <Modal.Body>
            <div className="sett-paa-vent-ok">
                <FeilCircleSvg title="check" />

                <div className="infoFeil">
                    <FormattedMessage id={'modal.settpaavent.feil'} />
                </div>

                <Button variant="secondary" size="small" onClick={onClose}>
                    <FormattedMessage id={'modal.settpaavent.ok'} />
                </Button>
            </div>
        </Modal.Body>
    </Modal>
);

export default SettPåVentErrorModal;
