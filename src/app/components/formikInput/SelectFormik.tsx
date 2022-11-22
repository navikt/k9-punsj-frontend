import React from 'react';
import { Select, SelectProps } from '@navikt/ds-react';
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

const SelectFormik = ({ label, name, options, ...props }: FormikSelectProps) => {
    const [field, meta] = useField(name);
    return (
        <Select label={label} error={meta.touched && meta.error} {...field} {...props}>
            {options.length
                ? options.map((option) => (
                      <option key={option.value} value={option.value}>
                          {option.label}
                      </option>
                  ))
                : null}
        </Select>
    );
};

export default SelectFormik;
