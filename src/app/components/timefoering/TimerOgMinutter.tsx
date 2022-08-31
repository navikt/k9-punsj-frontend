import { Detail, Label, ErrorMessage } from '@navikt/ds-react';
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

const TimerOgMinutter = ({ label, onChangeTimer, onChangeMinutter, onBlur, timer, minutter, error }: OwnProps) => (
    <>
        <div>
            <Label>{label}</Label>
        </div>
        <div className="tid-container">
            <div className="input-row">
                <div className="input-container">
                    <Input
                        style={{ textAlign: 'center' }}
                        className="input"
                        bredde="XS"
                        value={timer}
                        onChange={(event) => {
                            onChangeTimer(event.target.value.replace(/\s/g, ''));
                        }}
                        onBlur={onBlur}
                        type="number"
                        feil={!!error}
                    />
                    <div>
                        <Detail>Timer</Detail>
                    </div>
                </div>
                <div className="input-container minutter">
                    <Input
                        style={{ textAlign: 'center' }}
                        className="input"
                        bredde="XS"
                        value={minutter}
                        onChange={(event) => {
                            onChangeMinutter(event.target.value.replace(/\s/g, ''));
                        }}
                        type="number"
                        onBlur={onBlur}
                        feil={!!error}
                    />
                    <div>
                        <Detail>Minutter</Detail>
                    </div>
                </div>
            </div>
            {error && <ErrorMessage size="small">{error}</ErrorMessage>}
        </div>
    </>
);
export default TimerOgMinutter;
