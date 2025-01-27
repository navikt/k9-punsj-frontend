import React from 'react';
import { Select, SelectProps } from '@navikt/ds-react';
import { FormField } from './FormField';

interface FormSelectProps extends Omit<SelectProps, 'error'> {
    name: string;
    rules?: Record<string, any>;
    errorMessage?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ name, rules, errorMessage, children, ...props }) => (
    <FormField
        name={name}
        rules={rules}
        errorMessage={errorMessage}
        render={(field, error) => (
            <Select {...field} {...props} error={error}>
                {children}
            </Select>
        )}
    />
);
