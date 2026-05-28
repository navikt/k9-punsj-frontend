import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';

import DatovelgerControlled from 'app/components/skjema/Datovelger/DatovelgerControlled';

import { FormDateInputProps } from './types';

export function FormDateInput<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    size,
    hideLabel,
    description,
    defaultMonth,
    fromDate,
    toDate,
    disabledDates,
    'data-testid': dataTestId,
}: FormDateInputProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    return (
        <DatovelgerControlled
            label={label}
            description={description}
            className={className}
            disabled={disabled}
            disabledDates={disabledDates}
            inputRef={field.ref}
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={(value) => field.onChange(value)}
            onBlur={() => field.onBlur()}
            errorMessage={fieldState.error?.message}
            size={size}
            hideLabel={hideLabel}
            defaultMonth={defaultMonth}
            fromDate={fromDate}
            toDate={toDate}
            dataTestId={dataTestId}
        />
    );
}
