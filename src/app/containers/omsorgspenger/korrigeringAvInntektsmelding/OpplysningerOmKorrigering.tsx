import DateInput from 'app/components/skjema/DateInput';
import intlHelper from 'app/utils/intlUtils';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { Panel } from '@navikt/ds-react';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './opplysningerOmKorrigering.less';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <SkjemaGruppe
            legend={<h3 className="korrigering-legend">{intlHelper(intl, 'skjema.opplysningeromkorrigering')}</h3>}
        >
            <Panel className="listepanel opplysningerOmKorrigering">
                <h4 className="opplysningerOmKorrigering__subHeading">Når tok arbeidsgiver kontakt?</h4>
                <div className="opplysningerOmKorrigering__fields">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field }: FieldProps) => (
                            <DateInput
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

export default OpplysningerOmKorrigering;
