import React from 'react';

import { Field, FieldProps } from 'formik';
import { useIntl } from 'react-intl';
import VerticalSpacer from 'app/components/VerticalSpacer';
import LegacyJaNeiRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiRadioGroupFormik';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { kunTall } from 'app/utils/patterns';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

const VarigEndring: React.FC = () => {
    const intl = useIntl();

    return (
        <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.erVarigEndring">
            {({ field, form }: FieldProps<boolean>) => (
                <>
                    <LegacyJaNeiRadioGroupFormik
                        legend={intlHelper(intl, 'skjema.sn.varigendring')}
                        checked={field.value ? JaNei.JA : JaNei.NEI}
                        name={field.name}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                    />

                    {field.value && (
                        <>
                            <VerticalSpacer twentyPx />

                            <DatoInputFormikNew
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
};

export default VarigEndring;
