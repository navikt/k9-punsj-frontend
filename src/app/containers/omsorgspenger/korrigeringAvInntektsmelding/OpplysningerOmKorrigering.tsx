import React from 'react';
import { Field, FieldProps } from 'formik';
import { useIntl } from 'react-intl';
import { Box, Fieldset, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

import './opplysningerOmKorrigering.less';

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
                            <DatoInputFormikNew
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
