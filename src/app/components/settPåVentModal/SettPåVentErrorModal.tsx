import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Button, Modal } from '@navikt/ds-react';

import './settPåVentModal.less';

export interface Props {
    onClose: () => void;
}

const SettPåVentErrorModal: React.FC<Props> = ({ onClose }: Props) => (
    <Modal key="settpaaventerrormodal" onClose={onClose} aria-label="settpaaventerrormodal" open>
        <Modal.Body>
            <Alert variant="error" fullWidth inline>
                <FormattedMessage id="modal.settpaavent.feil" />
            </Alert>
        </Modal.Body>

        <Modal.Footer>
            <Button size="small" onClick={onClose} type="button">
                <FormattedMessage id="modal.settpaavent.ok" />
            </Button>
        </Modal.Footer>
    </Modal>
);

export default SettPåVentErrorModal;
