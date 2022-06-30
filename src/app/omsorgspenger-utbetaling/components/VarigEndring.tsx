import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNei } from 'app/models/enums';
import { kunTall } from 'app/utils/patterns';
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
                        <VerticalSpacer twentyPx />
                        <DatoInputFormik
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringDato"
                            label="Dato for endringen"
                        />
                        <VerticalSpacer twentyPx />
                        <TextFieldFormik
                            size="small"
                            type="number"
                            label="Årsinntekt etter endring"
                            name="values.opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringInntekt"
                            filterPattern={kunTall}
                        />
                        <VerticalSpacer twentyPx />
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
