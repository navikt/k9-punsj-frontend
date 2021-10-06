import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IPeriode } from '../../models/types/Periode';
import { initializeDate } from '../../utils/timeUtils';

dayjs.extend(utc);

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (periode: IPeriode | IPeriode[] | null): string => {
    if (periode) {
        if (!Array.isArray(periode)) {
            return `${initializeDate(periode.fom).format('DD.MM.YYYY')} - ${initializeDate(periode.tom).format(
                'DD.MM.YYYY'
            )}`;
        }
        if (periode.length > 0) {
            const formatertePerioder = periode.map(
                (p) => `${initializeDate(p.fom).format('DD.MM.YYYY')} - ${initializeDate(p.tom).format('DD.MM.YYYY')}`
            );
            return formatertePerioder.join(', ');
        }
    }
    return '-';
};
