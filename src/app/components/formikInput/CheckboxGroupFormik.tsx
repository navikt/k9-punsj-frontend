import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { useField } from 'formik';
import React from 'react';

interface Checkbox {
    value: string;
    label: string;
}

interface CheckboxGroupFormikProps {
    name: string;
    legend: string;
    checkboxes: Checkbox[];
    hideLegend?: boolean;
}

const CheckboxGroupFormik = ({ name, legend, checkboxes, hideLegend }: CheckboxGroupFormikProps) => {
    const [, meta, helpers] = useField({ name });
    return (
        <CheckboxGroup
            legend={legend}
            onChange={(v) => helpers.setValue(v)}
            error={meta.error ?? null}
            hideLegend={hideLegend}
            size="small"
        >
            {checkboxes.map((checkbox) => (
                <Checkbox key={checkbox.value} value={checkbox.value}>
                    {checkbox.label}
                </Checkbox>
            ))}
        </CheckboxGroup>
    );
};

export default CheckboxGroupFormik;
