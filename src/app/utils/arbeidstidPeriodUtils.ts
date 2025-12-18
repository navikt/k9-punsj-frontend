import dayjs from 'dayjs';

import { IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { formats, getDatesInDateRange, konverterPeriodeTilTimerOgMinutter, includesDate, findDateIntervalsFromDates } from 'app/utils';

/**
 * Grupperer sammenhengende arbeidsdager til perioder
 *
 * @param workDays - Liste over arbeidsdager som skal grupperes
 * @param templatePeriod - Template for å kopiere andre felter fra (faktiskArbeidPerDag, jobberNormaltPerDag, etc.)
 * @returns Liste over perioder med sammenhengende arbeidsdager
 */
export const groupConsecutiveWorkDays = (
    workDays: Date[],
    templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer>,
): Periodeinfo<IArbeidstidPeriodeMedTimer>[] => {
    if (workDays.length === 0) {
        return [];
    }

    const sortedWorkDays = workDays.sort((a, b) => a.getTime() - b.getTime());
    const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];
    let currentGroup: Date[] = [sortedWorkDays[0]];

    for (let i = 1; i < sortedWorkDays.length; i++) {
        const currentDay = sortedWorkDays[i];
        const previousDay = sortedWorkDays[i - 1];

        // Sjekker om dagene er sammenhengende (ingen helger mellom)
        const daysDiff = dayjs(currentDay).diff(dayjs(previousDay), 'day');

        if (daysDiff <= 1) {
            // Dager er sammenhengende, legg til i nåværende gruppe
            currentGroup.push(currentDay);
        } else {
            // Gap funnet, opprett periode fra nåværende gruppe og start ny gruppe
            if (currentGroup.length > 0) {
                periods.push({
                    ...templatePeriod,
                    periode: {
                        fom: dayjs(currentGroup[0]).format(formats.YYYYMMDD),
                        tom: dayjs(currentGroup[currentGroup.length - 1]).format(formats.YYYYMMDD),
                    },
                });
            }
            currentGroup = [currentDay];
        }
    }

    // Legg til siste gruppe
    if (currentGroup.length > 0) {
        periods.push({
            ...templatePeriod,
            periode: {
                fom: dayjs(currentGroup[0]).format(formats.YYYYMMDD),
                tom: dayjs(currentGroup[currentGroup.length - 1]).format(formats.YYYYMMDD),
            },
        });
    }

    return periods;
};

/**
 * Filtrerer bort helger fra perioder og grupperer sammenhengende arbeidsdager
 *
 * @param periods - Liste over perioder som skal filtreres
 * @returns Liste over perioder kun med arbeidsdager
 */
export const filterWeekendsFromPeriods = (
    periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
): Periodeinfo<IArbeidstidPeriodeMedTimer>[] => {
    const workDayPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    periods.forEach((period) => {
        if (!period.periode?.fom || !period.periode?.tom) {
            return;
        }

        const startDate = dayjs(period.periode.fom, formats.YYYYMMDD);
        const endDate = dayjs(period.periode.tom, formats.YYYYMMDD);

        // Hent alle arbeidsdager i perioden
        const allDays = getDatesInDateRange(
            { fom: startDate.toDate(), tom: endDate.toDate() },
            true, // onlyWeekDays = true
        );

        // Grupper sammenhengende arbeidsdager
        const workDayGroups = groupConsecutiveWorkDays(allDays, period);
        workDayPeriods.push(...workDayGroups);
    });

    return workDayPeriods;
};

/**
 * Håndterer overlapp mellom en ny periode og eksisterende perioder
 *
 * @param newPeriod - Ny periode som skal legges til
 * @param existingPeriods - Liste over eksisterende perioder
 * @returns Oppdatert liste over perioder uten overlapp
 */
export const handlePeriodOverlaps = (
    newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer>,
    existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
): Periodeinfo<IArbeidstidPeriodeMedTimer>[] => {
    if (!newPeriod.periode?.fom || !newPeriod.periode?.tom) {
        return existingPeriods;
    }

    const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
    const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);
    const updatedPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    existingPeriods.forEach((existingPeriod) => {
        if (!existingPeriod.periode?.fom || !existingPeriod.periode?.tom) {
            updatedPeriods.push(existingPeriod);
            return;
        }

        const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
        const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

        // Hvis eksisterende periode er helt innenfor den nye perioden, hopper vi over den
        if (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd)) {
            return;
        }

        // Hvis periodene overlapper delvis
        if (newStart.isSameOrBefore(existingEnd) && newEnd.isSameOrAfter(existingStart)) {
            // Hvis ny periode er helt innenfor eksisterende periode
            if (newStart.isSameOrAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) {
                // Deler opp eksisterende periode i tre deler
                if (existingStart.isBefore(newStart)) {
                    updatedPeriods.push({
                        ...existingPeriod,
                        periode: {
                            fom: existingStart.format(formats.YYYYMMDD),
                            tom: newStart.subtract(1, 'day').format(formats.YYYYMMDD),
                        },
                    });
                }
                if (newEnd.isBefore(existingEnd)) {
                    updatedPeriods.push({
                        ...existingPeriod,
                        periode: {
                            fom: newEnd.add(1, 'day').format(formats.YYYYMMDD),
                            tom: existingEnd.format(formats.YYYYMMDD),
                        },
                    });
                }
            }
            // Hvis ny periode overlapper delvis
            else {
                if (newStart.isBefore(existingStart)) {
                    updatedPeriods.push({
                        ...newPeriod,
                        periode: {
                            fom: newStart.format(formats.YYYYMMDD),
                            tom: existingStart.subtract(1, 'day').format(formats.YYYYMMDD),
                        },
                    });
                }
                if (newEnd.isAfter(existingEnd)) {
                    updatedPeriods.push({
                        ...newPeriod,
                        periode: {
                            fom: existingEnd.add(1, 'day').format(formats.YYYYMMDD),
                            tom: newEnd.format(formats.YYYYMMDD),
                        },
                    });
                }
            }
        } else {
            // Hvis periodene ikke overlapper, beholder eksisterende periode
            updatedPeriods.push(existingPeriod);
        }
    });

    // Legger til den nye perioden
    updatedPeriods.push(newPeriod);
    return updatedPeriods;
};

