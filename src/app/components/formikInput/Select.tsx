import React from 'react';
import { Select as NavSelect, SelectProps } from '@navikt/ds-react';
import { useField } from 'formik';

type Option = {
    label: string;
    value: string;
};

export interface FormikSelectProps extends Partial<SelectProps> {
    label: string;
    name: string;
    options: Option[];
}

const Select = ({ label, name, options, ...props }: FormikSelectProps) => {
    const [field, meta] = useField(name);
    return (
        <NavSelect label={label} error={meta.touched && meta.error} {...field} {...props}>
            {options.length ? options.map((option) => <option value={option.value}>{option.label}</option>) : null}
        </NavSelect>
    );
};

export default Select;
