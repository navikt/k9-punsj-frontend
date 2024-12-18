import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Modal } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';

interface Props {
    melding: string;
    modalKey: string;
    open: boolean;
    submitKnappText: string;
    extraInfo?: string;

    onSubmit: () => void;
    onClose: () => void;
}

const ErDuSikkerModal = ({ melding, modalKey, open, onSubmit, onClose, submitKnappText, extraInfo }: Props) => (
    <Modal key={modalKey} onClose={onClose} aria-label={modalKey} open={open} data-testid="erdusikkermodal">
        <Modal.Body>
            <FormattedMessage id={melding} />

            {extraInfo && (
                <div>
                    <VerticalSpacer sixteenPx />
                    <FormattedMessage id={extraInfo} />
                </div>
            )}
        </Modal.Body>

        <Modal.Footer>
            <Button
                size="small"
                onClick={() => {
                    onSubmit();
                    onClose();
                }}
            >
                <FormattedMessage id={submitKnappText} />
            </Button>

            <Button variant="secondary" size="small" onClick={() => onClose()}>
                <FormattedMessage id="skjema.knapp.avbryt" />
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ErDuSikkerModal;
