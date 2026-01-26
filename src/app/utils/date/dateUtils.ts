import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const supportedFormats = ['YYYY-MM-DD', 'DD.MM.YYYY'];

// ============================================================================
// Initialization and Validation
// ============================================================================

export function initializeDate(dateString: string, formats = supportedFormats): Dayjs {
    return dayjs(dateString, formats).utc(true).startOf('day');
}

export const isValidDate = (date: any) => !isNaN(new Date(date) as any);

// ============================================================================
// Comparison and Sorting
// ============================================================================

export function isSameOrBeforeDate(date: Dayjs, otherDate: Dayjs) {
    const dateFormats = ['YYYY-MM-DD', 'DD.MM.YYYY'];
    const dateInQuestion = dayjs(date, dateFormats).utc(true);
    const formattedOtherDate = dayjs(otherDate, dateFormats).utc(true);
    return dateInQuestion.isBefore(formattedOtherDate) || dateInQuestion.isSame(formattedOtherDate);
}

export function dateSorter(date1: Dayjs, date2: Dayjs) {
    if (date1.isBefore(date2)) {
        return -1;
    }
    if (date2.isBefore(date1)) {
        return 1;
    }
    return 0;
}

export function dateStringSorter(date1: string, date2: string) {
    const date1AsDayjs = initializeDate(date1);
    const date2AsDayjs = initializeDate(date2);
    return dateSorter(date1AsDayjs, date2AsDayjs);
}
