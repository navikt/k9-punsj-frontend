import {TimeFormat}                     from 'app/models/enums';
import { Ukedag, UkedagNumber} from 'app/models/types';
import moment                           from 'moment';
import {IntlShape}                      from 'react-intl';
import intlHelper                       from './intlUtils';
import {IPeriode} from "../models/types/Periode";

export const datetime = (
    intl: IntlShape,
    outputFormat: TimeFormat,
    time?: string,
    inputFormat?: string
) => moment(time, inputFormat).format(intlHelper(intl, `tidsformat.${outputFormat}`));

export function durationToString(hours: number, minutes: number) {
    return moment.duration(hours*60+minutes, 'minutes').toISOString();
}

export function hoursFromString(iso8601duration: string) {
    return Math.floor(moment.duration(iso8601duration).asHours());
}

export function minutesFromString(iso8601duration: string) {
    return moment.duration(iso8601duration).asMinutes()%60;
}

export function convertNumberToUkedag(num: UkedagNumber): Ukedag {
    switch (num) {
        case 0: return 'mandag';
        case 1: return 'tirsdag';
        case 2: return 'onsdag';
        case 3: return 'torsdag';
        case 4: return 'fredag';
        case 5: return 'lørdag';
        case 6: return 'søndag';
    }
}

export function isWeekdayWithinPeriod(weekday: UkedagNumber, period?: IPeriode) {

    if (!period || !period.fom || period.fom === '' || !period.tom || period.tom === '') {return true}

    const start = moment(period.fom);
    const end = moment(period.tom);

    if (end.isBefore(start)) {return false}
    if (end.diff(start, 'days') >= 6) {return true;}

    const isoWeekday = weekday + 1;
    const isoWeekdayStart = start.isoWeekday();
    const isoWeekdayEnd = end.isoWeekday();

    if (isoWeekdayStart < isoWeekdayEnd) {
        return isoWeekday >= isoWeekdayStart && isoWeekday <= isoWeekdayEnd;
    } else if (isoWeekdayStart > isoWeekdayEnd) {
        return isoWeekday >= isoWeekdayStart || isoWeekday <= isoWeekdayEnd;
    } else {
        return isoWeekday === isoWeekdayStart;
    }
}

export const formatereTekstMedTimerOgMinutter = (tekst: string) => {
    const timer = hoursFromString(tekst);
    const minutter = minutesFromString(tekst);
    const minutterTekst = minutter > 1 ? `${minutter} minutter` : `${minutter} minutt`;
    const timerTekst = timer > 1 ? `${timer} timer` : `${timer} time`;
    if(minutter === 0 && timer > 0) return timerTekst;
    if(minutter > 0 && timer === 0) return minutterTekst;
    if(minutter === 0 && timer === 0) return '0';
    return `${timerTekst} og ${minutterTekst}`
};