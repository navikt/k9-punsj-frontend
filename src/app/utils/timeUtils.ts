import dayjs from 'dayjs';
import 'dayjs/locale/nb';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import { capitalize } from 'lodash';
import { IntlShape } from 'react-intl';

import { TimeFormat } from '../models/enums';
import { Ukedag, UkedagNumber } from '../models/types';
import DateRange from '../models/types/DateRange';
import { IPeriode } from '../models/types/Periode';
import intlHelper from './intlUtils';

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('nb');

export enum Tidsformat {
    TimerOgMin = 'timerOgMin',
    Desimaler = 'desimaler',
}

export const initializeDate = (date?: string | Date | null, format?: string | string[]): dayjs.Dayjs => {
    if (date) {
        return dayjs(date, format).utc(true);
    }
    return dayjs().utc(true);
};

export const datetime = (intl: IntlShape, outputFormat: TimeFormat, time?: string, inputFormat?: string) =>
    initializeDate(time, inputFormat).format(intlHelper(intl, `tidsformat.${outputFormat}`));

export function durationToString(hours: number, minutes: number) {
    return dayjs.duration(hours * 60 + minutes, 'minutes').toISOString();
}

export function hoursFromString(iso8601duration: string) {
    return Math.floor(dayjs.duration(iso8601duration).asHours());
}

export function minutesFromString(iso8601duration: string) {
    return dayjs.duration(iso8601duration).asMinutes() % 60;
}

export function convertNumberToUkedag(num: UkedagNumber): Ukedag | string {
    switch (num) {
        case 0:
            return 'mandag';
        case 1:
            return 'tirsdag';
        case 2:
            return 'onsdag';
        case 3:
            return 'torsdag';
        case 4:
            return 'fredag';
        case 5:
            return 'lørdag';
        case 6:
            return 'søndag';
        default:
            return '';
    }
}

export function isWeekdayWithinPeriod(weekday: UkedagNumber, period?: IPeriode) {
    if (!period || !period.fom || period.fom === '' || !period.tom || period.tom === '') {
        return true;
    }

    const start = initializeDate(period.fom);
    const end = initializeDate(period.tom);

    if (end.isBefore(start)) {
        return false;
    }
    if (end.diff(start, 'days') >= 6) {
        return true;
    }

    const isoWeekday = weekday + 1;
    const isoWeekdayStart = start.isoWeekday();
    const isoWeekdayEnd = end.isoWeekday();

    if (isoWeekdayStart < isoWeekdayEnd) {
        return isoWeekday >= isoWeekdayStart && isoWeekday <= isoWeekdayEnd;
    }
    if (isoWeekdayStart > isoWeekdayEnd) {
        return isoWeekday >= isoWeekdayStart || isoWeekday <= isoWeekdayEnd;
    }
    return isoWeekday === isoWeekdayStart;
}

export const formatereTekstMedTimerOgMinutter = (tekst: string) => {
    const timer = hoursFromString(tekst);
    const minutter = minutesFromString(tekst);
    const minutterTekst = minutter > 1 ? `${minutter} minutter` : `${minutter} minutt`;
    const timerTekst = timer > 1 ? `${timer} timer` : `${timer} time`;
    if (minutter === 0 && timer > 0) return timerTekst;
    if (minutter > 0 && timer === 0) return minutterTekst;
    if (minutter === 0 && timer === 0) return '0';
    return `${timerTekst} og ${minutterTekst}`;
};

