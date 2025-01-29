import React from 'react';
import { useFormContext, FieldValues, RegisterOptions } from 'react-hook-form';
import { Select } from '@navikt/ds-react';
import { FormSelectProps } from './types';

export function FormSelect<T extends FieldValues>({
    name,
    label,
    validate,
    required,
    className,
    disabled,
    onChange,
    children,
}: FormSelectProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const rules: RegisterOptions<T> = {
        required: required && (typeof required === 'string' ? required : 'Dette feltet er påkrevd'),
    };

    if (validate) {
        rules.validate = validate;
    }

    const { ref, onChange: registerOnChange, ...rest } = register(name, rules);

    return (
        <Select
            {...rest}
            ref={ref}
            size="small"
            label={label}
            className={className}
            error={errors[name]?.message as string}
            onChange={(e) => {
                registerOnChange(e);
                if (onChange) {
                    onChange();
                }
            }}
            disabled={disabled}
        >
            {children}
        </Select>
    );
}
