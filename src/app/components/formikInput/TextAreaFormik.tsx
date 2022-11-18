import React from 'react';
import { Textarea, TextareaProps, Button } from '@navikt/ds-react';
import { useField } from 'formik';

interface OwnProps extends Partial<TextareaProps> {
    label: string;
    name: string;
}

const TextAreaFormik = ({ label, name, ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return <Textarea label={label} error={meta.touched && meta.error} {...field} {...props} />;
};

export default TextAreaFormik;
