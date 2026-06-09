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

export type DatovelgerBaseProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        value: string;
        onChange: (value: string) => void;
        onCommit?: (value: string) => void;
        errorMessage?: React.ReactNode | string | boolean;
        inputDisabled?: boolean;
        disabledDates?: DatePickerProps['disabled'];
        inputRef?: React.Ref<HTMLInputElement>;
        dataTestId?: string;
        noValidateTomtFelt?: boolean;
        renderInlineErrorMessage?: boolean;
        errorAriaDescribedBy?: string;
        onInlineValidationMessageChange?: (message?: string) => void;
    };

const DatovelgerBase = ({
    label,
    description,
    onChange,
    onCommit,
    hideLabel,
    className,
    errorMessage,
    value,
    fromDate,
    toDate,
    defaultMonth,
    inputDisabled,
    disabledDates,
    inputRef,
    dataTestId,
    noValidateTomtFelt = true,
    renderInlineErrorMessage = true,
    errorAriaDescribedBy,
    onInlineValidationMessageChange,
    size = 'medium',
    id,
}: DatovelgerBaseProps) => {
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const [showInvalidDateError, setShowInvalidDateError] = useState(false);
    const previousValueRef = useRef<string>(value);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);
    const lastCommittedDateRef = useRef<string | undefined>(value);

    const fromDateDefault = offsetDateByYears(new Date(), -5);
    const toDateDefault = offsetDateByYears(new Date(), 5);
    const defaultSelected = isISODateString(value) ? ISODateStringToUTCDate(value) : undefined;
    const inlineValidationMessage = showInvalidDateError && isInvalidDate ? 'Dato har ikke gyldig format' : undefined;
    const error = inlineValidationMessage || errorMessage;
    const inputError = renderInlineErrorMessage ? error : !!error;

    useEffect(() => {
        onInlineValidationMessageChange?.(inlineValidationMessage);
    }, [inlineValidationMessage, onInlineValidationMessageChange]);

    const commitValue = (nextValue: string | typeof INVALID_DATE_VALUE) => {
        if (!onCommit) {
            return;
        }

        if (nextValue === INVALID_DATE_VALUE) {
            return;
        }

        if (!nextValue && !noValidateTomtFelt) {
            return;
        }

        if (lastCommittedDateRef.current === nextValue) {
            return;
        }

        lastCommittedDateRef.current = nextValue;
        onCommit(nextValue);
    };

    const onDateChange = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        if (
            isoDateString !== value &&
            isoDateString !== lastPropagatedDateRef.current &&
            (isoDateString || noValidateTomtFelt)
        ) {
            isInternalUpdateRef.current = true;
            lastPropagatedDateRef.current = isoDateString;
            previousValueRef.current = isoDateString;
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        defaultMonth,
        defaultSelected,
        onDateChange,
        onValidate: (validation) => {
            const invalidDate = !validation.isValidDate && (!noValidateTomtFelt || !validation.isEmpty);
            setIsInvalidDate(invalidDate);

            if (!invalidDate) {
                setShowInvalidDateError(false);
            }
        },
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
        } else if (previousValueRef.current !== value) {
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
            previousValueRef.current = value;
            lastPropagatedDateRef.current = undefined;
            lastCommittedDateRef.current = value;
        }
    }, [setSelected, value]);

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                mode="single"
                inputDisabled={inputDisabled}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                disabled={disabledDates}
                onSelect={(date) => {
                    const isoDateString = date ? dateToISODateString(date) : '';
                    commitValue(isoDateString);
                }}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    label={label}
                    description={description}
                    error={inputError}
                    disabled={inputDisabled}
                    size={size}
                    id={id}
                    ref={inputRef}
                    data-testid={dataTestId || 'datePickerInput'}
                    aria-describedby={errorAriaDescribedBy}
                    onChange={(event) => {
                        setShowInvalidDateError(false);
                        inputProps.onChange?.(event);
                    }}
                    onBlur={(event) => {
                        const nextValue = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
                        setShowInvalidDateError(nextValue === INVALID_DATE_VALUE);
                        commitValue(nextValue);
                        inputProps.onBlur?.(event);
                    }}
                />
            </DatePicker>
        </div>
    );
};

export default DatovelgerBase;
