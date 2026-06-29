import React, { useEffect, useRef, useState } from 'react';
import { DateInputProps, DatePicker, DatePickerProps, DateValidationT, useDatepicker } from '@navikt/ds-react';

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
        showExternalErrorAfterSubmit?: boolean;
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
    showExternalErrorAfterSubmit = false,
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
    const [showValidationError, setShowValidationError] = useState(false);
    const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
    const [validationState, setValidationState] = useState<DateValidationT | undefined>(undefined);
    const validationStateRef = useRef<DateValidationT | undefined>(undefined);
    const inputValueRef = useRef<string>('');
    const previousValueRef = useRef<string>(value);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);
    const lastCommittedDateRef = useRef<string | undefined>(value);

    const fromDateDefault = offsetDateByYears(new Date(), -5);
    const toDateDefault = offsetDateByYears(new Date(), 5);
    const defaultSelected = isISODateString(value) ? ISODateStringToUTCDate(value) : undefined;
    const getValidationMessage = (validation?: DateValidationT) => {
        if (!validation || validation.isEmpty || validation.isValidDate) {
            return undefined;
        }

        if (validation.isBefore || validation.isAfter || validation.isDisabled || validation.isWeekend) {
            return 'Datoen er ikke tillatt';
        }

        return validation.isInvalid ? 'Dato har ikke gyldig format' : undefined;
    };

    const inlineValidationMessage = showValidationError ? getValidationMessage(validationState) : undefined;
    const externalErrorMessage = showExternalErrorAfterSubmit || hasBeenBlurred ? errorMessage : undefined;
    const error = inlineValidationMessage || externalErrorMessage;
    const inputError = renderInlineErrorMessage ? error : !!error;

    useEffect(() => {
        onInlineValidationMessageChange?.(inlineValidationMessage);
    }, [inlineValidationMessage, onInlineValidationMessageChange]);

    const commitValue = (nextValue: string | typeof INVALID_DATE_VALUE) => {
        if (!onCommit) {
            return;
        }

        if (nextValue === INVALID_DATE_VALUE || getValidationMessage(validationStateRef.current)) {
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
        const shouldPropagateEmptyValue = inputValueRef.current === '';

        if (!isoDateString && !shouldPropagateEmptyValue) {
            return;
        }

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
        fromDate,
        toDate,
        disabled: disabledDates,
        onDateChange,
        onValidate: (validation) => {
            validationStateRef.current = validation;
            setValidationState(validation);

            if (validation.isValidDate || (noValidateTomtFelt && validation.isEmpty)) {
                setShowValidationError(false);
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

        inputValueRef.current = value;
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
                        setShowValidationError(false);
                        inputValueRef.current = event.target.value;
                        inputProps.onChange?.(event);
                    }}
                    onBlur={(event) => {
                        setHasBeenBlurred(true);
                        const nextValue = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
                        const validationMessage = getValidationMessage(validationStateRef.current);
                        setShowValidationError(
                            nextValue === INVALID_DATE_VALUE || !!validationMessage,
                        );
                        commitValue(nextValue);
                        inputProps.onBlur?.(event);
                    }}
                />
            </DatePicker>
        </div>
    );
};

export default DatovelgerBase;
