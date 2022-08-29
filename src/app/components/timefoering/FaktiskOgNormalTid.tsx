import { Button, Heading } from '@navikt/ds-react';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import React, { useState } from 'react';
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
    const [faktiskTimer, setFaktiskTimer] = useState('0');
    const [faktiskMinutter, setFaktiskMinutter] = useState('0');

    const payload = { normaltTimer, normaltMinutter, faktiskTimer, faktiskMinutter, selectedDates };
    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            {label && <Heading size="medium">{label}</Heading>}
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
                    <Button
                        style={{ flexGrow: 1 }}
                        onClick={() => {
                            lagre(payload);
                            toggleModal();
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
