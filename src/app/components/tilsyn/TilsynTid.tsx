import React, { useEffect, useState } from 'react';

import { Button, Heading, ToggleGroup } from '@navikt/ds-react';

import { timerOgMinutter } from 'app/rules/yup';

import TimerOgMinutter from '../timefoering/TimerOgMinutter';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

interface OwnProps {
    lagre: (params: any) => void;
    toggleModal: () => void;
    selectedDates?: Date[];
    heading: string;
    clearSelectedDates?: () => void;
}

const TilsynTid = ({ lagre, heading, selectedDates, toggleModal, clearSelectedDates = () => {} }: OwnProps) => {
    const [timer, setTimer] = useState('');
    const [minutter, setMinutter] = useState('');
    const [error, setError] = useState('');
    const [visError, setVisError] = useState(false);
    const [tidsformat, setTidsformat] = useState<Tidsformat>(Tidsformat.TimerOgMin);
    const [perDagString, setPerDagString] = useState('');

    const setPerDagStringFraTimerOgMinutter = () => {
        const desimal = timerOgMinutterTilTimerMedDesimaler({ timer, minutter });
        setPerDagString(desimal);
    };

    const setTimerOgMinutterFraPerDagString = (_perDagString: string = perDagString) => {
        const timerOgMinutterKonvertert = timerMedDesimalerTilTimerOgMinutter(Number(_perDagString));
        setTimer(timerOgMinutterKonvertert[0]);
        setMinutter(timerOgMinutterKonvertert[1]);
    };

    const payload = {
        timer,
        minutter,
        selectedDates,
        perDagString,
        tidsformat,
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
        <div className="ml-4 mt-4">
            <Heading size="small">{heading}</Heading>
            <div className="mt-6">
                <ToggleGroup
                    label="Hvordan vil du oppgi tid i omsorgstilbud?"
                    size="small"
                    onChange={(v: Tidsformat) => {
                        setTidsformat(v);
                        switch (v) {
                            case Tidsformat.Desimaler:
                                setPerDagStringFraTimerOgMinutter();
                                break;
                            case Tidsformat.TimerOgMin:
                                setTimerOgMinutterFraPerDagString();
                                break;
                        }
                    }}
                    value={tidsformat}
                >
                    <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                    <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                </ToggleGroup>
                {tidsformat === Tidsformat.TimerOgMin && (
                    <div>
                        <div>
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
                )}
                {tidsformat === Tidsformat.Desimaler && (
                    <div className="ml-4 mt-7 mb-4">
                        <div className="flex gap-8 mt-6">
                            <div>
                                <TimerMedDesimaler
                                    value={perDagString}
                                    onChange={(nyString) => {
                                        setPerDagString(nyString);
                                        setTimerOgMinutterFraPerDagString(nyString);
                                    }}
                                    label="Tid i omsorgstilbud"
                                />
                                <div className="mt-1">
                                    <UtregningArbeidstidDesimaler arbeidstid={perDagString} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                                clearSelectedDates();
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

export default TilsynTid;
