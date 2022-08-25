import { Delete } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import React, { useEffect, useState } from 'react';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';

interface OwnProps {
    initialPeriode: Periodeinfo<IArbeidstidPeriodeMedTimer>;
    onChange: (periode: Periodeinfo<IArbeidstidPeriodeMedTimer>) => void;
    remove: () => void;
}

const ArbeidstidPeriode = ({ initialPeriode, onChange, remove }: OwnProps) => {
    const [normaltTimer, setNormaltTimer] = useState(initialPeriode?.jobberNormaltTimerPerDag || '0');
    const [normaltMinutter, setNormaltMinutter] = useState('0');
    const [faktiskTimer, setFaktiskTimer] = useState(initialPeriode?.faktiskArbeidTimerPerDag || '0');
    const [faktiskMinutter, setFaktiskMinutter] = useState('0');
    const [periode, setPeriode] = useState<IPeriode>({
        fom: initialPeriode?.periode?.fom || '',
        tom: initialPeriode?.periode?.tom || '',
    });

    const payload = new ArbeidstidPeriodeMedTimer({
        periode,
        jobberNormaltTimerPerDag: normaltTimer,
        faktiskArbeidTimerPerDag: faktiskTimer,
    });

    useEffect(() => {
        onChange(payload);
    }, [normaltTimer, faktiskTimer, periode]);

    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            <div style={{ display: 'flex' }}>
                <PeriodInput
                    periode={periode || {}}
                    onChange={(v) => {
                        setPeriode(v);
                    }}
                />
                <Button onClick={remove} variant="tertiary" style={{ marginTop: '1.5rem', paddingLeft: '0.3125rem' }}>
                    <Delete fontSize={23} style={{ color: 'red' }} />
                </Button>
            </div>
            <div style={{ display: 'flex', marginTop: '1.5625rem' }}>
                <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                    <TimerOgMinutter
                        label="Normal arbeidstid"
                        onChangeTimer={setNormaltTimer}
                        onChangeMinutter={setNormaltMinutter}
                        timer={normaltTimer}
                        minutter={normaltMinutter}
                    />
                    <div style={{ marginTop: '1.0625rem', marginBottom: '3.5625rem' }}>
                        <UtregningArbeidstid arbeidstid={normaltTimer} />
                    </div>
                </div>
                <div>
                    <TimerOgMinutter
                        label="Faktisk arbeidstid"
                        onChangeTimer={setFaktiskTimer}
                        onChangeMinutter={setFaktiskMinutter}
                        timer={faktiskTimer}
                        minutter={faktiskMinutter}
                    />
                    <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                        <UtregningArbeidstid arbeidstid={faktiskTimer} normalArbeidstid={normaltTimer} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArbeidstidPeriode;
