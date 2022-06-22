import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import { Field, FieldProps } from 'formik';
import { capitalize } from 'lodash';
import React from 'react';
import { Collapse } from 'react-collapse';

export default function VarigEndring() {
    return (
        <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.erVarigEndring">
            {({ field, form }: FieldProps<boolean>) => (
                <>
                    <RadioPanelGruppeFormik
                        legend="Har søker hatt en varig endring i noen av arbeidsforholdene, virksomhetene eller arbeidssituasjonen de siste fire årene?"
                        checked={field.value ? 'ja' : 'nei'}
                        name={field.name}
                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                    />
                    <Collapse isOpened={field.value}>
                        <DatoInputFormik
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringDato"
                            label="Dato for endringen"
                        />
                        <TextFieldFormik
                            size="small"
                            label="Årsinntekt etter endring"
                            name="values.opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringInntekt"
                        />
                        <TextAreaFormik
                            size="small"
                            label="Begrunnelse for endring"
                            name="values.opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringBegrunnelse"
                        />
                    </Collapse>
                </>
            )}
        </Field>
    );
}
