import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Datepicker } from 'nav-datovelger';
import { DatepickerProps } from 'nav-datovelger/lib/Datepicker';
import { Label } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ErrorMessage } from '@navikt/ds-react';

dayjs.extend(customParseFormat);

export interface DateInputProps extends DatepickerProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    disabled?: boolean;
    errorMessage?: React.ReactNode | string;
    label: string;
    onBlur?: (value: string) => void;
    className?: string;
    inputRef?: React.Ref<HTMLInputElement>;
}

const isValidDate = (dateString: string) => dayjs(dateString, 'YYYY-MM-DD').isValid();

const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    onBlur,
    id,
    disabled,
    errorMessage,
    label,
    className,
    inputRef,
    limitations,
}) => {
    const datepickerId = id || uuidv4();
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const error = isInvalidDate ? 'Dato har ikke gyldig format' : errorMessage;
    return (
        <div className={className || ''}>
            <Label htmlFor={datepickerId}>{label}</Label>
            <Datepicker
                locale="nb"
                inputId={datepickerId}
                value={value}
                onChange={(v) => {
                    if (v.length < 6 || !isValidDate(v)) {
                        setIsInvalidDate(true);
                    } else {
                        onChange(v);
                        setIsInvalidDate(false);
                        if (onBlur) {
                            onBlur(v);
                        }
                    }
                }}
                calendarSettings={{ showWeekNumbers: true }}
                showYearSelector
                disabled={disabled}
                inputProps={inputRef ? { inputRef } : undefined}
                limitations={limitations}
            />
            {error && <ErrorMessage size="small">{error}</ErrorMessage>}
        </div>
    );
};
export default DateInput;
