import { Button, Heading } from '@navikt/ds-react';
import { timerOgMinutter } from 'app/rules/valideringer';
import React, { useState, useEffect } from 'react';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';

interface OwnProps {
    lagre: (params: any) => void;
    toggleModal: () => void;
    selectedDates?: Date[];
    heading?: string;
}

const TilsynTid = ({ lagre, heading, selectedDates, toggleModal }: OwnProps) => {
    const [timer, setTimer] = useState('');
    const [minutter, setMinutter] = useState('');
    const [error, setError] = useState('');
    const [visError, setVisError] = useState(false);

    const payload = {
        timer,
        minutter,
        selectedDates,
    };

    useEffect(() => {
        timerOgMinutter
            .required()
            .validate({ timer, minutter })
            .then(() => setError(''))
            .catch((e) => {
                setError(e.message);
            });
    }, [timer, minutter]);

    return (
        <div style={{ marginLeft: '1rem' }}>
            {heading && <Heading size="small">{heading}</Heading>}
            <div style={{ display: 'flex', marginTop: '1.5625rem' }}>
                <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                    <TimerOgMinutter
                        label="Tid i omsorgstilbud"
                        onChangeTimer={setTimer}
                        onChangeMinutter={setMinutter}
                        onBlur={() => setVisError(true)}
                        timer={timer}
                        minutter={minutter}
                        error={visError ? error : undefined}
                    />
                </div>
            </div>
            {lagre && (
                <div style={{ display: 'flex' }}>
                    <Button
                        style={{ flexGrow: 1 }}
                        onClick={() => {
                            setVisError(true);
                            if (!error) {
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

export default TilsynTid;
