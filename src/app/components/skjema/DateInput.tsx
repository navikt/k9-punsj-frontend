import { Datepicker } from 'nav-datovelger';
import { Label } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';

interface DateInputProps {
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
    return (
        <div className={className || ''}>
            <Label htmlFor={datepickerId}>{label}</Label>
            <Datepicker
                locale="nb"
                inputId={datepickerId}
                value={value}
                onChange={(v) => {
                    onChange(v);
                    if (onBlur) {
                        onBlur(v);
                    }
                }}
                calendarSettings={{ showWeekNumbers: true }}
                showYearSelector
                disabled={disabled}
                inputProps={{ inputRef }}
            />
            {errorMessage && <Feilmelding>{errorMessage}</Feilmelding>}
        </div>
    );
};
export default DateInput;
