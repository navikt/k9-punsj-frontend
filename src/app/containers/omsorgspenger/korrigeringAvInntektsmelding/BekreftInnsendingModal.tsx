import React from 'react';
import { useIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';

import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import OMSKvittering from './OMSKvittering';
import './bekreftInnsendingModal.less';

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
                <Button size="small" className="bekreftInnsendingModal__knappVidere" onClick={() => handleVidere()}>
                    {intlHelper(intl, 'fordeling.knapp.videre')}
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    className="validertSoknadOppsummeringContainer_knappTilbake"
                    onClick={() => lukkModal()}
                >
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
        </div>
    );
};

export default BekreftInnsendingModal;
