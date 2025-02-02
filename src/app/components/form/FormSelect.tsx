import React from 'react';
import { useFormContext, FieldValues } from 'react-hook-form';
import { Select } from '@navikt/ds-react';
import { FormSelectProps } from './types';

export function FormSelect<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    readOnly,
    onChange,
    children,
    'data-testid': dataTestId,
}: FormSelectProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

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
            readOnly={readOnly}
            data-testid={dataTestId}
        >
            {children}
        </Select>
    );
}
