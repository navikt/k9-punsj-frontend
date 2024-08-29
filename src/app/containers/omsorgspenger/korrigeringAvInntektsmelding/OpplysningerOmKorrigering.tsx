import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Box, Fieldset, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
// import { DateInputNew } from 'app/components/skjema/DateInputNew';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './opplysningerOmKorrigering.less';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();
    // const { setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <Fieldset
            legend={<h3 className="korrigering-legend">{intlHelper(intl, 'skjema.opplysningeromkorrigering')}</h3>}
        >
            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel opplysningerOmKorrigering">
                <h4 className="opplysningerOmKorrigering__subHeading">Når tok arbeidsgiver kontakt?</h4>
                <div className="opplysningerOmKorrigering__fields">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field }: FieldProps) => (
                            <DatoInputFormik
                                {...field}
                                className="opplysningerOmKorrigering__dateInput"
                                label={intlHelper(intl, 'skjema.dato')}
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
