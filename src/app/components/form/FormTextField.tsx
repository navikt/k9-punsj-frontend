import React from 'react';
import { useFormContext, FieldValues, RegisterOptions } from 'react-hook-form';
import { TextField } from '@navikt/ds-react';
import { FormTextFieldProps } from './types';

export function FormTextField<T extends FieldValues>({
    name,
    label,
    validate,
    required,
    className,
    disabled,
    onChange,
    type,
    inputMode,
    pattern,
    maxLength,
    autoComplete,
    readOnly,
    htmlSize,
}: FormTextFieldProps<T>) {
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
        <TextField
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
            type={type}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            autoComplete={autoComplete}
            readOnly={readOnly}
            htmlSize={htmlSize}
        />
    );
}
