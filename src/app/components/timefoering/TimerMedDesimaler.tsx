/* eslint-disable jsx-a11y/label-has-associated-control */
import { uniqueId } from 'lodash';
import { Input } from 'nav-frontend-skjema';
import React from 'react';

import { Detail, ErrorMessage, Label } from '@navikt/ds-react';

import './timerMedDesimaler.less';

interface OwnProps {
    label: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    timer: string;
    error?: string;
}

const TimerMedDesimaler = ({ label, onChange, onBlur, timer, error }: OwnProps) => {
    const id = uniqueId();

    const timerId = `timer-${id}`;

    return (
        <div className="timer-og-minutter">
            <div>
                <Label size="small">{label}</Label>
            </div>
            <div className="tid-container">
                <div className="input-row">
                    <div className="input-container">
                        <Input
                            id={timerId}
                            style={{ textAlign: 'center' }}
                            className="input"
                            bredde="XS"
                            value={timer}
                            onChange={(event) => {
                                onChange(event.target.value.replace(/[^0-9.]/g, ''));
                            }}
                            onBlur={onBlur}
                            feil={!!error}
                        />
                        <div>
                            <label htmlFor={timerId}>
                                <Detail>Timer</Detail>
                            </label>
                        </div>
                    </div>
                </div>
                {error && <ErrorMessage size="small">{error}</ErrorMessage>}
            </div>
        </div>
    );
};
export default TimerMedDesimaler;
