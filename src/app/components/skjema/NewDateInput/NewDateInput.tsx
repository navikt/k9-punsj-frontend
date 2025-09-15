import React, { useEffect, useState } from 'react';
import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import usePrevious from 'app/hooks/usePrevious';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date-utils/src/format';

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
}) => {
    const [firstOpen, setFirstOpen] = React.useState(true);
    const [isInvalidDate, setIsInvalidDate] = useState(false);

    const error = isInvalidDate ? 'Dato har ikke gyldig format' : errorMessage;

    const fromDateDefault = new Date().setFullYear(new Date().getFullYear() - 5);
    const toDateDefault = new Date().setFullYear(new Date().getFullYear() + 5);

    const onDateChange = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';
        if (isoDateString && isoDateString !== value) {
            onChange(isoDateString);
        }
        if (noValidateTomtFelt && isoDateString !== value) {
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        locale,
        defaultMonth,
        onDateChange: onDateChange,
        onValidate: (val) => {
            setIsInvalidDate(!val.isValidDate && (!noValidateTomtFelt || !val.isEmpty));
        },
    });

    const previous = usePrevious(value);

    useEffect(() => {
        if (previous !== value && firstOpen) {
            setFirstOpen(false);
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
        }
    }, [firstOpen, value, previous, setSelected]);

    const onInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = evt.target.value ? InputDateStringToISODateString(evt.target.value) : '';

        if (
            (isoDateString || noValidateTomtFelt) &&
            isoDateString !== INVALID_DATE_VALUE &&
            isISODateString(value) &&
            previous !== isoDateString &&
            !!onBlur
        ) {
            onBlur(isoDateString);
        }
    };

    const onSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        if (isoDateString !== value && !!onBlur) {
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
