import React, { useEffect, useRef, useState } from 'react';
import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import usePrevious from 'app/hooks/usePrevious';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date/dateFormat';
import { offsetDateByYears } from 'app/utils/date/dateUtils';

import './newDateInput.css';

type Props = Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate' | 'disabled'> & {
    label: string;
    onChange: (value: string) => void;

    className?: string;
    description?: React.ReactNode;
    errorMessage?: React.ReactNode | string;
    id?: string;
    inputDisabled?: boolean;
    disabled?: boolean;
    noValidateTomtFelt?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    onBlur?: (value: string) => void;
    value?: string;
    fromDate?: Date;
    toDate?: Date;
    dataTestId?: string;
    hideLabel?: boolean;
    size?: 'small' | 'medium';
};

/**
 * @deprecated bruk DatovelgerControlled eller DatovelgerFormik i stedet
 */
const NewDateInput: React.FC<Props> = ({
    label,
    onChange,
    hideLabel,
    className,
    errorMessage,
    id,
    inputDisabled,
    disabled,
    noValidateTomtFelt = true,
    inputRef,
    locale,
    onBlur,
    value,
    fromDate,
    toDate,
    dataTestId,
    size,
    defaultMonth,
    description,
}) => {
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const previousValueRef = useRef<string | undefined>(undefined);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);

    const error = isInvalidDate ? 'Dato har ikke gyldig format' : errorMessage;

    const fromDateDefault = offsetDateByYears(new Date(), -5);
    const toDateDefault = offsetDateByYears(new Date(), 5);

    const onDateChange = (date?: Date) => {
        const hasSyncedExternalValue = previousValueRef.current !== undefined;
        const lastKnownValue = hasSyncedExternalValue ? previousValueRef.current : value;

        const isoDateString = date ? dateToISODateString(date) : '';
        const shouldPropagateDateChange =
            isoDateString !== lastKnownValue &&
            isoDateString !== lastPropagatedDateRef.current &&
            (isoDateString || (noValidateTomtFelt && hasSyncedExternalValue));

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
        locale,
        defaultMonth,
        onDateChange,
        onValidate: (validation) => {
            setIsInvalidDate(!validation.isValidDate && (!noValidateTomtFelt || !validation.isEmpty));
        },
    });

    const previous = usePrevious(value);

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
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
        }
    }, [value, setSelected]);

    const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
        const committedValue = previous ?? value ?? '';

        if (
            (isoDateString || noValidateTomtFelt) &&
            isoDateString !== INVALID_DATE_VALUE &&
            committedValue !== isoDateString &&
            onBlur
        ) {
            onBlur(isoDateString);
        }
    };

    const onSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        if (isoDateString !== value && onBlur) {
            onBlur(isoDateString);
        }
    };

    return (
        <div className={className || ''}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                onSelect={onSelect}
                mode="single"
                inputDisabled={inputDisabled || disabled}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    id={id}
                    label={label}
                    description={description}
                    error={error}
                    disabled={inputDisabled || disabled}
                    onBlur={onInputBlur}
                    ref={inputRef}
                    data-testid={dataTestId || 'datePickerInput'}
                    size={size}
                />
            </DatePicker>
        </div>
    );
};

export default NewDateInput;
