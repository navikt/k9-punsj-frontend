import { Textarea, TextareaProps } from '@navikt/ds-react';
import { useField } from 'formik';
import React from 'react';

interface OwnProps extends Partial<TextareaProps> {
    label: string;
    name: string;
    customErrorMessage?: string;
}

const TextAreaFormik = ({ label, name, customErrorMessage, ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return (
        <Textarea
            label={label}
            error={meta.touched && meta.error ? customErrorMessage || meta.error : undefined}
            {...field}
            {...props}
        />
    );
};

export default TextAreaFormik;
