import dayjs, { Dayjs } from 'dayjs';
import initializeDate from './initialize';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const prettyDateFormat = 'DD.MM.YYYY';

export const INVALID_DATE_VALUE = 'Invalid date';
export const INPUT_DATE_STRING_FORMAT: InputDateString = 'DD.MM.YYYY';

const ALLOWED_INPUT_FORMATS = [
    INPUT_DATE_STRING_FORMAT,
    'DDMMYYYY',
    'DD/MM/YYYY',
    'DD-MM-YYYY',
    'DDMMYY',
    'D.M.YY',
    'DD.MM.YY',
    'D.M.YYYY',
];

/** YYYY-MM-DD */
export type ISODateString = string;

/** DD-MM-YYYY */
export type InputDateString = string;

/** Type used when input date is invalid  */
export type INVALID_DATE_TYPE = 'Invalid date';

export const ISO_DATE_STRING_FORMAT: ISODateString = 'YYYY-MM-DD';

const stringToUTCDate = (dateString: string | undefined, dateFormat: string): Date | undefined => {
    if (dateString !== undefined && dateString.trim && dateString.trim().length === 10) {
        const d = dayjs(dateString, dateFormat).utc(true);
        return d.isValid() ? d.toDate() : undefined;
    }
    return undefined;
};

export const dateToISODateString = (date: Date): ISODateString | INVALID_DATE_TYPE => {
    const d = dayjs(date);
    return d.isValid() ? d.format(ISO_DATE_STRING_FORMAT) : date.toString();
};

export const ISODateStringToUTCDate = (isoDateString?: ISODateString): Date | undefined => {
    return stringToUTCDate(isoDateString, ISO_DATE_STRING_FORMAT);
};

export const prettifyDate = (date: Dayjs) => {
    return date.format(prettyDateFormat);
};

export const prettifyDateString = (dateString: string) => {
    const dateObject = initializeDate(dateString);
    return prettifyDate(dateObject);
};

export const isISODateString = (value: any): value is ISODateString => {
    if (value && typeof value === 'string') {
        const reg = /^\d{4}-\d{2}-\d{2}$/;
        const match: RegExpMatchArray | null = value.match(reg);
        return match !== null;
    } else {
        return false;
    }
};

export const InputDateStringToISODateString = (inputDateString: InputDateString): string | INVALID_DATE_TYPE => {
    const date = dayjs(inputDateString, ALLOWED_INPUT_FORMATS, true).utc(true);
    return date.isValid() ? dateToISODateString(date.toDate()) : INVALID_DATE_VALUE;
};
