import { IPeriode } from '../../models/types/Periode';
import moment from 'moment';

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriode | null) => {
    return p ? moment(p.fom).format('DD.MM.YYYY') + ' - ' + moment(p.tom).format('DD.MM.YYYY') : '-';
};
