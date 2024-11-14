import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Fieldset } from '@navikt/ds-react';

import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import EkspanderbartPanel from '../../../components/EkspanderbartPanel';
import { KorrigeringAvInntektsmeldingFormFields } from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { Periodepanel } from '../components/Periodepanel';

const LeggTilHelePerioder: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();

    return (
        <EkspanderbartPanel
            label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.checkbox')}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
        >
            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel">
                <Fieldset
                    legend={
                        <h4 className="korrigering-legend">
                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.legend" />
                        </h4>
                    }
                    className="korrigering__skjemagruppe"
                >
                    <Alert size="small" variant="info" className="korrigering__infostripe">
                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.info" />
                    </Alert>

                    <div className="soknadsperiodecontainer">
                        <Periodepanel name={KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav} />
                    </div>
                </Fieldset>
            </Box>
        </EkspanderbartPanel>
    );
};

export default LeggTilHelePerioder;
