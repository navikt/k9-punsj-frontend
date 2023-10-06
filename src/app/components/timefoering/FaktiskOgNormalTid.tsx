import React, { useEffect, useState } from 'react';

import { Button, Heading, ToggleGroup } from '@navikt/ds-react';

import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import { timerOgMinutter } from 'app/rules/yup';
import { Tidsformat, konverterPeriodeTilTimerOgMinutter } from 'app/utils';

import TimerOgMinutter from './TimerOgMinutter';
import TimerMedDesimaler from './TimerMedDesimaler';
import UtregningArbeidstidDesimaler from './UtregningArbeidstidDesimaler';

interface OwnProps {
    lagre: (params: any, selectedDates: Date[]) => void;
    toggleModal: () => void;
    selectedDates: Date[];
    heading?: string;
    clearSelectedDates?: () => void;
}

const FaktiskOgNormalTid = ({
    lagre,
    heading,
    selectedDates,
    toggleModal,
    clearSelectedDates = () => {},
}: OwnProps) => {
    const [normaltTimer, setNormaltTimer] = useState('');
    const [normaltMinutter, setNormaltMinutter] = useState('');
    const [normaltError, setNormaltError] = useState('');
    const [visNormaltError, setVisNormaltError] = useState(false);

    const [faktiskTimer, setFaktiskTimer] = useState('');
    const [faktiskMinutter, setFaktiskMinutter] = useState('');
    const [faktiskError, setFaktiskError] = useState('');
    const [visFaktiskError, setVisFaktiskError] = useState(false);

    const [faktiskDesimaler, setFaktiskDesimaler] = useState('');
    const [normaltDesimaler, setNormaltDesimaler] = useState('');

    const [tidsformat, setTidsformat] = useState<Tidsformat>(Tidsformat.TimerOgMin);

    const payload = {
        faktiskArbeidPerDag: { timer: faktiskTimer || '0', minutter: faktiskMinutter || '0' },
        jobberNormaltPerDag: { timer: normaltTimer || '0', minutter: normaltMinutter || '0' },
        faktiskArbeidTimerPerDag: faktiskDesimaler || '0',
        jobberNormaltTimerPerDag: normaltDesimaler || '0',
        tidsformat,
    };

    useEffect(() => {
        timerOgMinutter
            .required()
            .validate({ timer: normaltTimer, minutter: normaltMinutter })
            .then(() => setNormaltError(''))
            .catch((e) => {
                setNormaltError(e.message);
            });
        timerOgMinutter
            .required()
            .validate({ timer: faktiskTimer, minutter: faktiskMinutter })
            .then(() => setFaktiskError(''))
            .catch((e) => {
                setFaktiskError(e.message);
            });
    }, [normaltTimer, faktiskTimer, faktiskMinutter, normaltMinutter]);

    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            {heading && <Heading size="medium">{heading}</Heading>}
            <div style={{ marginTop: '1.5625rem' }}>
                <ToggleGroup
                    label="Hvordan vil du oppgi arbeidstid?"
                    defaultValue={Tidsformat.TimerOgMin}
                    size="small"
                    onChange={(v: Tidsformat) => setTidsformat(v)}
                    value={tidsformat}
                >
                    <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                    <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                </ToggleGroup>
            </div>

            {tidsformat === Tidsformat.TimerOgMin && (
                <div className="flex gap-4 mt-6">
                    <div>
                        <TimerOgMinutter
                            label="Normal arbeidstid"
                            onChangeTimer={setNormaltTimer}
                            onChangeMinutter={setNormaltMinutter}
                            onBlur={() => setVisNormaltError(true)}
                            timer={normaltTimer}
                            minutter={normaltMinutter}
                            error={visNormaltError ? normaltError : undefined}
                        />
                        <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                            <UtregningArbeidstid arbeidstid={{ timer: normaltTimer, minutter: normaltMinutter }} />
                        </div>
                    </div>
                    <div>
                        <TimerOgMinutter
                            label="Faktisk arbeidstid"
                            onChangeTimer={setFaktiskTimer}
                            onChangeMinutter={setFaktiskMinutter}
                            onBlur={() => setVisFaktiskError(true)}
                            timer={faktiskTimer}
                            minutter={faktiskMinutter}
                            error={visFaktiskError ? faktiskError : undefined}
                        />
                        <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                            <UtregningArbeidstid
                                arbeidstid={{ timer: faktiskTimer, minutter: faktiskMinutter }}
                                normalArbeidstid={{ timer: normaltTimer, minutter: normaltMinutter }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {tidsformat === Tidsformat.Desimaler && (
                <div className="ml-4 mt-7 mb-4">
                    <div className="flex gap-8 mt-6">
                        <div>
                            <TimerMedDesimaler
                                label="Normal arbeidstid"
                                onChange={(v) => setNormaltDesimaler(v)}
                                value={normaltDesimaler}
                            />
                            <div className="mt-1">
                                <UtregningArbeidstidDesimaler arbeidstid={normaltDesimaler} />
                            </div>
                        </div>
                        <div>
                            <TimerMedDesimaler
                                label="Faktisk arbeidstid"
                                onChange={(v) => setFaktiskDesimaler(v)}
                                value={faktiskDesimaler}
                            />
                            <div className="mt-1">
                                <UtregningArbeidstidDesimaler
                                    arbeidstid={faktiskDesimaler}
                                    normalArbeidstid={normaltDesimaler}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {lagre && (
                <div style={{ display: 'flex' }}>
                    <Button
                        style={{ flexGrow: 1 }}
                        onClick={() => {
                            setVisFaktiskError(true);
                            setVisNormaltError(true);
                            if (!faktiskError && !normaltError) {
                                lagre(konverterPeriodeTilTimerOgMinutter(payload), selectedDates);
                                clearSelectedDates();
                                toggleModal();
                            }
                        }}
                    >
                        Lagre
                    </Button>
                    <Button
                        style={{ flexGrow: 1 }}
                        variant="tertiary"
                        onClick={() => {
                            toggleModal();
                            clearSelectedDates();
                        }}
                    >
                        Avbryt
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FaktiskOgNormalTid;
