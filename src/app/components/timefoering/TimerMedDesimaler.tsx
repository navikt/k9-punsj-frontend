import { uniqueId } from 'lodash';
import { Input } from 'nav-frontend-skjema';
import React from 'react';

import { ErrorMessage, Label } from '@navikt/ds-react';

import './timerOgMinutter.less';

interface OwnProps {
    label: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    value: string;
    error?: string;
}

const TimerMedDesimaler = ({ label, onChange, onBlur, value, error }: OwnProps) => {
    const id = uniqueId();

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
                        <Input
                            id={timerId}
                            className="input text-center"
                            bredde="XS"
                            value={value}
                            onChange={(event) => {
                                onChange(event.target.value.replaceAll(/[^\d,.]+/g, '').replace(',', '.'));
                            }}
                            onBlur={onBlur}
                            feil={!!error}
                        />
                    </div>
                </div>
                {error && <ErrorMessage size="small">{error}</ErrorMessage>}
            </div>
        </div>
    );
};
export default TimerMedDesimaler;
