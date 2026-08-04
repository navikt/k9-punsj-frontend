import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Fieldset, Heading } from '@navikt/ds-react';

import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import EkspanderbartPanel from '../../../components/EkspanderbartPanel';
import { KorrigeringAvInntektsmeldingFormFields } from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { Periodepanel } from '../components/Periodepanel';

const TrekkPerioder: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();

    return (
        <EkspanderbartPanel
            label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.checkbox')}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
        >
            <Box
                padding="space-16"
                borderRadius="8"
                borderWidth="1"
                className="listepanel"
            >
                <Fieldset
                    legend={
                        <Heading size="small" level="3">
                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.legend" />
                        </Heading>
                    }
                    className="korrigering__skjemagruppe"
                >
                    <Alert size="small" variant="info" className="korrigering__infostripe">
                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.info" />
                    </Alert>

                    <div className="soknadsperiodecontainer">
                        <Periodepanel name={KorrigeringAvInntektsmeldingFormFields.Trekkperioder} />
                    </div>
                </Fieldset>
            </Box>
        </EkspanderbartPanel>
    );
};

export default TrekkPerioder;
