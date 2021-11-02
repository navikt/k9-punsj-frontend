import { submitOMSSoknad } from 'app/state/actions/OMSPunchFormActions';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import OMSKvittering from './OMSKvittering';

interface BekreftInnsendingModalProps {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
    søkerId: string;
    søknadId: string;
    lukkModal: () => void;
}

const BekreftInnsendingModal: React.FC<BekreftInnsendingModalProps> = ({
    feltverdier,
    søknadId,
    søkerId,
    lukkModal,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = () => {
        setIsLoading(true);
        submitOMSSoknad(søkerId, søknadId, (response, responseData) => {
            switch (response.status) {
                case 202: {
                    setIsLoading(false);
                    lukkModal();
                    break;
                }
                case 400: {
                    console.log('400');
                    break;
                }
                case 409: {
                    console.log('409');
                    break;
                }
                default: {
                    console.log('default??');
                }
            }
        });
    };

    return (
        <div className="bekreftInnsendingModal">
            <OMSKvittering feltverdier={feltverdier} />
            <div className="korrigering__buttonContainer">
                <Hovedknapp className="korrigering__submitButton" onClick={handleButtonClick} disabled={isLoading}>
                    Send inn
                </Hovedknapp>
                <Knapp onClick={() => lukkModal()}>Avbryt</Knapp>
            </div>
        </div>
    );
};

export default BekreftInnsendingModal;
