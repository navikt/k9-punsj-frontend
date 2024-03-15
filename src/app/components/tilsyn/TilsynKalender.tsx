import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { Button, Modal } from '@navikt/ds-react';

import { IPeriode, ITimerOgMinutter, Periode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { formats, removeDatesFromPeriods } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { periodeMedTimerTilKalenderdag } from 'app/utils/mappingUtils';

import VerticalSpacer from '../VerticalSpacer';
import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import TilsynPeriodeListe from './TilsynPeriodeListe';
import TilsynTid from './TilsynTid';

interface OwnProps {
    perioderMedTimer: Periodeinfo<ITimerOgMinutter>[];
    updateSoknad: (v: Periodeinfo<ITimerOgMinutter>[]) => void;
    updateSoknadState: (v: Periodeinfo<ITimerOgMinutter>[]) => void;
    nyeSoknadsperioder: IPeriode[];
    eksisterendeSoknadsperioder: IPeriode[];
}

export default function TilsynKalender({
    perioderMedTimer,
    updateSoknad,
    updateSoknadState,
    nyeSoknadsperioder = [],
    eksisterendeSoknadsperioder = [],
}: OwnProps) {
    const intl = useIntl();
    const [visLengrePerioder, setVisLengrePerioder] = useState(false);
    const toggleVisLengrePerioder = () => setVisLengrePerioder(!visLengrePerioder);
    const gyldigePerioder = [...nyeSoknadsperioder, ...eksisterendeSoknadsperioder];

    const lagreTimer = ({
        timer,
        minutter,
        selectedDates,
    }: {
        timer: number;
        minutter: number;
        selectedDates: Date[];
    }) => {
        const utenDagerSomAlleredeFinnes = selectedDates.filter(
            (day) => !perioderMedTimer.some((periode) => periode.periode.includesDate(day)),
        );
        const payload = utenDagerSomAlleredeFinnes.map((day) => ({
            periode: new Periode({
                fom: dayjs(day).format(formats.YYYYMMDD),
                tom: dayjs(day).format(formats.YYYYMMDD),
            }),
            timer,
            minutter,
        }));
        updateSoknad([...perioderMedTimer, ...payload]);
        updateSoknadState([...perioderMedTimer, ...payload]);
    };

    const slettDager = (opprinneligePerioder: Periodeinfo<ITimerOgMinutter>[]) => (selectedDates?: Date[]) => {
        if (!selectedDates) {
            return;
        }

        const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates).map(
            (v: Periodeinfo<ITimerOgMinutter>) => new PeriodeMedTimerMinutter(v),
        );

        updateSoknad(perioderFiltert);
        updateSoknadState(perioderFiltert);
    };
    return (
        <>
            <Button variant="secondary" onClick={toggleVisLengrePerioder}>
                {intlHelper(intl, 'skjema.registrerTidLengrePeriode')}
            </Button>
            <VerticalSpacer twentyPx />
            <Modal
                open={visLengrePerioder}
                onClose={() => setVisLengrePerioder(false)}
                className="venstrestilt lengre-periode-modal"
                aria-label="Lengre periode modal"
            >
                <Modal.Body>
                    <TilsynPeriodeListe
                        heading="Periode med tilsyn"
                        perioder={perioderMedTimer}
                        soknadsperioder={gyldigePerioder}
                        nyeSoknadsperioder={nyeSoknadsperioder}
                        lagre={(periodeInfo) => {
                            updateSoknad(periodeInfo);
                            updateSoknadState(periodeInfo);
                            toggleVisLengrePerioder();
                        }}
                        avbryt={toggleVisLengrePerioder}
                    />
                </Modal.Body>
            </Modal>
            {gyldigePerioder && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={gyldigePerioder}
                    ModalContent={<TilsynTid heading="Registrer omsorgstilbud" lagre={lagreTimer} />}
                    kalenderdager={perioderMedTimer.flatMap((periode) => periodeMedTimerTilKalenderdag(periode))}
                    slettPeriode={slettDager(perioderMedTimer)}
                    dateContentRenderer={DateContent}
                />
            )}
        </>
    );
}
