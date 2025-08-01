import dayjs from 'dayjs';

import { IOmsorgstid, Periodeinfo } from 'app/models/types';

import { IArbeidstidPeriodeMedTimer, IPeriode, Periode } from '../models/types/Periode';
import { formats } from './formatUtils';
import {
    countDatesInDateRange,
    findDateIntervalsFromDates,
    initializeDate,
    removeDatesFromDateRange,
} from './timeUtils';

const sortPeriodsByFomDate = (period1: Periode, period2: Periode): number => {
    if (period1.startsBefore(period2)) {
        return -1;
    }
    if (period2.startsBefore(period1)) {
        return 1;
    }
    return 0;
};

const isDateSameOrBefore = (date: string, otherDate: string) => {
    const dateFormats = ['YYYY-MM-DD', 'DD.MM.YYYY'];
    const dateInQuestion = initializeDate(date, dateFormats);
    const formattedOtherDate = initializeDate(otherDate, dateFormats);
    return dateInQuestion.isBefore(formattedOtherDate) || dateInQuestion.isSame(formattedOtherDate);
};

const checkIfPeriodsAreEdgeToEdge = (period: Periode, otherPeriod: Periode) => {
    const dayAfterPeriod = initializeDate(period.tom).add(1, 'day');
    const startOfNextPeriod = initializeDate(otherPeriod.fom);
    return dayAfterPeriod.isSame(startOfNextPeriod);
};

export const slåSammenSammenhengendePerioder = (periods: Periode[]): Periode[] => {
    if (!periods || periods.length === 0) {
        return [];
    }

    const sortedPeriods = periods.sort((p1, p2) => sortPeriodsByFomDate(p1, p2));
    const combinedPeriods: Periode[] = [];

    const getFirstDate = (date1: string, date2: string) => {
        if (isDateSameOrBefore(date1, date2)) {
            return date1;
        }

        return date2;
    };

    const getLastDate = (date1: string, date2: string) => {
        if (isDateSameOrBefore(date1, date2)) {
            return date2;
        }

        return date1;
    };

    const checkIfPeriodCanBeCombinedWithPreviousPeriod = (period: Periode, previousPeriod?: Periode) => {
        if (!previousPeriod) {
            return false;
        }
        const hasOverlapWithPreviousPeriod = previousPeriod.includesDate(period.fom);
        const periodsAreEdgeToEdge = checkIfPeriodsAreEdgeToEdge(previousPeriod, period);
        return hasOverlapWithPreviousPeriod || periodsAreEdgeToEdge;
    };

    const combinePeriods = (period: Periode, otherPeriod: Periode) => {
        const firstFom = getFirstDate(period.fom, otherPeriod.fom);
        const lastTom = getLastDate(period.tom, otherPeriod.tom);
        const combinedPeriod = new Periode({ fom: firstFom, tom: lastTom });
        return combinedPeriod;
    };

    const addToListIfNotAdded = (period: Periode) => {
        const previousPeriod = combinedPeriods[combinedPeriods.length - 1];
        const canBeCombinedWithPreviousPeriod = checkIfPeriodCanBeCombinedWithPreviousPeriod(period, previousPeriod);

        if (canBeCombinedWithPreviousPeriod) {
            const combinedPeriod = combinePeriods(period, previousPeriod);
            combinedPeriods[combinedPeriods.length - 1] = combinedPeriod;
        } else {
            combinedPeriods.push(period);
        }
    };

    let skipNextPeriod = false;

    sortedPeriods.forEach((period, index, array) => {
        if (!skipNextPeriod) {
            const nextPeriod = array[index + 1];
            if (nextPeriod) {
                const hasOverlapWithNextPeriod = nextPeriod.includesDate(period.tom);
                const periodsAreEdgeToEdge = checkIfPeriodsAreEdgeToEdge(period, nextPeriod);

                if (hasOverlapWithNextPeriod || periodsAreEdgeToEdge) {
                    const combinedPeriod = combinePeriods(period, nextPeriod);
                    combinedPeriods.push(combinedPeriod);
                    skipNextPeriod = true;
                } else {
                    addToListIfNotAdded(period);
                }
            } else {
                addToListIfNotAdded(period);
            }
        } else {
            skipNextPeriod = false;
        }
    });
    return combinedPeriods;
};

export const removeDatesFromPeriods = (
    periods: Periodeinfo<IArbeidstidPeriodeMedTimer | IOmsorgstid>[],
    datesToBeRemoved: Date[],
) =>
    periods
        .map((periodeMedTimer) => {
            const periode = new Periode(periodeMedTimer?.periode || {});
            const dateRange = periode.tilDateRange();
            if (countDatesInDateRange(dateRange) > 1) {
                const filteredDates = removeDatesFromDateRange(dateRange, datesToBeRemoved);
                const dateIntervals = findDateIntervalsFromDates(filteredDates);

                const nyePerioder = dateIntervals.map((dateArray) => ({
                    fom: dayjs(dateArray[0]).format(formats.YYYYMMDD),
                    tom: dayjs(dateArray[dateArray.length - 1]).format(formats.YYYYMMDD),
                }));
                const perioderMedArbeidstid = nyePerioder.map((nyPeriode) => ({
                    ...periodeMedTimer,
                    periode: nyPeriode,
                }));

                return perioderMedArbeidstid;
            }
            return datesToBeRemoved.some((date) => periode.includesDate(date)) ? false : periodeMedTimer;
        })
        .filter(Boolean)
        .flat();

