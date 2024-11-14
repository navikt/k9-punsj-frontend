import React from 'react';

import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Button } from '@navikt/ds-react';

import { KorrigeringAvInntektsmeldingFormValues } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import OMSKvittering from '../SøknadKvittering/OMSKvittering';

import './bekreftInnsendingModal.less';

interface Props {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
    lukkModal: () => void;
    handleVidere: () => void;
}

const BekreftInnsendingModal: React.FC<Props> = ({ feltverdier, lukkModal, handleVidere }) => {
    return (
        <div className="bekreftInnsendingModal">
            <div className={classNames('validertSoknadOppsummeringContainer')}>
                <OMSKvittering feltverdier={feltverdier} />
            </div>

            <div className="bekreftInnsendingModal__buttonContainer">
                <Button size="small" className="bekreftInnsendingModal__knappVidere" onClick={() => handleVidere()}>
                    <FormattedMessage id="fordeling.knapp.videre" />
                </Button>

                <Button
                    variant="secondary"
                    size="small"
                    className="validertSoknadOppsummeringContainer_knappTilbake"
                    onClick={() => lukkModal()}
                >
                    <FormattedMessage id="skjema.knapp.avbryt" />
                </Button>
            </div>
        </div>
    );
};

export default BekreftInnsendingModal;
