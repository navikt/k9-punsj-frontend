import React, { useState } from 'react';

import { Button, Heading, ToggleGroup } from '@navikt/ds-react';

import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import { ITimerOgMinutterString } from 'app/models/types';
import TimerOgMinutter from 'app/components/timefoering/TimerOgMinutter';
import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

export interface FraværTidPayload {
    tidsformat: Tidsformat;
    fraværTimerPerDag?: string;
    jobberNormaltTimerPerDag?: string;
    fraværPerDag?: ITimerOgMinutterString;
    jobberNormaltPerDag?: ITimerOgMinutterString;
    selectedDates?: Date[];
}

interface Props {
    heading: string;
    selectedDates?: Date[];
    lagre: (payload: FraværTidPayload) => void;
    clearSelectedDates?: () => void;
    toggleModal?: () => void;
}

const FraværTid = ({ heading, selectedDates, lagre, clearSelectedDates = () => {}, toggleModal = () => {} }: Props) => {
    const [normalTimer, setNormalTimer] = useState('');
    const [normalMinutter, setNormalMinutter] = useState('');
    const [normalDesimaler, setNormalDesimaler] = useState('');

    const [fraværTimer, setFraværTimer] = useState('');
    const [fraværMinutter, setFraværMinutter] = useState('');
    const [fraværDesimaler, setFraværDesimaler] = useState('');

    const [submitted, setSubmitted] = useState(false);
    const [tidsformat, setTidsformat] = useState<Tidsformat>(Tidsformat.TimerOgMin);

    const normalError = !normalTimer && !normalMinutter ? 'Fyll ut normal arbeidstid' : '';
    const fraværError = !fraværTimer && !fraværMinutter ? 'Fyll ut fravær' : '';

    const handleToggle = (v: Tidsformat) => {
        setTidsformat(v);
        if (v === Tidsformat.Desimaler) {
            setNormalDesimaler(timerOgMinutterTilTimerMedDesimaler({ timer: normalTimer, minutter: normalMinutter }));
            setFraværDesimaler(timerOgMinutterTilTimerMedDesimaler({ timer: fraværTimer, minutter: fraværMinutter }));
        } else {
            const [nt, nm] = timerMedDesimalerTilTimerOgMinutter(Number(normalDesimaler));
            const [ft, fm] = timerMedDesimalerTilTimerOgMinutter(Number(fraværDesimaler));
            setNormalTimer(nt); setNormalMinutter(nm);
            setFraværTimer(ft); setFraværMinutter(fm);
        }
    };

    const handleLagre = () => {
        if (tidsformat === Tidsformat.TimerOgMin) {
            if (normalError || fraværError) {
                setSubmitted(true);
                return;
            }
            lagre({
                tidsformat,
                fraværPerDag: { timer: fraværTimer, minutter: fraværMinutter },
                jobberNormaltPerDag: { timer: normalTimer, minutter: normalMinutter },
                selectedDates,
            });
        } else {
            lagre({
                tidsformat,
                fraværTimerPerDag: fraværDesimaler,
                jobberNormaltTimerPerDag: normalDesimaler,
                selectedDates,
            });
        }
        toggleModal();
        clearSelectedDates();
    };

    return (
        <div className="ml-4 mt-4">
            <Heading size="small">{heading}</Heading>
            <div className="mt-6">
                <ToggleGroup label="Hvordan vil du oppgi tid?" size="small" value={tidsformat} onChange={handleToggle}>
                    <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                    <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                </ToggleGroup>
            </div>

            {tidsformat === Tidsformat.TimerOgMin && (
                <div className="mt-6 flex gap-8">
                    <div>
                        <TimerOgMinutter
                            label="Normal arbeidstid"
                            timer={normalTimer}
                            minutter={normalMinutter}
                            onChangeTimer={setNormalTimer}
                            onChangeMinutter={setNormalMinutter}
                            onBlur={() => setSubmitted(true)}
                            error={submitted ? normalError : undefined}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstid arbeidstid={{ timer: normalTimer, minutter: normalMinutter }} />
                        </div>
                    </div>
                    <div>
                        <TimerOgMinutter
                            label="Fravær"
                            timer={fraværTimer}
                            minutter={fraværMinutter}
                            onChangeTimer={setFraværTimer}
                            onChangeMinutter={setFraværMinutter}
                            onBlur={() => setSubmitted(true)}
                            error={submitted ? fraværError : undefined}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstid
                                arbeidstid={{ timer: fraværTimer, minutter: fraværMinutter }}
                                normalArbeidstid={{ timer: normalTimer, minutter: normalMinutter }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {tidsformat === Tidsformat.Desimaler && (
                <div className="mt-6 flex gap-8">
                    <div>
                        <TimerMedDesimaler
                            label="Normal arbeidstid i timer"
                            value={normalDesimaler}
                            onChange={(v) => {
                                setNormalDesimaler(v);
                                const [t, m] = timerMedDesimalerTilTimerOgMinutter(Number(v));
                                setNormalTimer(t); setNormalMinutter(m);
                            }}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstidDesimaler arbeidstid={normalDesimaler} />
                        </div>
                    </div>
                    <div>
                        <TimerMedDesimaler
                            label="Fravær i timer"
                            value={fraværDesimaler}
                            onChange={(v) => {
                                setFraværDesimaler(v);
                                const [t, m] = timerMedDesimalerTilTimerOgMinutter(Number(v));
                                setFraværTimer(t); setFraværMinutter(m);
                            }}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstidDesimaler arbeidstid={fraværDesimaler} normalArbeidstid={normalDesimaler} />
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6">
                <Button size="small" onClick={handleLagre}>Lagre</Button>
            </div>
        </div>
    );
};

export default FraværTid;
