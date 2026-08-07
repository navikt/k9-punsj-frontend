import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BodyShort, ExpansionCard, Heading, Label } from '@navikt/ds-react';
import dayjs from 'dayjs';
import { uniq } from 'lodash';

import { KalenderDag } from 'app/models/KalenderDag';
import { getDatesInDateRange, getDatesInMonth, getMonthAndYear, isDateInDates, isWeekend } from 'app/utils';
import DateRange from '../../models/types/DateRange';
import CalendarGrid from './CalendarGrid';

export interface ModalContentProps {
    selectedDates?: Date[];
    toggleModal?: () => void;
    clearSelectedDates?: () => void;
}

interface OwnProps {
    gyldigePerioder: DateRange[];
    disableWeekends?: boolean;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    kalenderdager?: KalenderDag[];
    tittelRenderer?: (date: Date) => React.ReactNode;
    selectedDates: Date[];
    setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const TidsbrukKalender = ({
    gyldigePerioder,
    dateContentRenderer,
    kalenderdager,
    disableWeekends = true,
    tittelRenderer = getMonthAndYear,
    selectedDates,
    setSelectedDates,
}: OwnProps) => {
    const [shiftKeydown, setShiftKeydown] = useState(false);
    const [previouslySelectedDate, setPreviouslySelectedDate] = useState<Date | null>(null);
    const førsteGyldigePeriode = gyldigePerioder[0];

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                setShiftKeydown(true);
            }
            if (event.key === 'Escape') {
                setSelectedDates([]);
            }
        };
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                setShiftKeydown(false);
                setPreviouslySelectedDate(null);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [setSelectedDates]);

    const formatDate = useCallback((date: string | Date) => dayjs(date).format('YYYY-MM-DD'), []);

    const datoerIGyldigePerioder = useMemo(
        () =>
            new Set(
                gyldigePerioder.flatMap((gyldigPeriode) =>
                    Array.from(getDatesInDateRange(gyldigPeriode)).map(formatDate),
                ),
            ),
        [gyldigePerioder, formatDate],
    );
    const disabledDates = useMemo(() => {
        if (!førsteGyldigePeriode) {
            return [];
        }

        const datoer = gyldigePerioder.flatMap((gyldigPeriode) => getDatesInDateRange(gyldigPeriode));
        return getDatesInMonth(førsteGyldigePeriode.fom)
            .map((date) => {
                if (!isDateInDates(date, datoer) || (disableWeekends && isWeekend(date))) {
                    return date;
                }
                return false;
            })
            .filter((v) => v instanceof Date) as Date[];
    }, [førsteGyldigePeriode, gyldigePerioder, disableWeekends]);

    const toggleDay = (date: Date) => {
        setSelectedDates((currentSelectedDates) =>
            currentSelectedDates.some((v) => dayjs(v).isSame(date))
                ? currentSelectedDates.filter((v) => !dayjs(v).isSame(date))
                : [...currentSelectedDates, date],
        );
        setPreviouslySelectedDate(date);
    };

    const selectDates = (dates: Date[]) => {
        setSelectedDates((currentSelectedDates) =>
            uniq([...currentSelectedDates, ...dates]).filter((date) =>
                disabledDates.every((disabledDate) => !dayjs(disabledDate).isSame(date)),
            ),
        );
    };

    const selectRange = (date: Date): void => {
        if (!previouslySelectedDate) {
            toggleDay(date);
            return;
        }
        const dates = [previouslySelectedDate, date].sort((a, b) => a.getTime() - b.getTime());
        selectDates(getDatesInDateRange({ fom: dates[0], tom: dates[1] }));
    };

    const kalenderdagerIGyldigePerioder = useMemo(
        () =>
            kalenderdager
                ?.map((kalenderdag) => formatDate(kalenderdag.date))
                .filter((date) => datoerIGyldigePerioder.has(date)),
        [kalenderdager, datoerIGyldigePerioder, formatDate],
    );
    const harRegistrerteDager = Boolean(kalenderdagerIGyldigePerioder?.length);
    const [visKalender, setVisKalender] = useState<boolean>(harRegistrerteDager);
    const [harBrukerToggled, setHarBrukerToggled] = useState(false);
    const valgteDagerIMåned = useMemo(
        () =>
            selectedDates.filter((date) =>
                førsteGyldigePeriode ? dayjs(date).isSame(førsteGyldigePeriode.fom, 'month') : false,
            ),
        [førsteGyldigePeriode, selectedDates],
    );

    useEffect(() => {
        if (!harBrukerToggled && harRegistrerteDager) {
            setVisKalender(true);
        }
    }, [harBrukerToggled, harRegistrerteDager]);

    const toggleKalender = () => {
        setHarBrukerToggled(true);
        setVisKalender(!visKalender);
    };

    if (!førsteGyldigePeriode) {
        return null;
    }

    const tittel = (
        <>
            <Heading size="xsmall">{tittelRenderer(førsteGyldigePeriode.fom)}</Heading>
            {harRegistrerteDager ? (
                <BodyShort>
                    {`${kalenderdagerIGyldigePerioder?.length} ${kalenderdagerIGyldigePerioder?.length === 1 ? 'dag' : 'dager'} registrert`}
                </BodyShort>
            ) : (
                <BodyShort>Ingen dager registrert</BodyShort>
            )}
        </>
    );

    return (
        <ExpansionCard
            open={visKalender}
            onToggle={toggleKalender}
            aria-labelledby={førsteGyldigePeriode.fom.toISOString()}
            className="mt-3"
        >
            <ExpansionCard.Header>
                <Label>{tittel}</Label>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                {visKalender && (
                    <div className="exempt-from-click-outside">
                        <CalendarGrid
                            onDateClick={(date) => (shiftKeydown ? selectRange(date) : toggleDay(date))}
                            month={førsteGyldigePeriode}
                            disabledDates={disabledDates as Date[]}
                            disableWeekends={disableWeekends}
                            dateContentRenderer={dateContentRenderer}
                            selectedDates={selectedDates}
                        />
                        {selectedDates.length > 0 && (
                            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                                {valgteDagerIMåned.length > 0 && (
                                    <BodyShort>{`Valgt i denne måneden: ${valgteDagerIMåned.length} ${valgteDagerIMåned.length === 1 ? 'dag' : 'dager'}`}</BodyShort>
                                )}
                                <BodyShort>Fortsett nederst for å registrere</BodyShort>
                            </div>
                        )}
                    </div>
                )}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default React.memo(TidsbrukKalender);
