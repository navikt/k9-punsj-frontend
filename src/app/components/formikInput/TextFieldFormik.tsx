import { TextField, TextFieldProps } from '@navikt/ds-react';
import { useField } from 'formik';
import React from 'react';

export interface FormikTextFieldProps extends TextFieldProps {
    label: string;
    name: string;
    filterPattern?: RegExp;
}

const TextFieldFormik = ({ label, name, filterPattern, ...props }: FormikTextFieldProps) => {
    const [field, meta, helpers] = useField(name);
    return (
        <TextField
            label={label}
            error={meta.touched && meta.error}
            {...field}
            {...props}
            onChange={
                filterPattern ? (e) => helpers.setValue(e.target.value.replace(filterPattern, '')) : field.onChange
            }
        />
    );
};

export default TextFieldFormik;
