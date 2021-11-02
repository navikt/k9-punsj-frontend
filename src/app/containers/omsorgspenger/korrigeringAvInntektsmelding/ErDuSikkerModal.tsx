import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

interface IErDuSikkerModalProps {
    melding: string;
    extraInfo?: string;
    onSubmit: () => void;
    onClose: () => void;
    submitKnappText: string;
}

const ErDuSikkerModal = (props: WrappedComponentProps & IErDuSikkerModalProps) => {
    const { intl, melding, onSubmit, onClose, submitKnappText, extraInfo } = props;

    return (
        <div className="modal_content">
            {intlHelper(intl, melding)}
            <VerticalSpacer sixteenPx />
            {extraInfo && <div>{intlHelper(intl, extraInfo)}</div>}
            <div className="punch_mappemodal_knapperad">
                <Hovedknapp
                    mini
                    className="knapp1"
                    onClick={() => {
                        onSubmit();
                        onClose();
                    }}
                >
                    {intlHelper(intl, submitKnappText)}
                </Hovedknapp>
                <Knapp mini className="knapp2" onClick={() => onClose()}>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Knapp>
            </div>
        </div>
    );
};

export default injectIntl(ErDuSikkerModal);
