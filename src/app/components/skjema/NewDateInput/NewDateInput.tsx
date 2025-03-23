import React, { useEffect, useState } from 'react';
import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import usePrevious from 'app/hooks/usePrevious';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
    prettifyDateString,
} from 'app/utils/date-utils/src/format';

import './newDateInput.less';

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
    noValidateTomtFelt,
    inputRef,
    locale,
    onBlur,
    value,
    fromDate,
    toDate,
    dataTestId,
}) => {
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const [inputValue, setInputValue] = useState(value ? prettifyDateString(value) : '');

    const error = isInvalidDate ? 'Dato har ikke gyldig format' : errorMessage;

    const fromDateDefault = new Date().setFullYear(new Date().getFullYear() - 5);
    const toDateDefault = new Date().setFullYear(new Date().getFullYear() + 5);

    const onDateChange = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        setInputValue(isoDateString ? prettifyDateString(isoDateString) : '');
        onChange(isoDateString);
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        locale,
        onDateChange: onDateChange,
        onValidate: (val) => {
            setIsInvalidDate(!val.isValidDate && (!noValidateTomtFelt || !val.isEmpty));
        },
    });

    const previous = usePrevious(value);

    useEffect(() => {
        if (previous !== value) {
            setInputValue(value ? prettifyDateString(value) : '');
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
        }
    }, [value, previous, setSelected]);

    const onInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = evt.target.value ? InputDateStringToISODateString(evt.target.value) : '';

        setInputValue(evt.target.value);

        if (isoDateString && isoDateString !== INVALID_DATE_VALUE) {
            onChange(isoDateString);
            if (onBlur) {
                onBlur(isoDateString);
            }
        }
    };

    const onSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        setInputValue(isoDateString ? prettifyDateString(isoDateString) : '');

        if (isoDateString) {
            onChange(isoDateString);
            if (onBlur) {
                onBlur(isoDateString);
            }
        }
    };

    const onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = evt.target.value;
        setInputValue(newValue);

        const isoDateString = newValue ? InputDateStringToISODateString(newValue) : '';
        if (isoDateString && isoDateString !== INVALID_DATE_VALUE) {
            onChange(isoDateString);
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
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    id={id}
                    label={label}
                    error={error}
                    disabled={inputDisabled || disabled}
                    onBlur={onInputBlur}
                    onChange={onInputChange}
                    ref={inputRef}
                    data-testid={dataTestId || 'datePickerInput'}
                    value={inputValue}
                />
            </DatePicker>
        </div>
    );
};

export default NewDateInput;
