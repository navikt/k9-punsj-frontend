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
    <Modal
        key={modalKey}
        onClose={onClose}
        aria-label={modalKey}
        open={open}
        className="modalContainer"
        data-testid="erdusikkermodal"
    >
        <Modal.Body>
            <div className="modal_content">
                <FormattedMessage id={melding} />

                <VerticalSpacer sixteenPx />

                {extraInfo && (
                    <div>
                        <FormattedMessage id={extraInfo} />
                    </div>
                )}

                <div className="punch_mappemodal_knapperad">
                    <Button
                        size="small"
                        className="knapp1"
                        onClick={() => {
                            onSubmit();
                            onClose();
                        }}
                    >
                        <FormattedMessage id={submitKnappText} />
                    </Button>

                    <Button variant="secondary" size="small" className="knapp2" onClick={() => onClose()}>
                        <FormattedMessage id="skjema.knapp.avbryt" />
                    </Button>
                </div>
            </div>
        </Modal.Body>
    </Modal>
);

export default ErDuSikkerModal;
