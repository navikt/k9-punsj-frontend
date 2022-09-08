import intlHelper from 'app/utils/intlUtils';
import { periodeMedTimerTilKalenderdag } from 'app/utils/mappingUtils';
import React, { useState } from 'react';
import { Periode, Periodeinfo, IPeriode, ITimerOgMinutter } from 'app/models/types';
import { formats, removeDatesFromPeriods } from 'app/utils';
import dayjs from 'dayjs';
import { Button, Modal } from '@navikt/ds-react';
import { useIntl } from 'react-intl';
import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import TilsynPeriodeListe from './TilsynPeriodeListe';
import VerticalSpacer from '../VerticalSpacer';
import TilsynTid from './TilsynTid';

interface OwnProps {
    perioderMedTimer: Periodeinfo<ITimerOgMinutter>[];
    updateSoknad: (v: Periodeinfo<ITimerOgMinutter>[]) => void;
    updateSoknadState: (v: Periodeinfo<ITimerOgMinutter>[]) => void;
    soknadsperioder: IPeriode[];
}

export default function TilsynKalender({
    perioderMedTimer,
    updateSoknad,
    updateSoknadState,
    soknadsperioder,
}: OwnProps) {
    const intl = useIntl();
    const [visLengrePerioder, setVisLengrePerioder] = useState(false);
    const toggleVisLengrePerioder = () => setVisLengrePerioder(!visLengrePerioder);

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
            (day) => !perioderMedTimer.some((periode) => periode.periode.includesDate(day))
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

        const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates);

        updateSoknad(perioderFiltert as Periodeinfo<ITimerOgMinutter>[]);
        updateSoknadState(perioderFiltert as Periodeinfo<ITimerOgMinutter>[]);
    };
    return (
        <>
            <Button variant="secondary" onClick={toggleVisLengrePerioder}>
                {intlHelper(intl, 'skjema.registrerTidLengrePeriode')}
            </Button>
            <VerticalSpacer twentyPx />
            <Modal open={visLengrePerioder} onClose={toggleVisLengrePerioder} className="lengre-periode-modal">
                <Modal.Content>
                    <TilsynPeriodeListe
                        heading="Periode med tilsyn"
                        perioder={perioderMedTimer}
                        soknadsperioder={soknadsperioder}
                        lagre={(periodeInfo) => {
                            updateSoknad(periodeInfo);
                            updateSoknadState(periodeInfo);
                            toggleVisLengrePerioder();
                        }}
                        avbryt={toggleVisLengrePerioder}
                    />
                </Modal.Content>
            </Modal>
            {soknadsperioder && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={soknadsperioder}
                    ModalContent={<TilsynTid heading="Registrer omsorgstilbud" lagre={lagreTimer} />}
                    kalenderdager={perioderMedTimer.flatMap((periode) => periodeMedTimerTilKalenderdag(periode))}
                    slettPeriode={slettDager(perioderMedTimer)}
                    dateContentRenderer={DateContent}
                />
            )}
        </>
    );
}
