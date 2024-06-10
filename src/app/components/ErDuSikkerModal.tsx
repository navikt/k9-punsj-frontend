import React from 'react';
import { useIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

interface IErDuSikkerModalProps {
    melding: string;
    extraInfo?: string;
    onSubmit: () => void;
    onClose: () => void;
    submitKnappText: string;
}

const ErDuSikkerModal = (props: IErDuSikkerModalProps) => {
    const intl = useIntl();
    const { melding, onSubmit, onClose, submitKnappText, extraInfo } = props;

    return (
        <div className="modal_content">
            {intlHelper(intl, melding)}
            <VerticalSpacer sixteenPx />
            {extraInfo && <div>{intlHelper(intl, extraInfo)}</div>}
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
                    {intlHelper(intl, submitKnappText)}
                </Button>
                <Button variant="secondary" size="small" className="knapp2" onClick={() => onClose()}>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
        </div>
    );
};

export default ErDuSikkerModal;
