import React from 'react';
import { useFormContext, FieldValues } from 'react-hook-form';
import { TextField } from '@navikt/ds-react';
import { FormTextFieldProps } from './types';

export function FormTextField<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    type = 'text',
    inputMode,
    pattern,
    maxLength,
    autoComplete,
    readOnly,
    htmlSize,
    'data-testid': dataTestId,
    onChange,
}: FormTextFieldProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    const { ref, onChange: registerOnChange, ...rest } = register(name, rules);

    return (
        <TextField
            {...rest}
            ref={ref}
            size="small"
            label={label}
            className={className}
            error={errors[name]?.message as string}
            type={type}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            autoComplete={autoComplete}
            onChange={(e) => {
                registerOnChange(e);
                if (onChange) {
                    onChange(e);
                }
            }}
            disabled={disabled}
            readOnly={readOnly}
            htmlSize={htmlSize}
            data-testid={dataTestId}
        />
    );
}
