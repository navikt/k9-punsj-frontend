import dayjs from 'dayjs';
import { Datepicker } from 'nav-datovelger';
import { Label } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export interface DateInputProps {
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
                    onChange(v);
                    setIsInvalidDate(v.length < 6 || !isValidDate(v));
                    if (onBlur) {
                        onBlur(v);
                    }
                }}
                calendarSettings={{ showWeekNumbers: true }}
                showYearSelector
                disabled={disabled}
                inputProps={{ inputRef }}
            />
            {error && <Feilmelding>{error}</Feilmelding>}
        </div>
    );
};
export default DateInput;
