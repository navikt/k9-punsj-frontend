import React, { useEffect, useRef } from 'react';
import { DateInputProps, DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { dateToISODateString, ISODateStringToUTCDate, isISODateString } from 'app/utils/date/dateFormat';

export type DatovelgerControlledProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        onChange: (value: string) => void;
        errorMessage?: React.ReactNode | string;
        selectedDay: string;
        disabled?: boolean;
        onBlur: () => void;
        value: string;
    };

const DatovelgerControlled = ({
    label,
    onChange,
    hideLabel,
    className,
    errorMessage,
    selectedDay,
    disabled,
    onBlur,
    value,
    fromDate,
    toDate,
    defaultMonth,
    size = 'small',
    id,
}: DatovelgerControlledProps) => {
    const fromDateDefault = new Date().setFullYear(new Date().getFullYear() - 5);
    const toDateDefault = new Date().setFullYear(new Date().getFullYear() + 5);

    const defaultSelected = selectedDay ? ISODateStringToUTCDate(selectedDay) : undefined;

    const previousValueRef = useRef<string>(value);
    const isInternalUpdateRef = useRef(false);

    // kalles både når man velger en dato i kalender og når man skriver inn en dato
    const onDateChange = (date?: Date) => {
        // Marker at endringen kommer fra intern brukerinteraksjon
        isInternalUpdateRef.current = true;

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

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        defaultMonth,
        onDateChange: onDateChange,
        defaultSelected: defaultSelected,
    });

    // Synkroniser intern tilstand med value prop når den endres fra utsiden
    useEffect(() => {
        // Hopp over hvis endringen kom fra intern brukerinteraksjon
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
            return;
        }

        // Oppdater bare hvis verdien faktisk endret seg fra utsiden
        if (previousValueRef.current !== value) {
            if (value && isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else if (!value) {
                setSelected(undefined);
            }
            previousValueRef.current = value;
        }
    }, [value, setSelected]);

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                mode="single"
                inputDisabled={disabled}
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
                    disabled={disabled}
                    size={size}
                    id={id}
                />
            </DatePicker>
        </div>
    );
};

export default DatovelgerControlled;