/**
 * Hovedfunksjon for å behandle arbeidstidperioder
 *
 * @param newPeriods - Nye perioder som skal legges til
 * @param existingPeriods - Eksisterende perioder
 * @param options - Alternativer for behandling
 * @returns Behandlet liste over perioder
 */
export const processArbeidstidPeriods = (
    newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
    existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
    options: { filterWeekends?: boolean } = {},
): Periodeinfo<IArbeidstidPeriodeMedTimer>[] => {
    let allPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [...existingPeriods];

    // Behandler nye perioder
    newPeriods.forEach((newPeriod) => {
        if (!newPeriod || !newPeriod.periode) return;

        // Filtrerer bort helger hvis det er aktivert
        let processedNewPeriods = [newPeriod];
        if (options.filterWeekends) {
            processedNewPeriods = filterWeekendsFromPeriods([newPeriod]);
        }

        // Behandler hver behandlet periode
        processedNewPeriods.forEach((processedPeriod) => {
            allPeriods = handlePeriodOverlaps(processedPeriod, allPeriods);
        });
    });

    // Sorterer perioder etter startdato og konverterer til riktig format
    return allPeriods
        .map((v) => konverterPeriodeTilTimerOgMinutter(v))
        .sort(
            (a, b) =>
                dayjs(a.periode?.fom, formats.YYYYMMDD).valueOf() - dayjs(b.periode?.fom, formats.YYYYMMDD).valueOf(),
        );
};

/**
 * Filtrerer perioder basert på søknadsperioder
 * Fjerner perioder som er helt utenfor søknadsperioder og kutter ned perioder som delvis overlapper
 * Fungerer for både arbeidstidperioder og tilsynperioder
 *
 * @param perioder - Liste over perioder som skal filtreres (arbeidstid eller tilsyn)
 * @param soknadsperioder - Liste over søknadsperioder som perioder må være innenfor
 * @returns Filtrert liste over perioder som kun inneholder datoer innenfor søknadsperioder
 */
export const filterPeriodsBySoknadsperioder = <T>(
    perioder: Periodeinfo<T>[],
    soknadsperioder: IPeriode[],
): Periodeinfo<T>[] => {
    // Hvis ingen søknadsperioder er definert, fjern alle arbeidstidperioder
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return [];
    }

    const filteredPeriods: Periodeinfo<T>[] = [];

    for (const periode of perioder) {
        // Hopp over perioder uten gyldig dato
        if (!periode.periode?.fom || !periode.periode?.tom) {
            continue;
        }

        // Hent alle datoer i perioden
        const dateRange = {
            fom: dayjs(periode.periode.fom, formats.YYYYMMDD).toDate(),
            tom: dayjs(periode.periode.tom, formats.YYYYMMDD).toDate(),
        };
        const datesInPeriod = getDatesInDateRange(dateRange);

        // Filtrer datoer som er innenfor søknadsperioder
        const validDates = datesInPeriod.filter((date) =>
            soknadsperioder.some((soknadsperiode) => {
                if (!soknadsperiode.fom || !soknadsperiode.tom) {
                    return false;
                }
                return includesDate(soknadsperiode, date);
            }),
        );

        // Hvis ingen datoer er gyldige, hopp over denne perioden
        if (validDates.length === 0) {
            continue;
        }

        // Hvis alle datoer er gyldige, behold perioden som den er
        if (validDates.length === datesInPeriod.length) {
            filteredPeriods.push(periode);
            continue;
        }

        // Hvis bare noen datoer er gyldige, del opp i nye perioder basert på gyldige datoer
        const validIntervals = findDateIntervalsFromDates(validDates);

        for (const interval of validIntervals) {
            if (interval.length > 0) {
                filteredPeriods.push({
                    ...periode,
                    periode: {
                        fom: dayjs(interval[0]).format(formats.YYYYMMDD),
                        tom: dayjs(interval[interval.length - 1]).format(formats.YYYYMMDD),
                    },
                });
            }
        }
    }

    return filteredPeriods;
};

/**
 * Filtrerer arbeidstidperioder basert på søknadsperioder
 * @deprecated Bruk filterPeriodsBySoknadsperioder i stedet
 */
export const filterArbeidstidPeriodsBySoknadsperioder = (
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
    soknadsperioder: IPeriode[],
): Periodeinfo<IArbeidstidPeriodeMedTimer>[] => {
    return filterPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);
};
