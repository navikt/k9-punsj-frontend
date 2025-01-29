import React from 'react';
import { useFormContext, FieldValues, RegisterOptions } from 'react-hook-form';
import { Checkbox } from '@navikt/ds-react';
import { FormCheckboxProps } from './types';

export function FormCheckbox<T extends FieldValues>({
    name,
    label,
    validate,
    required,
    disabled,
    onChange,
    size = 'small',
}: FormCheckboxProps<T>) {
    const { register } = useFormContext<T>();

    const rules: RegisterOptions<T> = {
        required: required && (typeof required === 'string' ? required : 'Dette feltet er påkrevd'),
    };

    if (validate) {
        rules.validate = validate;
    }

    const { ref, ...rest } = register(name, rules);

    return (
        <Checkbox
            {...rest}
            ref={ref}
            size={size}
            disabled={disabled}
            onChange={(e) => {
                rest.onChange(e);
                if (onChange) {
                    onChange();
                }
            }}
        >
            {label}
        </Checkbox>
    );
}
