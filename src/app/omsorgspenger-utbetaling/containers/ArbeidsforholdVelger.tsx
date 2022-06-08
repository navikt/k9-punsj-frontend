import React from 'react';
import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps, useField } from 'formik';
import { CheckboxGroup, Panel } from '@navikt/ds-react';
import Checkbox from 'app/components/formikInput/Checkbox';

interface OwnProps {
    handleBlur: () => void;
}

const ArbeidsforholdVelger = ({ handleBlur }: OwnProps) => {
    const intl = useIntl();
    const [field, meta] = useField('arbeidsforhold');
    return (
        <Panel border>
            <CheckboxGroup legend="Arbeidsforhold" error={meta.touched && meta.error}>
                <Checkbox name="arbeidsforhold.arbeidstaker">Arbeidstaker</Checkbox>
                <Checkbox name="arbeidsforhold.selvstendigNæringsdrivende">Selvstendig næringsdrivende</Checkbox>
                <Checkbox name="arbeidsforhold.frilanser">Frilanser</Checkbox>
            </CheckboxGroup>
        </Panel>
    );
};

export default ArbeidsforholdVelger;
