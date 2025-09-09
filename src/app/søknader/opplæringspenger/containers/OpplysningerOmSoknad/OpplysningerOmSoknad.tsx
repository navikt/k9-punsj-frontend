import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, HStack, Radio, RadioGroup, VStack } from '@navikt/ds-react';

import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import intlHelper from 'app/utils/intlUtils';

const OpplysningerOmSoknad: React.FC = () => {
    const intl = useIntl();

    const [signert, setSignert] = useState<JaNeiIkkeRelevant | ''>('');

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <VStack gap="4">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                </Heading>

                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>

                <div className="input-row">
                    <DatoInputFormikNew
                        size="small"
                        label={intlHelper(intl, 'skjema.mottakelsesdato')}
                        name="mottattDato"
                    />

                    <TextFieldFormik
                        label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                        name="klokkeslett"
                        className="klokkeslett"
                        size="small"
                        type="time"
                    />
                </div>

                <RadioGroup
                    size="small"
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    value={signert}
                    onChange={(value) => {
                        setSignert(value as JaNeiIkkeRelevant);
                    }}
                >
                    <HStack gap="2" className="flex">
                        {Object.values(JaNeiIkkeRelevant).map((jn) => (
                            <Box
                                key={jn}
                                paddingInline="2"
                                paddingBlock="1"
                                borderWidth="1"
                                borderRadius="large"
                                borderColor="border-subtle"
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                    setSignert(jn);
                                }}
                            >
                                <Radio name="signatur" value={jn}>
                                    {intlHelper(intl, jn)}
                                </Radio>
                            </Box>
                        ))}
                    </HStack>
                </RadioGroup>

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
