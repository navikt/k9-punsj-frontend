import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { FormDatePickerProps } from './types';

export function FormDatePicker<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    readOnly,
    maxDate,
    minDate,
    'data-testid': dataTestId,
    onChange,
    dropdownCaption,
}: FormDatePickerProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field }) => {
                const valueAsDate = field.value ? new Date(`${field.value}T00:00:00`) : undefined;

                const { datepickerProps, inputProps } = useDatepicker({
                    fromDate: minDate || new Date('2000-01-01'),
                    toDate: maxDate || new Date(new Date().getFullYear() + 5, 11, 31),
                    defaultSelected: valueAsDate,
                    onDateChange: (date) => {
                        const newDate = date ? date.toISOString().split('T')[0] : undefined;
                        field.onChange(newDate);
                        if (onChange) {
                            onChange(date);
                        }
                    },
                });

                return (
                    <DatePicker {...datepickerProps} dropdownCaption={dropdownCaption}>
                        <DatePicker.Input
                            {...inputProps}
                            label={label}
                            className={className}
                            data-testid={dataTestId}
                            error={errors[name]?.message as string}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </DatePicker>
                );
            }}
        />
    );
}
