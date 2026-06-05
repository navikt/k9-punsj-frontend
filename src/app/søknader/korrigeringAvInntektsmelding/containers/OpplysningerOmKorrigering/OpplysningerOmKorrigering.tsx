import React from 'react';

import { ErrorMessage, Field, FieldProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Heading, TextField, VStack } from '@navikt/ds-react';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import intlHelper from 'app/utils/intlUtils';
import { KorrigeringAvInntektsmeldingFormFields } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { klokkeslettFieldId, mottattDatoFieldId } from '../formFieldIds';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    return (
        <div className="korrigering__seksjon">
            <Box padding="space-16" borderWidth="1" borderRadius="8">
                <VStack gap="space-16">
                    <Heading level="3" size="small">
                        <FormattedMessage id="skjema.opplysningeromkorrigering" />
                    </Heading>

                    <Heading level="4" size="xsmall">
                        <FormattedMessage id="skjema.opplysningeromkorrigering.spm" />
                    </Heading>

                    <div className="input-row">
                        <DatovelgerFormik
                            id={mottattDatoFieldId}
                            label={intlHelper(intl, 'skjema.dato')}
                            name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}
                            size="medium"
                        />
                        <div className="ml-4">
                            <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}>
                                {({ field, meta }: FieldProps) => (
                                    <TextField
                                        {...field}
                                        id={klokkeslettFieldId}
                                        type="time"
                                        label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                                        size="medium"
                                        error={
                                            meta.touched &&
                                            meta.error && (
                                                <ErrorMessage
                                                    name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}
                                                />
                                            )
                                        }
                                    />
                                )}
                            </Field>
                        </div>
                    </div>
                </VStack>
            </Box>
        </div>
    );
};

export default OpplysningerOmKorrigering;
