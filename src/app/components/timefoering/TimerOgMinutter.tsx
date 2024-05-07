import { uniqueId } from 'lodash';
import React from 'react';

import { Detail, ErrorMessage, Label, TextField } from '@navikt/ds-react';

import './timerOgMinutter.less';

interface OwnProps {
    label: string;
    onChangeTimer: (value: string) => void;
    onChangeMinutter: (value: string) => void;
    onBlur: () => void;
    timer: string;
    minutter: string;
    error?: string;
}

const TimerOgMinutter = ({ label, onChangeTimer, onChangeMinutter, onBlur, timer, minutter, error }: OwnProps) => {
    const id = uniqueId();

    const timerId = `timer-${id}`;
    const minutterId = `minutter-${id}`;

    return (
        <div className="timer-og-minutter">
            <div>
                <Label size="small">{label}</Label>
            </div>
            <div className="tid-container">
                <div className="input-row">
                    <div className="input-container">
                        <TextField
                            id={timerId}
                            className="input text-center w-12"
                            label="Timer"
                            hideLabel
                            value={timer}
                            onChange={(event) => {
                                onChangeTimer(event.target.value.replaceAll(/\D+/g, ''));
                            }}
                            onBlur={onBlur}
                            error={!!error}
                        />
                        <div>
                            <label htmlFor={timerId}>
                                <Detail>Timer</Detail>
                            </label>
                        </div>
                    </div>
                    <div className="input-container minutter">
                        <TextField
                            id={minutterId}
                            className="input text-center w-12"
                            value={minutter}
                            label="Minutter"
                            hideLabel
                            onChange={(event) => {
                                onChangeMinutter(event.target.value.replaceAll(/\D+/g, ''));
                            }}
                            onBlur={onBlur}
                            error={!!error}
                        />
                        <div>
                            <label htmlFor={minutterId}>
                                <Detail>Minutter</Detail>
                            </label>
                        </div>
                    </div>
                </div>
                {error && <ErrorMessage size="small">{error}</ErrorMessage>}
            </div>
        </div>
    );
};
export default TimerOgMinutter;
