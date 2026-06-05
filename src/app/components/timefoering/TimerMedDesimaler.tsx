import React, { useId } from 'react';

import { ErrorMessage, Label, TextField } from '@navikt/ds-react';

import { sanitizeDecimalTimeInput } from './timeInputHelpers';

import './timerOgMinutter.css';

interface OwnProps {
    label: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    value: string;
    error?: string;
    size?: 'small' | 'medium';
}

const TimerMedDesimaler = ({ label, onChange, onBlur, value, error, size }: OwnProps) => {
    const id = useId();

    const timerId = `timer-${id}`;

    return (
        <div className="timer-og-minutter min-w-[8rem]">
            <div>
                <Label size="small" htmlFor={timerId}>
                    {label}
                </Label>
            </div>
            <div className="tid-container">
                <div className="input-row">
                    <div className="input-container">
                        <TextField
                            id={timerId}
                            className="input text-center w-12"
                            label={label}
                            hideLabel
                            size={size}
                            value={value}
                            onChange={(event) => {
                                onChange(sanitizeDecimalTimeInput(event.target.value));
                            }}
                            onBlur={onBlur}
                            error={!!error}
                        />
                    </div>
                </div>
                {error && <ErrorMessage size="small">{error}</ErrorMessage>}
            </div>
        </div>
    );
};
export default TimerMedDesimaler;
