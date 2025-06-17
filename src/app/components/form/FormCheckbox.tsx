import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
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
        control,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    const error = errors[name];

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { value, onChange: onFieldChange, ref } }) => (
                <Checkbox
                    ref={ref}
                    checked={!!value}
                    onChange={(e) => {
                        onFieldChange(e.target.checked);
                        if (onChange) {
                            onChange();
                        }
                    }}
                    size={size}
                    error={!!error}
                    disabled={disabled}
                    data-testid={dataTestId}
                >
                    {label}
                    {error && <div className="navds-error-message navds-label">{String(error.message)}</div>}
                </Checkbox>
            )}
        />
    );
}
