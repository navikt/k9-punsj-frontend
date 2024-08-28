import React, { useState } from 'react';
import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    // ISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date-utils/src/format';

import dayjs from 'dayjs';

const isValidDate = (dateString: string) => dayjs(dateString, 'YYYY-MM-DD').isValid();

type Props = Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate'> & {
    label: string;
    errorMessage?: React.ReactNode | string;
    inputDisabled?: boolean;
    description?: React.ReactNode;
    value?: string;
    inputId?: string;
    inputRef?: React.Ref<HTMLInputElement>;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
};

export const DateInputNew: React.FC<Props> = ({
    value,
    onChange,
    onBlur,
    id,
    label,
    className,
    locale,
    inputDisabled,
    errorMessage,
    inputRef,
}) => {
    const [inputHasFocus, setInputHasFocus] = React.useState(false);
    const [hasError, setHasError] = useState(false);

    const onSelect = (date?: Date) => {
        console.log('Test onSelect date:', date);
        console.log('Test onSelect value:', value);
        const isoDateString = date ? dateToISODateString(date) : '';
        console.log('Test isoDateString:', isoDateString);
        if (isoDateString !== value) {
            onChange(isoDateString);
        }
    };

    const onDateChange = (date?: Date) => {
        console.log('Test onChange data:', date);
        if (inputHasFocus) {
            return;
        }
        const isoDateString = date ? dateToISODateString(date) : '';
        if (isoDateString !== value) {
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, selectedDay, setSelected } = useDatepicker({
        locale,
        defaultSelected: ISODateStringToUTCDate(value),
        onDateChange: onDateChange,
        onValidate: (val) => {
            setHasError(!val.isValidDate);
            console.info(val);
        },
    });

    const onInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        setInputHasFocus(false);
        if (inputProps.onBlur) {
            inputProps.onBlur(evt);
        }
        if (selectedDay === undefined && typeof inputProps.value === 'string') {
            if (isISODateString(inputProps.value)) {
                onChange(inputProps.value);
                return;
            }
            const isoDateString = InputDateStringToISODateString(inputProps.value);
            onChange(isoDateString !== INVALID_DATE_VALUE ? isoDateString : inputProps.value);
            return;
        }
        if (selectedDay) {
            onChange(dateToISODateString(selectedDay));
        }
    };

    const onInputFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
        if (inputProps.onFocus) {
            inputProps.onFocus(evt);
        }
        setInputHasFocus(true);
    };

    return (
        <div className={className || ''}>
            <DatePicker
                {...(datepickerProps as any)}
                onSelect={onSelect}
                mode="single"
                showWeekNumber={true}
                inputDisabled={inputDisabled}
            >
                <DatePicker.Input
                    {...inputProps}
                    id={id}
                    label={label}
                    error={errorMessage}
                    disabled={inputDisabled}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    // onChange={onChange}
                    // onBlur={onBlur}
                    ref={inputRef}
                />
            </DatePicker>
        </div>
    );
};
