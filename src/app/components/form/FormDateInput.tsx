import React from 'react';
import { DatePicker } from '@navikt/ds-react';
import { FieldValues } from 'react-hook-form';

import { FormDateInputProps } from './types';
import { useFormDateInput } from './internal/useFormDateInput';

export function FormDateInput<T extends FieldValues>({
    name,
    label,
    validate,
    className,
    disabled,
    readOnly,
    size = 'medium',
    hideLabel,
    description,
    defaultMonth,
    fromDate,
    toDate,
    disabledDates,
    'data-testid': dataTestId,
}: FormDateInputProps<T>) {
    const {
        datepickerProps,
        inputProps,
        fieldRef,
        error,
        fromDateDefault,
        toDateDefault,
        handleInputBlur,
        handleInputChange,
        handleSelect,
    } = useFormDateInput({
        name,
        validate,
        defaultMonth,
        fromDate,
        toDate,
        disabledDates,
    });

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                mode="single"
                inputDisabled={disabled}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                disabled={disabledDates}
                onSelect={handleSelect}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    label={label}
                    description={description}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                    size={size}
                    ref={fieldRef}
                    data-testid={dataTestId || 'datePickerInput'}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                />
            </DatePicker>
        </div>
    );
}
