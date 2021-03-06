import * as React from "react";
import {injectIntl, WrappedComponentProps} from "react-intl";
import intlHelper from "../../utils/intlUtils";

import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import VerticalSpacer from "../../components/VerticalSpacer";


interface IErDuSikkerModalProps {
    melding: string;
    extraInfo?: string;
    onSubmit: () => void;
    onClose: () => void;
    submitKnappText: string;
}

class ErDuSikkerModal extends React.Component<WrappedComponentProps & IErDuSikkerModalProps> {

    render() {
        const {intl, melding, onSubmit, onClose, submitKnappText, extraInfo} = this.props;

        return (
            <div className="modal_content">
                {intlHelper(intl, melding)}
                <VerticalSpacer sixteenPx={true}/>
                {extraInfo && <div>{intlHelper(intl, extraInfo)}</div>}
                <div className="punch_mappemodal_knapperad">
                    <Hovedknapp mini={true} className="knapp1" onClick={() => {
                        onSubmit();
                        onClose();
                    }}>
                        {intlHelper(intl, submitKnappText)}
                    </Hovedknapp>
                    <Knapp mini={true} className="knapp2" onClick={() => onClose()}>
                        {intlHelper(intl, 'skjema.knapp.avbryt')}
                    </Knapp>
                </div>
            </div>
        );
    }
}

export default injectIntl(ErDuSikkerModal);
