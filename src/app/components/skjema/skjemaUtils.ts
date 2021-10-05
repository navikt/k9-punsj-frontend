import { initializeDate } from 'app/utils';
import { IPeriode } from '../../models/types/Periode';

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriode | null) =>
    p ? `${initializeDate(p.fom).format('DD.MM.YYYY')} - ${initializeDate(p.tom).format('DD.MM.YYYY')}` : '-';