export const formattereDatoFraUTCTilGMT = (dato: string) => {
    const formattedDate = new Date(dato).toLocaleDateString(['nb-NO'], {
        timeZone: 'Europe/Oslo',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formattedDate;
};
export const formattereTidspunktFraUTCTilGMT = (dato: string): string => {
    const datoTmp = new Date(dato);
    if (Number.isNaN(datoTmp.getTime())) {
        return dato.substr(11, 5);
    }
    const datoTilGMT = datoTmp.toLocaleTimeString([], {
        timeZone: 'Europe/Oslo',
        hour12: false,
    });
    return datoTilGMT.substr(0, 5);
};

export const isDateInDates = (date: Date, dates?: Date[]): boolean => {
    if (!dates) {
        return false;
    }
    return dates.some((d) => dayjs(date).isSame(d, 'day'));
};

export const isDateWeekDay = (date: Date): boolean => dayjs(date).isoWeekday() <= 5;

export const getDatesInDateRange = (dateRange: DateRange, onlyWeekDays = false): Date[] => {
    const dates: Date[] = [];
    let current = dayjs(dateRange.fom);
    do {
        const date = current.toDate();
        if (onlyWeekDays === false || isDateWeekDay(date)) {
            dates.push(date);
        }
        current = current.add(1, 'day');
    } while (current.isSameOrBefore(dateRange.tom, 'day'));
    return dates;
};

export const countDatesInDateRange = (dateRange: DateRange) => getDatesInDateRange(dateRange).length;
export const removeDatesFromDateRange = (dateRange: DateRange, listOfDatesToRemove: Date[]) => {
    const datesInDateRange = getDatesInDateRange(dateRange);
    return datesInDateRange.filter(
        (date) => !listOfDatesToRemove.some((dateToRemove) => dayjs(date).isSame(dateToRemove, 'day')),
    );
};

export const findDateIntervalsFromDates = (dates: Date[]) => {
    const reducer = (accumulator: Date[][], currentDate: Date) => {
        let dateToAdd;
        const indexOfArrayToUpdate = accumulator.findIndex((dateArray: Date[]) =>
            dateArray.some((date: Date) => {
                const isSameDay = dayjs(date).add(1, 'day').isSame(dayjs(currentDate), 'day');
                if (isSameDay) {
                    dateToAdd = currentDate;
                }
                return isSameDay;
            }),
        );
        if (indexOfArrayToUpdate > -1 && dateToAdd) {
            const originalArray = accumulator[indexOfArrayToUpdate];
            const mutableAccumulator = accumulator;
            mutableAccumulator[indexOfArrayToUpdate] = [...originalArray, dateToAdd];
            return mutableAccumulator;
        }

        return [...accumulator, [currentDate]];
    };

    return dates.reduce(reducer, []);
};

export const getFirstWeekDayInMonth = (month: Date): Date => {
    const firstDay = dayjs(month).startOf('month');
    if (firstDay.isoWeekday() > 5) {
        return firstDay.add(8 - firstDay.isoWeekday(), 'days').toDate();
    }
    return firstDay.toDate();
};

export const getLastWeekdayOnOrBeforeDate = (date: Date): Date => {
    const isoWeekDay = dayjs(date).isoWeekday();
    return isoWeekDay <= 5 ? date : dayjs(date).startOf('isoWeek').add(4, 'days').toDate();
};

export const getLastWeekDayInMonth = (month: Date): Date =>
    getLastWeekdayOnOrBeforeDate(dayjs(month).endOf('month').toDate());

/**
 * Returns a DateRange for the month which date is a part of.
 * @param date
 * @param onlyWeekDays Exclude saturday and sunday from dateRange
 * @returns DateRange
 */
export const getMonthDateRange = (date: Date, onlyWeekDays = false): DateRange => ({
    fom: onlyWeekDays ? getFirstWeekDayInMonth(date) : dayjs(date).startOf('month').toDate(),
    tom: onlyWeekDays ? getLastWeekDayInMonth(date) : dayjs(date).endOf('month').toDate(),
});

export const getDatesInMonth = (month: Date, onlyWeekDays = false): Date[] =>
    getDatesInDateRange(getMonthDateRange(month, onlyWeekDays), onlyWeekDays);

export const dateToISODate = (date: Date): string => dayjs(date).format('YYYY-MM-DD');

/**
 * Returns array of DateRange representing the months in @dateRange.
 * @param dateRange
 * @param returnFullMonths Set to return full months, not cap the months by @dateRange
 * @returns array of DateRange
 */
export const getMonthsInDateRange = (dateRange: DateRange, returnFullMonths = false): DateRange[] => {
    const months: DateRange[] = [];
    let current = dayjs(dateRange.fom);
    do {
        const fom: Date = returnFullMonths ? current.startOf('month').toDate() : current.toDate();
        const endOfMonth = dayjs(fom).endOf('month').toDate();
        const tom =
            dayjs(endOfMonth).isAfter(dateRange.tom, 'day') && returnFullMonths === false ? dateRange.tom : endOfMonth;

        months.push({ fom, tom });
        current = current.add(1, 'month').startOf('month');
    } while (current.isSameOrBefore(dateRange.tom, 'day'));
    return months;
};

export const isWeekend = (date: Date) => [0, 6].includes(date.getDay());

export const getMonthAndYear = (date: Date) => `${capitalize(dayjs(date).format('MMMM'))} ${date.getFullYear()}`;

export const prettifyDateRange = (dateRange: string): string => {
    const formatDate = (date: string) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();
        return `${day}.${month}.${year}`;
    };

    const [startDate, endDate] = dateRange.split('/');
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
