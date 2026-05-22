import React from 'react';

import { ErrorMessage, Field, FieldProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Fieldset, Heading, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import { KorrigeringAvInntektsmeldingFormFields } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { klokkeslettFieldId, mottattDatoFieldId } from '../formFieldIds';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    return (
        <Fieldset
            legend={
                <Heading level="3" size="small">
                    <FormattedMessage id="skjema.opplysningeromkorrigering" />
                </Heading>
            }
            className="korrigering__seksjon"
        >
            <Box
                borderRadius="8"
                background="neutral-soft"
                className="korrigering__panelsurface listepanel opplysningerOmKorrigeringPanel"
            >
                <Heading level="4" size="xsmall" className="mb-4">
                    <FormattedMessage id="skjema.opplysningeromkorrigering.spm" />
                </Heading>

                <div className="input-row">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field, meta }: FieldProps) => (
                            <DatoInputFormikNew
                                {...field}
                                id={mottattDatoFieldId}
                                label={intlHelper(intl, 'skjema.dato')}
                                error={meta.touched && meta.error}
                            />
                        )}
                    </Field>
                    <div className="ml-4">
                        <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}>
                            {({ field, meta }: FieldProps) => (
                                <TextField
                                    {...field}
                                    id={klokkeslettFieldId}
                                    type="time"
                                    label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
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
            </Box>
        </Fieldset>
    );
};

export default OpplysningerOmKorrigering;
