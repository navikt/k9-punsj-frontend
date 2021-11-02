import intlHelper from 'app/utils/intlUtils';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { useIntl } from 'react-intl';
import './bekreftInnsendingModal.less';
import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import OMSKvittering from './OMSKvittering';

interface BekreftInnsendingModalProps {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
    lukkModal: () => void;
    handleVidere: () => void;
}

const BekreftInnsendingModal: React.FC<BekreftInnsendingModalProps> = ({ feltverdier, lukkModal, handleVidere }) => {
    const intl = useIntl();

    return (
        <div className="bekreftInnsendingModal">
            <OMSKvittering feltverdier={feltverdier} />
            <div className="bekreftInnsendingModal__buttonContainer">
                <Hovedknapp mini className="bekreftInnsendingModal__knappVidere" onClick={() => handleVidere()}>
                    {intlHelper(intl, 'fordeling.knapp.videre')}
                </Hovedknapp>
                <Knapp mini className="validertSoknadOppsummeringContainer_knappTilbake" onClick={() => lukkModal()}>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Knapp>
            </div>
        </div>
    );
};

export default BekreftInnsendingModal;