export const includesDate = (periode: IPeriode, day: string | Date) => {
    const dateInQuestion = initializeDate(day);

    const fomDayjs = initializeDate(periode.fom);
    const tomDayjs = initializeDate(periode.tom);

    return (
        (dateInQuestion.isSame(fomDayjs) || dateInQuestion.isAfter(fomDayjs)) &&
        (dateInQuestion.isSame(tomDayjs) || dateInQuestion.isBefore(tomDayjs))
    );
};

/**
 * Sjekker om arbeidstidperioder er innenfor søknadsperioder
 * Hver arbeidstidperiode må være helt innenfor én søknadsperiode
 *
 * @param arbeidstidPerioder - Liste over arbeidstidperioder som skal valideres
 * @param soknadsperioder - Liste over søknadsperioder som arbeidstidperioder må være innenfor
 * @returns true hvis noen periode er utenfor søknadsperioder, false hvis alle perioder er innenfor
 */
export const checkArbeidstidWithinSoknadsperioder = (
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
    soknadsperioder: IPeriode[],
): boolean => {
    // Hvis ingen søknadsperioder er definert, returnerer vi false (ingen validering)
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return false;
    }

    // Går gjennom hver arbeidstidperiode
    for (const arbeidstidPeriode of arbeidstidPerioder) {
        // Hopp over perioder uten gyldig dato
        if (!arbeidstidPeriode.periode?.fom || !arbeidstidPeriode.periode?.tom) {
            continue;
        }

        const arbeidstidStart = dayjs(arbeidstidPeriode.periode.fom, formats.YYYYMMDD);
        const arbeidstidEnd = dayjs(arbeidstidPeriode.periode.tom, formats.YYYYMMDD);

        // Sjekker om arbeidstidperioden er helt innenfor minst én søknadsperiode
        const erInnenforEnSoknadsperiode = soknadsperioder.some((soknadsperiode) => {
            // Hopp over søknadsperioder uten gyldig dato
            if (!soknadsperiode.fom || !soknadsperiode.tom) {
                return false;
            }

            const soknadsStart = dayjs(soknadsperiode.fom, formats.YYYYMMDD);
            const soknadsEnd = dayjs(soknadsperiode.tom, formats.YYYYMMDD);

            // Arbeidstidperioden må være helt innenfor søknadsperioden
            // Starter på eller etter start av søknadsperiode og slutter på eller før slutt av søknadsperiode
            return arbeidstidStart.isSameOrAfter(soknadsStart) && arbeidstidEnd.isSameOrBefore(soknadsEnd);
        });

        // Hvis denne arbeidstidperioden ikke er innenfor noen søknadsperiode, returnerer vi true (validering feilet)
        if (!erInnenforEnSoknadsperiode) {
            return true;
        }
    }

    // Alle arbeidstidperioder er innenfor søknadsperioder
    return false;
};

/**
 * Formaterer søknadsperioder til lesbar tekst
 * @param soknadsperioder - Liste over søknadsperioder som skal formateres
 * @returns Formatert streng med perioder
 */
export const formatSoknadsperioder = (soknadsperioder: IPeriode[]): string => {
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return '';
    }

    return soknadsperioder
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => {
            const fom = dayjs(periode.fom, formats.YYYYMMDD).format('DD.MM.YYYY');
            const tom = dayjs(periode.tom, formats.YYYYMMDD).format('DD.MM.YYYY');
            return `${fom} - ${tom}`;
        })
        .join(', ');
};

/**
 * Sjekker om perioder er innenfor søknadsperioder
 * Hver periode må være helt innenfor én søknadsperiode
 *
 * @param perioder - Liste over perioder som skal valideres
 * @param soknadsperioder - Liste over søknadsperioder som perioder må være innenfor
 * @returns true hvis noen periode er utenfor søknadsperioder, false hvis alle perioder er innenfor
 */
export const checkPeriodsWithinSoknadsperioder = <T>(
    perioder: Periodeinfo<T>[],
    soknadsperioder: IPeriode[],
): boolean => {
    // Hvis ingen søknadsperioder er definert, returnerer vi false (ingen validering)
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return false;
    }

    // Går gjennom hver periode
    for (const periode of perioder) {
        // Hopp over perioder uten gyldig dato
        if (!periode.periode?.fom || !periode.periode?.tom) {
            continue;
        }

        const periodeStart = dayjs(periode.periode.fom, formats.YYYYMMDD);
        const periodeEnd = dayjs(periode.periode.tom, formats.YYYYMMDD);

        // Sjekker om perioden er helt innenfor minst én søknadsperiode
        const erInnenforEnSoknadsperiode = soknadsperioder.some((soknadsperiode) => {
            // Hopp over søknadsperioder uten gyldig dato
            if (!soknadsperiode.fom || !soknadsperiode.tom) {
                return false;
            }

            const soknadsStart = dayjs(soknadsperiode.fom, formats.YYYYMMDD);
            const soknadsEnd = dayjs(soknadsperiode.tom, formats.YYYYMMDD);

            // Perioden må være helt innenfor søknadsperioden
            // Starter på eller etter start av søknadsperiode og slutter på eller før slutt av søknadsperiode
            return periodeStart.isSameOrAfter(soknadsStart) && periodeEnd.isSameOrBefore(soknadsEnd);
        });

        // Hvis denne perioden ikke er innenfor noen søknadsperiode, returnerer vi true (validering feilet)
        if (!erInnenforEnSoknadsperiode) {
            return true;
        }
    }

    // Alle perioder er innenfor søknadsperioder
    return false;
};
