import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button } from '@navikt/ds-react';
import VerticalSpacer from './VerticalSpacer';

interface Props {
    melding: string;
    submitKnappText: string;

    onSubmit: () => void;
    onClose: () => void;

    extraInfo?: string;
}

const ErDuSikkerModal: React.FC<Props> = ({ melding, submitKnappText, onSubmit, onClose, extraInfo }: Props) => {
    return (
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
                    type="button"
                >
                    <FormattedMessage id={submitKnappText} />
                </Button>

                <Button variant="secondary" size="small" className="knapp2" onClick={() => onClose()}>
                    <FormattedMessage id={'skjema.knapp.avbryt'} />
                </Button>
            </div>
        </div>
    );
};

export default ErDuSikkerModal;
