import React from 'react';
import { DateInputProps, DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { dateToISODateString, ISODateStringToUTCDate } from 'app/utils/date-utils/src/format';

export type DatovelgerProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className' | 'disabled'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        onChange: (value: string) => void;
        errorMessage?: React.ReactNode | string;
        selectedDay: string;
        inputDisabled?: boolean;
        onBlur: () => void;
        value: string;
    };

const Datovelger = ({
    label,
    onChange,
    hideLabel,
    className,
    errorMessage,
    selectedDay,
    inputDisabled,
    disabled,
    onBlur,
    value,
    fromDate,
    toDate,
    defaultMonth,
    size = 'small',
    id,
}: DatovelgerProps) => {
    const fromDateDefault = new Date().setFullYear(new Date().getFullYear() - 5);
    const toDateDefault = new Date().setFullYear(new Date().getFullYear() + 5);

    const defaultSelected = selectedDay ? ISODateStringToUTCDate(selectedDay) : undefined;

    // kalles både når man velger en dato i kalender og når man skriver inn en dato
    const onDateChange = (date?: Date) => {
        // skal kunne være gyldig dato eller tom
        if (!date) {
            onChange('');
            return;
        }

        const isoDateString = dateToISODateString(date);
        if (isoDateString && isoDateString !== value) {
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps } = useDatepicker({
        defaultMonth,
        onDateChange: onDateChange,
        defaultSelected: defaultSelected,
    });

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                mode="single"
                inputDisabled={inputDisabled}
                disabled={disabled}
                onSelect={onBlur}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    label={label}
                    onBlur={(e) => {
                        onBlur();
                        inputProps.onBlur?.(e);
                    }}
                    error={errorMessage}
                    disabled={inputDisabled}
                    size={size}
                    id={id}
                />
            </DatePicker>
        </div>
    );
};

export default Datovelger;
