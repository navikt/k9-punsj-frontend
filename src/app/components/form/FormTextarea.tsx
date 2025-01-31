import React from 'react';
import { useFormContext, FieldValues, RegisterOptions } from 'react-hook-form';
import { Textarea } from '@navikt/ds-react';
import { FormTextareaProps } from './types';

export function FormTextarea<T extends FieldValues>({
    name,
    label,
    validate,
    required,
    className,
    disabled,
    readOnly,
    onChange,
    maxLength,
}: FormTextareaProps<T>) {
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
        <Textarea
            {...rest}
            ref={ref}
            size="small"
            label={label}
            className={className}
            error={errors[name]?.message as string}
            onChange={(event) => {
                registerOnChange(event);
                if (onChange) {
                    onChange(event);
                }
            }}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
        />
    );
}
