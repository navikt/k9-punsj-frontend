import {TimeFormat} from 'app/models/enums';
import moment       from 'moment';
import {IntlShape}  from 'react-intl';
import intlHelper   from './intlUtils';

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