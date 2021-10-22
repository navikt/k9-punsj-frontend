import { initializeDate } from '../../utils/timeUtils';
import { IPeriode } from '../../models/types/Periode';

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

export const periodeSpenn = (periode: IPeriode | undefined): string =>
    periode
        ? Object.values(periode)
            .map((dato) => `${dato}` || '..')
            .join('/')
        : '';
