import React from 'react';

import { Field, FieldProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Heading, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import { KorrigeringAvInntektsmeldingFormFields } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    return (
        <>
            <div className="mb-4">
                <Heading level="3" size="small">
                    <FormattedMessage id="skjema.opplysningeromkorrigering" />
                </Heading>
            </div>

            <Box background="bg-subtle" padding="4" borderRadius="medium">
                <Heading level="4" size="xsmall">
                    <FormattedMessage id="skjema.opplysningeromkorrigering.spm" />
                </Heading>

                <div className="input-row">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field }: FieldProps) => (
                            <DatovelgerFormik {...field} label={intlHelper(intl, 'skjema.dato')} />
                        )}
                    </Field>
                    <div className="ml-4">
                        <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}>
                            {({ field }: FieldProps) => (
                                <TextField
                                    {...field}
                                    type="time"
                                    label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                                />
                            )}
                        </Field>
                    </div>
                </div>
            </Box>
        </>
    );
};

export default OpplysningerOmKorrigering;
