import React, { useRef } from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { DatePicker, useDatepicker } from '@navikt/ds-react';
import dayjs from 'dayjs';
import { FormDatePickerProps } from './types';

// Helper for deeply nested properties
const get = (obj: any, path: string) =>
    path
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')
        .reduce((acc, part) => acc && acc[part], obj);

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

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field }) => {
                const valueAsDate = field.value ? dayjs(field.value).toDate() : undefined;
                const error = get(errors, name);

                const { datepickerProps, inputProps } = useDatepicker({
                    fromDate: minDate || new Date('2000-01-01'),
                    toDate: maxDate || new Date(new Date().getFullYear() + 5, 11, 31),
                    defaultSelected: valueAsDate,
                    onDateChange: (date) => {
                        if (date) {
                            const newDate = dayjs(date).format('YYYY-MM-DD');
                            field.onChange(newDate);
                        } else {
                            field.onChange(inputRef.current?.value);
                        }

                        if (onChange) {
                            onChange(date);
                        }
                    },
                });

                return (
                    <DatePicker {...datepickerProps} dropdownCaption={dropdownCaption}>
                        <DatePicker.Input
                            {...inputProps}
                            ref={inputRef}
                            label={label}
                            className={className}
                            data-testid={dataTestId}
                            error={error?.message as string}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </DatePicker>
                );
            }}
        />
    );
}
