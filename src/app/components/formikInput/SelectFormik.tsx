import { useField } from 'formik';
import React from 'react';

import { Select, SelectProps } from '@navikt/ds-react';

type Option = {
    label: string;
    value: string;
};

export interface FormikSelectProps extends Partial<SelectProps> {
    label: string;
    name: string;
    options: Option[];
    customError?: string;
}

const SelectFormik = ({ label, name, options, customError, ...props }: FormikSelectProps) => {
    const [field, meta] = useField(name);
    return (
        <Select label={label} error={meta.touched && meta.error ? meta.error : customError} {...field} {...props}>
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
