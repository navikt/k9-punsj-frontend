import { Button, Detail, Label } from '@navikt/ds-react';
import { Input } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Row } from 'react-bootstrap';
import './timerOgMinutter.less';

interface OwnProps {
    label: string;
    onChangeTimer: (value: string) => void;
    onChangeMinutter: (value: string) => void;
    timer: string;
    minutter: string;
}

const TimerOgMinutter = ({ label, onChangeTimer, onChangeMinutter, timer, minutter }: OwnProps) => (
    <>
        <div>
            <Label>{label}</Label>
        </div>
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
                />
                <div>
                    <Detail>Minutter</Detail>
                </div>
            </div>
        </div>
    </>
);

export default TimerOgMinutter;
