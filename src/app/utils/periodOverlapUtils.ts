import dayjs from 'dayjs';
import { IPeriode } from '../models/types/Periode';
import { formats } from './formatUtils';
import { getDatesInDateRange, initializeDate } from './timeUtils';

export type PeriodOverlapType = 'start' | 'middle' | 'end' | 'whole' | null;

export interface PeriodOverlapResult {
    completelyRemoved: IPeriode[];
    affectedByStart: IPeriode[];
    affectedByMiddle: IPeriode[];
    affectedByEnd: IPeriode[];
}

/**
 * Formats a period for display in DD.MM.YYYY - DD.MM.YYYY format
 */
export const formatPeriodeForDisplay = (periode: IPeriode): string => {
    const fom = dayjs(periode.fom, formats.YYYYMMDD).format('DD.MM.YYYY');
    const tom = dayjs(periode.tom, formats.YYYYMMDD).format('DD.MM.YYYY');
    return `${fom} - ${tom}`;
};

/**
 * Adds a period to an array if it doesn't already exist (based on fom/tom equality)
 */
const addPeriodeIfNotExists = (array: IPeriode[], periode: IPeriode): void => {
    const exists = array.some((p) => p.fom === periode.fom && p.tom === periode.tom);
    if (!exists) {
        array.push(periode);
    }
};

/**
 * Checks the type of overlap between a period to remove and an existing period
 * Returns:
 * - 'whole': The entire existing period is being removed
 * - 'start': Only the start of the existing period is affected
 * - 'middle': The middle of the existing period is affected (splits it)
 * - 'end': Only the end of the existing period is affected
 * - null: No overlap
 */
export const checkOverlapType = (periodeToRemove: IPeriode, eksisterendePeriode: IPeriode): PeriodOverlapType => {
    // Get all dates from both periods
    const removeDates = getDatesInDateRange({
        fom: initializeDate(periodeToRemove.fom, formats.YYYYMMDD).toDate(),
        tom: initializeDate(periodeToRemove.tom, formats.YYYYMMDD).toDate(),
    });
    const eksisterendeDates = getDatesInDateRange({
        fom: initializeDate(eksisterendePeriode.fom, formats.YYYYMMDD).toDate(),
        tom: initializeDate(eksisterendePeriode.tom, formats.YYYYMMDD).toDate(),
    });

    // Find overlapping dates
    const overlappingDates = removeDates.filter((removeDate) =>
        eksisterendeDates.some((eksisterendeDate) => dayjs(removeDate).isSame(eksisterendeDate, 'day')),
    );

    if (overlappingDates.length === 0) {
        return null;
    }

    const eksisterendeStart = dayjs(eksisterendePeriode.fom, formats.YYYYMMDD);
    const eksisterendeEnd = dayjs(eksisterendePeriode.tom, formats.YYYYMMDD);
    const firstOverlap = dayjs(overlappingDates[0]);
    const lastOverlap = dayjs(overlappingDates[overlappingDates.length - 1]);

    // Check if overlap is in the middle (doesn't touch start or end)
    const touchesStart = firstOverlap.isSame(eksisterendeStart, 'day');
    const touchesEnd = lastOverlap.isSame(eksisterendeEnd, 'day');

    // If it touches both start and end, the entire period is being removed
    if (touchesStart && touchesEnd) {
        return 'whole';
    }
    if (!touchesStart && !touchesEnd) {
        return 'middle';
    }
    if (touchesStart && !touchesEnd) {
        return 'start';
    }
    if (!touchesStart && touchesEnd) {
        return 'end';
    }
    return null;
};

/**
 * Analyzes how periods to remove affect existing periods
 * Returns categorized lists of affected periods by overlap type
 */
export const findPeriodOverlaps = (
    periodsToRemove: IPeriode[],
    eksisterendePerioder: IPeriode[],
): PeriodOverlapResult => {
    const affectedByStart: IPeriode[] = [];
    const affectedByMiddle: IPeriode[] = [];
    const affectedByEnd: IPeriode[] = [];
    const completelyRemoved: IPeriode[] = [];

    const komplettePerioder = periodsToRemove.filter((periode) => periode.fom && periode.tom);

    komplettePerioder.forEach((periodeToRemove) => {
        eksisterendePerioder.forEach((eksisterendePeriode) => {
            const overlapType = checkOverlapType(periodeToRemove, eksisterendePeriode);
            if (overlapType === 'whole') {
                addPeriodeIfNotExists(completelyRemoved, eksisterendePeriode);
            } else if (overlapType === 'start') {
                addPeriodeIfNotExists(affectedByStart, eksisterendePeriode);
            } else if (overlapType === 'middle') {
                addPeriodeIfNotExists(affectedByMiddle, eksisterendePeriode);
            } else if (overlapType === 'end') {
                addPeriodeIfNotExists(affectedByEnd, eksisterendePeriode);
            }
        });
    });

    return {
        completelyRemoved,
        affectedByStart,
        affectedByMiddle,
        affectedByEnd,
    };
};
