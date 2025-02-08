import React from 'react';
import { useFormContext, FieldValues } from 'react-hook-form';
import { Textarea } from '@navikt/ds-react';
import { FormTextareaProps } from './types';

export function FormTextarea<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    readOnly,
    maxLength,
    size,
    onChange,
    'data-testid': dataTestId,
}: FormTextareaProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    const { ref, onChange: registerOnChange, ...rest } = register(name, rules);

    return (
        <Textarea
            {...rest}
            ref={ref}
            size={size}
            label={label}
            className={className}
            error={errors[name]?.message as string}
            onChange={(e) => {
                registerOnChange(e);
                if (onChange) {
                    onChange(e);
                }
            }}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            data-testid={dataTestId}
        />
    );
}
