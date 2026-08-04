import React, { useEffect, useRef, useState } from 'react';
import { DateInputProps, DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date/dateFormat';
import { offsetDateByYears } from 'app/utils/date/dateUtils';

export type DatovelgerProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        value: string;
        onChange: (value: string) => void;
        onBlur?: (value: string) => void;
        errorMessage?: React.ReactNode | string | boolean;
        disabled?: boolean;
        disabledDates?: DatePickerProps['disabled'];
        inputRef?: React.Ref<HTMLInputElement>;
        dataTestId?: string;
        visFeilmelding?: boolean;
        errorAriaDescribedBy?: string;
        onErrorMessageChange?: (message?: string) => void;
    };

const Datovelger = ({
    label,
    description,
    onChange,
    hideLabel,
    className,
    errorMessage,
    onBlur,
    value,
    fromDate,
    toDate,
    defaultMonth,
    disabled,
    disabledDates,
    inputRef,
    dataTestId,
    visFeilmelding = true,
    errorAriaDescribedBy,
    onErrorMessageChange,
    size = 'medium',
    id,
}: DatovelgerProps) => {
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const [showLocalError, setShowLocalError] = useState(false);
    const previousValueRef = useRef<string | undefined>(undefined);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);

    const localErrorMessage = isInvalidDate && showLocalError ? 'Dato har ikke gyldig format' : undefined;
    const error = localErrorMessage
        ? visFeilmelding
            ? localErrorMessage
            : true
        : visFeilmelding
          ? errorMessage
          : !!errorMessage;

    const fromDateDefault = offsetDateByYears(new Date(), -5);
    const toDateDefault = offsetDateByYears(new Date(), 5);

    useEffect(() => {
        onErrorMessageChange?.(localErrorMessage);
    }, [localErrorMessage, onErrorMessageChange]);

    const onDateChange = (date?: Date) => {
        const hasSyncedExternalValue = previousValueRef.current !== undefined;
        const lastKnownValue = hasSyncedExternalValue ? previousValueRef.current : value;
        const isoDateString = date ? dateToISODateString(date) : '';
        const shouldPropagateDateChange =
            isoDateString !== lastKnownValue &&
            isoDateString !== lastPropagatedDateRef.current &&
            (isoDateString || hasSyncedExternalValue);

        if (shouldPropagateDateChange) {
            if (hasSyncedExternalValue) {
                isInternalUpdateRef.current = true;
            }

            lastPropagatedDateRef.current = isoDateString;
            previousValueRef.current = isoDateString;
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        defaultMonth,
        onDateChange,
        onValidate: (validation) => {
            setIsInvalidDate(!validation.isValidDate && !validation.isEmpty);
        },
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
            setShowLocalError(false);
            return;
        }

        if (previousValueRef.current !== value) {
            lastPropagatedDateRef.current = undefined;
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
            previousValueRef.current = value;
            setShowLocalError(false);
        }
    }, [value, setSelected]);

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
        const hasInvalidDate = isoDateString === INVALID_DATE_VALUE;

        setShowLocalError(hasInvalidDate);

        if (!hasInvalidDate) {
            if (isISODateString(isoDateString)) {
                setSelected(ISODateStringToUTCDate(isoDateString));
            } else {
                setSelected(undefined);
            }
        }

        if (isoDateString !== INVALID_DATE_VALUE && onBlur) {
            onBlur(isoDateString);
        }
    };

    const handleSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';
        setShowLocalError(false);
        if (isoDateString !== value && onBlur) {
            onBlur(isoDateString);
        }
    };

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                onSelect={handleSelect}
                mode="single"
                inputDisabled={disabled}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                disabled={disabledDates}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    id={id}
                    label={label}
                    description={description}
                    error={error}
                    disabled={disabled}
                    onBlur={handleInputBlur}
                    onChange={(event) => {
                        setShowLocalError(false);
                        inputProps.onChange?.(event);
                    }}
                    ref={inputRef}
                    data-testid={dataTestId || 'datePickerInput'}
                    size={size}
                    aria-describedby={errorAriaDescribedBy}
                />
            </DatePicker>
        </div>
    );
};

export default Datovelger;
