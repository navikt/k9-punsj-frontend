import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';

import { TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Modal, Provider } from '@navikt/ds-react';
import useOnClickOutside from 'app/hooks/useOnClickOutside';
import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';
import DateRange from 'app/models/types/DateRange';
import { getDatesInDateRange, getMonthsInDateRange, isWeekend } from 'app/utils';

import { type ModalContentProps } from './TidsbrukKalender';
import TidsbrukKalenderÅr from './TidsbrukKalenderÅr';

interface OwnProps {
    gyldigePerioder: IPeriode[];
    kalenderdager: KalenderDag[];
    ModalContent: React.ReactElement<ModalContentProps>;
    dateContentRenderer: (kalenderdager: KalenderDag[]) => (date: Date, isDisabled?: boolean) => React.ReactNode;
    slettPeriode: (dates?: Date[]) => void;
}

type PeriodeMedDatoer = IPeriode & {
    fom: string;
    tom: string;
};

const TidsbrukKalenderContainer = ({
    gyldigePerioder,
    kalenderdager,
    ModalContent,
    dateContentRenderer,
    slettPeriode,
}: OwnProps) => {
    const harGyldigeDatoer = (periode: IPeriode): periode is PeriodeMedDatoer => !!periode.fom && !!periode.tom;
    const kalenderContainerRef = useRef<HTMLDivElement>(null);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [visModal, setVisModal] = useState(false);

    const dateRanges = useMemo(
        () =>
            gyldigePerioder
                .filter(harGyldigeDatoer)
                .map((periode): DateRange => ({ fom: new Date(periode.fom), tom: new Date(periode.tom) })),
        [gyldigePerioder],
    );
    const months = useMemo(
        () =>
            dateRanges
                .map((dateRange) => getMonthsInDateRange(dateRange))
                .flat()
                .sort((a, b) => (a.fom > b.fom ? 1 : -1)),
        [dateRanges],
    );
    const formatDate = (date: string | Date) => dayjs(date).format('YYYY-MM-DD');
    const clearSelectedDates = () => {
        setSelectedDates([]);
    };
    const toggleModal = () => {
        setVisModal((currentValue) => !currentValue);
    };

    const gyldigePerioderPerMåned = useMemo(() => {
        const reducer = (acc: DateRange[][], currentDateRange: DateRange) => {
            const indexOfArrayToInsertInto = acc.findIndex((dateRangeArr: DateRange[]) =>
                dateRangeArr.some((dateRange) => dayjs(dateRange.fom).isSame(currentDateRange.fom, 'month')),
            );
            if (indexOfArrayToInsertInto > -1 && currentDateRange) {
                const originalArray = acc[indexOfArrayToInsertInto];
                const mutableAccumulator = acc;
                mutableAccumulator[indexOfArrayToInsertInto] = [...originalArray, currentDateRange];
                return mutableAccumulator;
            }
            return [...acc, [currentDateRange]];
        };
        return months.reduce(reducer, []);
    }, [months]);

    const gyldigePerioderPerÅr = useMemo(
        () =>
            Object.entries(groupBy(gyldigePerioderPerMåned, (perioder) => dayjs(perioder[0].fom).year()))
                .map(([year, perioder]) => ({
                    aar: parseInt(year, 10),
                    perioder,
                }))
                .sort((a, b) => b.aar - a.aar),
        [gyldigePerioderPerMåned],
    );
    const datoerIGyldigePerioder = useMemo(
        () => new Set(dateRanges.flatMap((dateRange) => getDatesInDateRange(dateRange).map(formatDate))),
        [dateRanges],
    );
    const datoerMedInnhold = useMemo(
        () => new Set(kalenderdager.map((kalenderdag) => formatDate(kalenderdag.date))),
        [kalenderdager],
    );
    const someSelectedDaysHaveContent = selectedDates.some((selectedDate) =>
        datoerMedInnhold.has(formatDate(selectedDate)),
    );
    const hasSelectedDisabledDate = selectedDates.some(
        (selectedDate) => !datoerIGyldigePerioder.has(formatDate(selectedDate)) || isWeekend(selectedDate),
    );
    const kanRegistrereTid = selectedDates.length > 0 && !hasSelectedDisabledDate && !someSelectedDaysHaveContent;
    const kanSletteTid = selectedDates.length > 0 && someSelectedDaysHaveContent;

    useOnClickOutside(kalenderContainerRef, (event) => {
        if (visModal) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Element)) {
            clearSelectedDates();
            return;
        }

        if (!target.closest('.exempt-from-click-outside, .ReactModal__Overlay')) {
            clearSelectedDates();
        }
    });

    const kalenderdagerForYear = (year: number) =>
        kalenderdager.filter((kalenderdag) => dayjs(kalenderdag.date).year() === year);
    return (
        <div ref={kalenderContainerRef} style={{ maxWidth: '1000px' }}>
            {gyldigePerioderPerÅr.map(({ perioder, aar }) => {
                const kalenderdagerIÅr = kalenderdagerForYear(aar);
                return (
                    <div className="mt-3" key={aar}>
                        <TidsbrukKalenderÅr
                            aar={aar}
                            perioder={perioder}
                            dateContentRenderer={dateContentRenderer(kalenderdagerIÅr)}
                            kalenderdager={kalenderdagerIÅr}
                            selectedDates={selectedDates}
                            setSelectedDates={setSelectedDates}
                        />
                    </div>
                );
            })}
            {selectedDates.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <BodyShort>{`Valgte dager: ${selectedDates.length}`}</BodyShort>
                    {kanRegistrereTid && (
                        <Button variant="primary" onClick={toggleModal}>
                            Registrer tid
                        </Button>
                    )}
                    {kanSletteTid && (
                        <Button
                            icon={<TrashIcon />}
                            size="small"
                            variant="tertiary"
                            className="slett"
                            onClick={() => {
                                slettPeriode(selectedDates);
                                clearSelectedDates();
                            }}
                        >
                            Slett registrert tid
                        </Button>
                    )}
                </div>
            )}
            <Provider rootElement={kalenderContainerRef.current || undefined}>
                <Modal
                    className="venstrestilt max-w-112.5 exempt-from-click-outside"
                    open={visModal}
                    onClose={() => {
                        setVisModal(false);
                        clearSelectedDates();
                    }}
                    aria-label="Modal"
                >
                    <Modal.Body>
                        {visModal &&
                            React.cloneElement<ModalContentProps>(ModalContent, {
                                selectedDates,
                                toggleModal,
                                clearSelectedDates,
                            })}
                    </Modal.Body>
                </Modal>
            </Provider>
        </div>
    );
};

export default React.memo(TidsbrukKalenderContainer);
