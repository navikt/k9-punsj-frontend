import React from 'react';
import { Textarea, TextareaProps } from '@navikt/ds-react';
import { FormField } from './FormField';

interface FormTextareaProps extends Omit<TextareaProps, 'error'> {
    name: string;
    rules?: Record<string, any>;
    errorMessage?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ name, rules, errorMessage, ...props }) => (
    <FormField
        name={name}
        rules={rules}
        errorMessage={errorMessage}
        render={(field, error) => <Textarea {...field} {...props} error={error} />}
    />
);
