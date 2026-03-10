import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, VStack } from '@navikt/ds-react';

import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import intlHelper from 'app/utils/intlUtils';
import DatoVelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';

const OpplysningerOmSoknad: React.FC = () => {
    const intl = useIntl();
    const [signert, setSignert] = useState<JaNeiIkkeRelevant | ''>('');
    return (
        <Box padding="4" borderWidth="1" borderRadius="large">
            <VStack gap="4">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                </Heading>
                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>
                <div className="input-row">
                    <DatoVelgerFormik name="mottattDato" label="Mottatt dato" />

                    <TextFieldFormik
                        label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                        name="klokkeslett"
                        className="klokkeslett"
                        size="small"
                        type="time"
                    />
                </div>
                <LegacyJaNeiIkkeRelevantRadioGroup
                    className="horizontalRadios"
                    name="signatur"
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    checked={signert || undefined}
                    onChange={(_, value) => {
                        setSignert(value);
                    }}
                />
                {signert === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};
export default OpplysningerOmSoknad;
