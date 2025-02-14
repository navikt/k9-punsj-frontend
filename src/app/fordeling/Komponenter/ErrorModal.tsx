import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Button, Modal } from '@navikt/ds-react';

interface Props {
    onClose: () => void;
}

const ErrorModal: React.FC<Props> = ({ onClose }: Props) => {
    return (
        <Modal key="errorModal" onClose={onClose} aria-label="errorModal" data-test-id="errorModal" open>
            <Modal.Body>
                <Alert variant="error" fullWidth inline>
                    <FormattedMessage id="modal.error.feil" />
                </Alert>
            </Modal.Body>

            <Modal.Footer>
                <Button size="small" onClick={onClose}>
                    <FormattedMessage id="modal.error.ok.btn" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ErrorModal;
