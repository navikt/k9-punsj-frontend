import moment from 'moment';
import { IPeriode } from '../../models/types/Periode';

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriode | null) =>
    p ? `${moment(p.fom).format('DD.MM.YYYY')} - ${moment(p.tom).format('DD.MM.YYYY')}` : '-';

export const periodeSpenn = (periode: IPeriode | undefined): string =>
    periode
        ? Object.values(periode)
            .map((dato) => dato || '..')
            .join('/')
        : '';
