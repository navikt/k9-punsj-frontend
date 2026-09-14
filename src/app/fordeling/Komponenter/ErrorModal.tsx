import React from 'react';

import { Alert, Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { PunsjDialog } from 'app/components/PunsjDialog';

interface Props {
    onClose: () => void;
}

const ErrorModal: React.FC<Props> = ({ onClose }: Props) => {
    return (
        <PunsjDialog
            key="errorModal"
            onOpenChange={(open) => !open && onClose()}
            aria-label="errorModal"
            data-test-id="errorModal"
            open
        >
            <PunsjDialog.Body>
                <Alert variant="error" fullWidth inline>
                    <FormattedMessage id="modal.error.feil" />
                </Alert>
            </PunsjDialog.Body>

            <PunsjDialog.Footer>
                <Button size="small" onClick={onClose}>
                    <FormattedMessage id="modal.error.ok.btn" />
                </Button>
            </PunsjDialog.Footer>
        </PunsjDialog>
    );
};

export default ErrorModal;
