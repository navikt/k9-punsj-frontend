import { initializeDate } from '../../utils/timeUtils';
import { IPeriode } from '../../models/types/Periode';

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriode | null) =>
    p ? `${initializeDate(p.fom).format('DD.MM.YYYY')} - ${initializeDate(p.tom).format('DD.MM.YYYY')}` : '-';

    export const periodeSpenn = (periode: IPeriode | undefined): string =>
    periode
        ? Object.values(periode)
            .map((dato) => dato || '..')
            .join('/')
        : '';
