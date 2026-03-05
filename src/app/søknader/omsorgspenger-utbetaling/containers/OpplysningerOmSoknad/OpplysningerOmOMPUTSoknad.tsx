import React from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import LegacyJaNeiIkkeRelevantRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeRelevantRadioGroupFormik';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';
import { IOMPUTSoknad } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

const OpplysningerOmOMPUTSoknad: React.FC = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    return (
        <>
            <Heading size="small">
                <FormattedMessage id="omsorgspenger.utbetaling.punchForm.header" />
            </Heading>

            <VerticalSpacer sixteenPx />

            <Box padding="4" borderWidth="1" borderRadius="small">
                <Alert variant="info" className="alert">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>

                <div className="input-row">
                    <Field name="mottattDato">
                        {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                            <NewDateInput
                                id="soknad-dato"
                                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                                errorMessage={meta.touched && meta.error}
                                value={field.value}
                                onChange={(value: string) => form.setFieldValue('mottattDato', value)}
                            />
                        )}
                    </Field>

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
                    <Alert size="small" variant="warning" className="mt-4">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </Box>
        </>
    );
};

export default OpplysningerOmOMPUTSoknad;
