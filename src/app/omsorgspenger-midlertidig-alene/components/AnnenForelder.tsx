import React from 'react';
import { IntlShape } from 'react-intl';
import { Field, FieldProps, FormikValues } from 'formik';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import './annenForelder.less';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    intl: IntlShape;
    handleBlur: (callback: () => void) => void;
};

const AnnenForelder = ({ intl, handleBlur }: OwnProps) => (
    <Panel border>
        <div className="annen-forelder-container">
            <Heading size="xsmall" spacing>
                Annen forelder
            </Heading>
            <VerticalSpacer twentyPx />

            <Field name="annenForelder.norskIdent">
                {({ field, meta }: FieldProps<string>) => (
                    <TextField
                        label="Identifikasjonsnummer"
                        size="small"
                        error={meta.touched && meta.error}
                        {...field}
                        onBlur={(e) => handleBlur(() => field.onBlur(e))}
                    />
                )}
            </Field>
            <VerticalSpacer twentyPx />
            <Field name="annenForelder.situasjonType">
                {({ field, meta }: FieldProps<string>) => (
                    <Select
                        size="small"
                        label="Hva er situasjonen til den andre forelderen?"
                        error={meta.touched && meta.error}
                        {...field}
                        onBlur={(e) => handleBlur(() => field.onBlur(e))}
                    >
                        <option value="">Velg situasjon</option>
                        {situasjonstyper.map((situasjonstype) => (
                            <option value={situasjonstype}>
                                {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`)}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>
            <VerticalSpacer twentyPx />
            <Field name="annenForelder.situasjonBeskrivelse">
                {({ field, meta }: FieldProps<string, FormikValues>) => (
                    <Textarea
                        size="small"
                        label="Beskrivelse av situasjonen"
                        error={meta.touched && meta.error}
                        {...field}
                        onBlur={(e) => handleBlur(() => field.onBlur(e))}
                    />
                )}
            </Field>
            <VerticalSpacer twentyPx />
            <Field name="annenForelder.periode">
                {({ form }: FieldProps) => (
                    <PeriodInput
                        intl={intl}
                        periode={form.values.annenForelder?.periode}
                        errorMessageFom={
                            form.touched?.annenForelder?.periode?.fom && form.errors?.annenForelder?.periode?.fom
                        }
                        errorMessageTom={
                            form.touched?.annenForelder?.periode?.tom && form.errors?.annenForelder?.periode?.tom
                        }
                        onBlur={() => {
                            const setTouched = () => {
                                form.setFieldTouched('annenForelder.periode.fom');
                                form.setFieldTouched('annenForelder.periode.tom');
                            };
                            return handleBlur(() => setTouched());
                        }}
                        onChange={(value) => form.setFieldValue('annenForelder.periode', value)}
                    />
                )}
            </Field>
        </div>
    </Panel>
);

export default AnnenForelder;
