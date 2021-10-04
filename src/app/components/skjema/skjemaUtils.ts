import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IPeriode } from '../../models/types/Periode';

dayjs.extend(utc);

export const fjernIndexFraLabel = (label: string) => label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriode | null) =>
    p ? `${dayjs(p.fom).utc(true).format('DD.MM.YYYY')} - ${dayjs(p.tom).utc(true).format('DD.MM.YYYY')}` : '-';
