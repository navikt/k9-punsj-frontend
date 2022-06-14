import React from 'react';
import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps, useField } from 'formik';
import { CheckboxGroup, Panel } from '@navikt/ds-react';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';

interface OwnProps {
    handleBlur: () => void;
}

const ArbeidsforholdVelger = ({ handleBlur }: OwnProps) => {
    const intl = useIntl();
    const [field, meta] = useField('arbeidsforhold');
    return (
        <Panel border>
            <CheckboxGroup legend="Arbeidsforhold" size="small" error={meta.touched && meta.error}>
                <CheckboxFormik name="arbeidsforhold.arbeidstaker">Arbeidstaker</CheckboxFormik>
                <CheckboxFormik name="arbeidsforhold.selvstendigNæringsdrivende">Selvstendig næringsdrivende</CheckboxFormik>
                <CheckboxFormik name="arbeidsforhold.frilanser">Frilanser</CheckboxFormik>
            </CheckboxGroup>
        </Panel>
    );
};

export default ArbeidsforholdVelger;
