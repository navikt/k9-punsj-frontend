import { Button, Heading } from '@navikt/ds-react';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import React, { useState } from 'react';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';

interface OwnProps {
    label: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>) => void;
}

export default function ArbeidstidPeriode({ label, lagre }: OwnProps) {
    const [normaltTimer, setNormaltTimer] = useState('0');
    const [normaltMinutter, setNormaltMinutter] = useState('0');
    const [faktiskTimer, setFaktiskTimer] = useState('0');
    const [faktiskMinutter, setFaktiskMinutter] = useState('0');
    const [periode, setPeriode] = useState<IPeriode>({ fom: '', tom: '' });

    const payload = new ArbeidstidPeriodeMedTimer({
        periode,
        jobberNormaltTimerPerDag: normaltTimer,
        faktiskArbeidTimerPerDag: faktiskTimer,
    });
    return (
        <>
            {label && <Heading size="medium">{label}</Heading>}
            <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                <PeriodInput
                    periode={periode || {}}
                    onChange={(v) => {
                        setPeriode(v);
                    }}
                />
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
                {lagre && (
                    <div style={{ display: 'flex' }}>
                        <Button style={{ flexGrow: 1 }} onClick={() => lagre([payload])}>
                            Lagre
                        </Button>
                        <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={() => new Error('Implementer meg')}>
                            Avbryt
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
