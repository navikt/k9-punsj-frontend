import React from 'react';
import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps } from 'formik';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { skjematyperOmsorgspengeutbetaling } from '../konstanter';

interface OwnProps {
    handleBlur: () => void;
}

const SkjematypeVelger = ({ handleBlur }: OwnProps) => {
    const intl = useIntl();
    return (
        <Field name="skjematype">
            {({ field }: FieldProps<string>) => (
                <RadioPanelGruppe
                    className="horizontalRadios"
                    radios={Object.values(skjematyperOmsorgspengeutbetaling).map((v) => ({
                        label: intlHelper(intl, v),
                        value: v,
                    }))}
                    name={field.name}
                    legend={intlHelper(intl, 'omsorgspenger.utbetaling.skjematyper.legend')}
                    checked={field.value}
                    onChange={(e) => {
                        field.onChange(e);
                        handleBlur();
                    }}
                />
            )}
        </Field>
    );
};

export default SkjematypeVelger;
