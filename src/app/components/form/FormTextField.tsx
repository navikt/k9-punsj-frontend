import React from 'react';
import { TextField, TextFieldProps } from '@navikt/ds-react';
import { FormField } from './FormField';

interface FormTextFieldProps extends Omit<TextFieldProps, 'error'> {
    name: string;
    rules?: Record<string, any>;
    errorMessage?: string;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({ name, rules, errorMessage, ...props }) => (
    <FormField
        name={name}
        rules={rules}
        errorMessage={errorMessage}
        render={(field, error) => <TextField {...field} {...props} error={error} />}
    />
);
