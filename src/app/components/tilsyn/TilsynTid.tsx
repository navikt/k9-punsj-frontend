import React, { useEffect, useState } from 'react';

import { Button, Heading } from '@navikt/ds-react';

import { timerOgMinutter } from 'app/rules/yup';

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
        <div className="mt-4">
            {heading && <Heading size="small">{heading}</Heading>}
            <div className="flex mt-6">
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
            {lagre && (
                <div className="flex">
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
