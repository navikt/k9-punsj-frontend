import React from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';

import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import LegacyJaNeiIkkeRelevantRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeRelevantRadioGroupFormik';
import { IOMPAOSoknad } from 'app/søknader/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknad';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

const OpplysningerOmOMPAOSoknad: React.FunctionComponent = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPAOSoknad>();

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
            <VStack gap="space-16">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                </Heading>
                <Alert variant="info" className="alert">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>
                <div className="input-row">
                    <DatoInputFormikNew id="soknad-dato" label={intlHelper(intl, 'skjema.mottakelsesdato')} name="mottattDato" />

                    <div className="ml-4">
                        <Field name="klokkeslett">
                            {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                                <TextField
                                    id="klokkeslett"
                                    type="time"
                                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                    error={meta.touched && meta.error}
                                    {...field}
                                    onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                />
                            )}
                        </Field>
                    </div>
                </div>
                <LegacyJaNeiIkkeRelevantRadioGroupFormik
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    name="metadata.signatur"
                />
                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};
export default OpplysningerOmOMPAOSoknad;
