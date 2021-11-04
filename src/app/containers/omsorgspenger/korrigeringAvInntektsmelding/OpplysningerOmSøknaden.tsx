import DateInput from 'app/components/skjema/DateInput';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps, useFormikContext } from 'formik';
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
                <h4 className="opplysningerOmSoknaden__subHeading">Når ble dokumentet mottatt?</h4>
                <div className="opplysningerOmSoknaden__fields">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden}.dato`}>
                        {({ field }: FieldProps) => (
                            <DateInput
                                value={field.value}
                                onChange={(dato) => {
                                    setFieldValue(field.name, dato);
                                }}
                                className="opplysningerOmSoknaden__dateInput"
                                label={intlHelper(intl, 'skjema.dato')}
                            />
                        )}
                    </Field>
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden}.klokkeslett`}>
                        {({ field }: FieldProps) => (
                            <Input
                                {...field}
                                type="time"
                                className="klokkeslett"
                                label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                            />
                        )}
                    </Field>
                </div>
            </Panel>
        </SkjemaGruppe>
    );
};

export default OpplysningerOmSøknaden;
