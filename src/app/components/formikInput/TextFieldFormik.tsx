import { useField } from 'formik';
import React from 'react';

import { TextField, TextFieldProps } from '@navikt/ds-react';

export interface FormikTextFieldProps extends TextFieldProps {
    label: string;
    name: string;
    filterPattern?: RegExp;
    customError?: string;
}

const TextFieldFormik = ({ label, name, filterPattern, customError, ...props }: FormikTextFieldProps) => {
    const [field, meta, helpers] = useField(name);
    return (
        <TextField
            label={label}
            error={meta.touched && meta.error ? meta.error : customError}
            {...field}
            {...props}
            onChange={
                filterPattern ? (e) => helpers.setValue(e.target.value.replace(filterPattern, '')) : field.onChange
            }
        />
    );
};

export default TextFieldFormik;
