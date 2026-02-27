import React, { useState } from 'react';

import { Button, Heading } from '@navikt/ds-react';

import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

export interface FraværTidPayload {
    fraværTimerPerDag: string;
    jobberNormaltTimerPerDag: string;
    selectedDates?: Date[];
}

interface Props {
    heading: string;
    selectedDates?: Date[];
    lagre: (payload: FraværTidPayload) => void;
    clearSelectedDates?: () => void;
}

const FraværTid = ({ heading, selectedDates, lagre, clearSelectedDates = () => {} }: Props) => {
    const [normalArbeidstid, setNormalArbeidstid] = useState('');
    const [fraværTimer, setFraværTimer] = useState('');

    const handleLagre = () => {
        lagre({ fraværTimerPerDag: fraværTimer, jobberNormaltTimerPerDag: normalArbeidstid, selectedDates });
        clearSelectedDates();
    };

    return (
        <div className="ml-4 mt-4">
            <Heading size="small">{heading}</Heading>
            <div className="mt-6 flex gap-8">
                <div>
                    <TimerMedDesimaler
                        label="Normal arbeidstid"
                        value={normalArbeidstid}
                        onChange={setNormalArbeidstid}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler arbeidstid={normalArbeidstid} />
                    </div>
                </div>
                <div>
                    <TimerMedDesimaler
                        label="Fravær"
                        value={fraværTimer}
                        onChange={setFraværTimer}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler arbeidstid={fraværTimer} normalArbeidstid={normalArbeidstid} />
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <Button size="small" onClick={handleLagre}>
                    Lagre
                </Button>
            </div>
        </div>
    );
};

export default FraværTid;
