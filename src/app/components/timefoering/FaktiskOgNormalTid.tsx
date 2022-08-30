import { Button, Heading } from '@navikt/ds-react';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import { normalArbeidstid, yupTimer } from 'app/rules/valideringer';
import React, { useState, useEffect } from 'react';
import TimerOgMinutter from './TimerOgMinutter';

interface OwnProps {
    lagre: (params: any) => void;
    toggleModal: () => void;
    selectedDates?: Date[];
    label?: string;
}

const FaktiskOgNormalTid = ({ lagre, label, selectedDates, toggleModal }: OwnProps) => {
    const [normaltTimer, setNormaltTimer] = useState('0');
    const [normaltMinutter, setNormaltMinutter] = useState('0');
    const [normaltError, setNormaltError] = useState('');
    const [visNormaltError, setVisNormaltError] = useState(false);

    const [faktiskTimer, setFaktiskTimer] = useState('0');
    const [faktiskMinutter, setFaktiskMinutter] = useState('0');
    const [faktiskError, setFaktiskError] = useState('');
    const [visFaktiskError, setVisFaktiskError] = useState(false);

    const payload = { normaltTimer, normaltMinutter, faktiskTimer, faktiskMinutter, selectedDates };

    useEffect(() => {
        normalArbeidstid
            .required()
            .validate(Number(normaltTimer))
            .then(() => setNormaltError(''))
            .catch((e) => {
                setNormaltError(e.message);
            });
        yupTimer
            .required()
            .validate(Number(faktiskTimer))
            .then(() => setFaktiskError(''))
            .catch((e) => {
                setFaktiskError(e.message);
            });
    }, [normaltTimer, faktiskTimer]);

    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            {label && <Heading size="medium">{label}</Heading>}
            <div style={{ display: 'flex', marginTop: '1.5625rem' }}>
                <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
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
                        <UtregningArbeidstid arbeidstid={normaltTimer} />
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
                        <UtregningArbeidstid arbeidstid={faktiskTimer} normalArbeidstid={normaltTimer} />
                    </div>
                </div>
            </div>
            {lagre && (
                <div style={{ display: 'flex' }}>
                    <Button
                        style={{ flexGrow: 1 }}
                        onClick={() => {
                            setVisFaktiskError(true);
                            setVisNormaltError(true);
                            if (!faktiskError && !normaltError) {
                                lagre(payload);
                                toggleModal();
                            }
                        }}
                    >
                        Lagre
                    </Button>
                    <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={toggleModal}>
                        Avbryt
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FaktiskOgNormalTid;
