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
