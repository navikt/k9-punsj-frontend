import React from 'react';

import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import { Box, Fieldset, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './opplysningerOmKorrigering.less';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    const { setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <Fieldset
            legend={<h3 className="korrigering-legend">{intlHelper(intl, 'skjema.opplysningeromkorrigering')}</h3>}
        >
            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel opplysningerOmKorrigering">
                <h4 className="opplysningerOmKorrigering__subHeading">Når tok arbeidsgiver kontakt?</h4>

                <div className="opplysningerOmKorrigering__fields">
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
        </Fieldset>
    );
};

export default OpplysningerOmKorrigering;
