import React from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';
import LegacyJaNeiIkkeRelevantRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeRelevantRadioGroupFormik';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { IOMPUTSoknad } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

const OpplysningerOmOMPUTSoknad: React.FC = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
            <VStack gap="space-16">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.opplysningeromsoknad" />
                </Heading>

                <Alert size="small" variant="info">
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

                {!values.erKorrigering && (
                    <LegacyJaNeiIkkeRelevantRadioGroupFormik
                        legend={intlHelper(intl, 'ident.signatur.etikett')}
                        name="metadata.signatur"
                    />
                )}

                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};

export default OpplysningerOmOMPUTSoknad;
