import DateInput from 'app/components/skjema/DateInput';
import intlHelper from 'app/utils/intlUtils';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import Panel from 'nav-frontend-paneler';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './opplysningerOmSøknaden.less';

const OpplysningerOmSøknaden: React.FC = () => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <SkjemaGruppe
            legend={<h4 className="korrigering-legend">{intlHelper(intl, 'skjema.opplysningeromsoknad')}</h4>}
        >
            <Panel className="listepanel opplysningerOmSoknaden">
                <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden}.dato`}>
                    {({ field }: FieldProps) => (
                        <DateInput
                            value={field.value}
                            onChange={(dato) => {
                                setFieldValue(field.name, dato);
                            }}
                            className="dateInput"
                            label={intlHelper(intl, 'skjema.dato')}
                            errorMessage={
                                <ErrorMessage name={KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden} />
                            }
                        />
                    )}
                </Field>
                <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden}.klokkeslett`}>
                    {({ field }: FieldProps) => (
                        <Input
                            {...field}
                            type="time"
                            className="klokkeslett"
                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                        />
                    )}
                </Field>
            </Panel>
        </SkjemaGruppe>
    );
};

export default OpplysningerOmSøknaden;
