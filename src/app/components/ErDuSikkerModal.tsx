import React from 'react';

import { Button } from '@navikt/ds-react';
import { PunsjDialog } from 'app/components/PunsjDialog';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { FormattedMessage } from 'react-intl';

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
    <PunsjDialog
        key={modalKey}
        onOpenChange={(nextOpen) => !nextOpen && onClose()}
        aria-label={modalKey}
        open={open}
        data-testid="erdusikkermodal"
    >
        <PunsjDialog.Body>
            <FormattedMessage id={melding} />

            {extraInfo && (
                <div>
                    <VerticalSpacer sixteenPx />
                    <FormattedMessage id={extraInfo} />
                </div>
            )}
        </PunsjDialog.Body>

        <PunsjDialog.Footer>
            <Button
                size="small"
                onClick={() => {
                    onSubmit();
                    onClose();
                }}
                type="button"
            >
                <FormattedMessage id={submitKnappText} />
            </Button>

            <Button variant="secondary" size="small" onClick={() => onClose()} type="button">
                <FormattedMessage id="skjema.knapp.avbryt" />
            </Button>
        </PunsjDialog.Footer>
    </PunsjDialog>
);

export default ErDuSikkerModal;
