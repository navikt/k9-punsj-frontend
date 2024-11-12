import React from 'react';

import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Heading, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

import './opplysningerOmKorrigering.less';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    const { setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <>
            <Heading level={'3'} size="small">
                <FormattedMessage id={'skjema.opplysningeromkorrigering'} />
            </Heading>

            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel opplysningerOmKorrigering">
                <Heading level={'4'} size="xsmall" className="opplysningerOmKorrigering__subHeading">
                    <FormattedMessage id={'skjema.opplysningeromkorrigering.spm'} />
                </Heading>

                <div className="input-row">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field }: FieldProps) => (
                            <NewDateInput
                                value={field.value}
                                onChange={(dato) => {
                                    setFieldValue(field.name, dato);
                                }}
                                className="opplysningerOmKorrigering__dateInput"
                                label={intlHelper(intl, 'skjema.dato')}
                                errorMessage={
                                    <ErrorMessage
                                        name={KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}
                                    />
                                }
                            />
                        )}
                    </Field>

                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}>
                        {({ field }: FieldProps) => (
                            <TextField
                                {...field}
                                type="time"
                                className="klokkeslett"
                                label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                            />
                        )}
                    </Field>
                </div>
            </Box>
        </>
    );
};

export default OpplysningerOmKorrigering;
