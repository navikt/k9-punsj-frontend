import React from 'react';
import { TextField as NavTextField, TextFieldProps } from '@navikt/ds-react';
import { useField } from 'formik';

interface OwnProps extends TextFieldProps {
    label: string;
    name: string;
}

const TextField = ({ label, name, ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return <NavTextField label={label} error={meta.touched && meta.error} {...field} {...props} />;
};

export default TextField;
