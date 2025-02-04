import React from 'react';
import { useFormContext, FieldValues } from 'react-hook-form';
import { Checkbox } from '@navikt/ds-react';
import { FormFieldProps } from './types';

export function FormCheckbox<T extends FieldValues>({
    name,
    label,
    validate,
    disabled,
    size,
    'data-testid': dataTestId,
    onChange,
}: FormFieldProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    const { ref, onChange: registerOnChange, ...rest } = register(name, rules);
    const error = errors[name];

    return (
        <Checkbox
            {...rest}
            ref={ref}
            size={size}
            error={!!error}
            description={error?.message as string}
            onChange={(e) => {
                registerOnChange(e);
                if (onChange) {
                    onChange();
                }
            }}
            disabled={disabled}
            data-testid={dataTestId}
        >
            {label}
        </Checkbox>
    );
}
