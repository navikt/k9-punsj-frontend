import { Field, FieldProps } from 'formik';
import { capitalize } from 'lodash';
import React from 'react';
import { useIntl } from 'react-intl';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { kunTall } from 'app/utils/patterns';

export default function VarigEndring() {
    const intl = useIntl();
    return (
        <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.erVarigEndring">
            {({ field, form }: FieldProps<boolean>) => (
                <>
                    <RadioPanelGruppeFormik
                        legend={intlHelper(intl, 'skjema.sn.varigendring')}
                        checked={field.value ? 'ja' : 'nei'}
                        name={field.name}
                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                    />
                    {field.value && (
                        <>
                            <VerticalSpacer twentyPx />
                            <DatoInputFormik
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringDato"
                                label={intlHelper(intl, 'skjema.sn.varigendringdato')}
                            />
                            <VerticalSpacer twentyPx />
                            <TextFieldFormik
                                size="small"
                                type="number"
                                label={intlHelper(intl, 'skjema.sn.endringinntekt')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringInntekt"
                                filterPattern={kunTall}
                            />
                            <VerticalSpacer twentyPx />
                            <TextAreaFormik
                                size="small"
                                label={intlHelper(intl, 'skjema.sn.endringbegrunnelse')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringBegrunnelse"
                            />
                        </>
                    )}
                </>
            )}
        </Field>
    );
}
