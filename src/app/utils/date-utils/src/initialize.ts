import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const supportedFormats = ['YYYY-MM-DD', 'DD.MM.YYYY'];

export default function initializeDate(dateString: string, formats = supportedFormats): dayjs.Dayjs {
    return dayjs(dateString, formats).utc(true).startOf('day');
}
