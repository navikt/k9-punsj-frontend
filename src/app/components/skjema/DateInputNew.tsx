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

import './dateInputNew.less';

type Props = Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate'> & {
    label: string;
    onChange: (value: string) => void;

    className?: string;
    description?: React.ReactNode;
    errorMessage?: React.ReactNode | string;
    id?: string;
    inputDisabled?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    onBlur?: (value: string) => void;
    value?: string;
};

export const DateInputNew: React.FC<Props> = ({
    label,
    onChange,

    className,
    errorMessage,
    id,
    inputDisabled,
    inputRef,
    locale,
    onBlur,
    value,
}) => {
    const [firstOpen, setFirstOpen] = React.useState(true);
    const [isInvalidDate, setIsInvalidDate] = useState(false);

    const error = isInvalidDate ? 'Dato har ikke gyldig format' : errorMessage;

    const onDateChange = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : undefined;
        if (isoDateString && isoDateString !== value) {
            onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        locale,
        onDateChange: onDateChange,
        onValidate: (val) => {
            setIsInvalidDate(!val.isValidDate);
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
        const isoDateString = evt.target.value ? InputDateStringToISODateString(evt.target.value) : undefined;

        if (
            isoDateString &&
            isoDateString !== INVALID_DATE_VALUE &&
            isISODateString(value) &&
            previous !== isoDateString
        ) {
            onBlur && onBlur(isoDateString);
        }
    };

    const onSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        if (isoDateString !== value) {
            onBlur && onBlur(isoDateString);
        }
    };

    return (
        <div className={className || ''}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                onSelect={onSelect}
                mode="single"
                inputDisabled={inputDisabled}
            >
                <DatePicker.Input
                    {...inputProps}
                    id={id}
                    label={label}
                    error={error}
                    disabled={inputDisabled}
                    onBlur={onInputBlur}
                    ref={inputRef}
                />
            </DatePicker>
        </div>
    );
};
