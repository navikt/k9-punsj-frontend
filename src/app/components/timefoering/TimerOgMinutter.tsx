/* eslint-disable jsx-a11y/label-has-associated-control */
import { Detail, ErrorMessage, Label } from '@navikt/ds-react';
import { uniqueId } from 'lodash';
import { Input } from 'nav-frontend-skjema';
import React from 'react';
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
                <Label>{label}</Label>
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
                                onChangeTimer(event.target.value.replaceAll(',', '').replaceAll('.', ''));
                            }}
                            type="number"
                            onBlur={onBlur}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            feil={!!error}
                        />
                        <div>
                            <label htmlFor={timerId}>
                                <Detail>Timer</Detail>
                            </label>
                        </div>
                    </div>
                    <div className="input-container minutter">
                        <Input
                            id={minutterId}
                            style={{ textAlign: 'center' }}
                            className="input"
                            bredde="XS"
                            value={minutter}
                            onChange={(event) => {
                                onChangeMinutter(event.target.value.replaceAll(',', '').replaceAll('.', ''));
                            }}
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onBlur={onBlur}
                            feil={!!error}
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
