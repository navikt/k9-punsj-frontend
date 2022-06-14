import React from 'react';
import { TextField, TextFieldProps } from '@navikt/ds-react';
import { useField } from 'formik';

interface OwnProps extends TextFieldProps {
    label: string;
    name: string;
}

const TextFieldFormik = ({ label, name, ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return <TextField label={label} error={meta.touched && meta.error} {...field} {...props} />;
};

export default TextFieldFormik;
