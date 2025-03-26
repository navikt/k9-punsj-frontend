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
    const [inputValue, setInputValue] = useState(value || '');

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
        onDateChange: onDateChange,
        onValidate: (val) => {
            setIsInvalidDate(!val.isValidDate && (!noValidateTomtFelt || !val.isEmpty));
        },
        defaultSelected: value ? ISODateStringToUTCDate(value) : undefined,
    });

    const previous = usePrevious(value);

    useEffect(() => {
        if (previous !== value) {
            if (value) {
                const date = ISODateStringToUTCDate(value);
                if (date) {
                    const formattedDate = date.toLocaleDateString('nb-NO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                    setInputValue(formattedDate);
                } else {
                    setInputValue('');
                }
            } else {
                setInputValue('');
            }
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
        }
    }, [value, previous, setSelected]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };

    const onInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = evt.target.value ? InputDateStringToISODateString(evt.target.value) : '';

        if ((isoDateString || noValidateTomtFelt) && isoDateString !== INVALID_DATE_VALUE && isoDateString !== value) {
            onChange(isoDateString);
            if (onBlur) {
                onBlur(isoDateString);
            }
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
            >
                <DatePicker.Input
                    {...inputProps}
                    value={inputValue}
                    onChange={onInputChange}
                    hideLabel={hideLabel}
                    id={id}
                    label={label}
                    error={error}
                    disabled={inputDisabled || disabled}
                    onBlur={onInputBlur}
                    ref={inputRef}
                    data-testid={dataTestId || 'datePickerInput'}
                />
            </DatePicker>
        </div>
    );
};

export default NewDateInput;
