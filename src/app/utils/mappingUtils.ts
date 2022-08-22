import { KalenderDag } from 'app/models/KalenderDag';
import { ArbeidstidPeriodeMedTimer } from 'app/models/types';
import { getDatesInDateRange } from './timeUtils';

// eslint-disable-next-line import/prefer-default-export
export const arbeidstidPeriodeTilKalenderdag = (arbeidstid: ArbeidstidPeriodeMedTimer): KalenderDag[] => {
    const dateRange = arbeidstid.periode.tilDateRange();
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: { timer: arbeidstid.faktiskArbeidTimerPerDag },
        tidOpprinnelig: { timer: arbeidstid.jobberNormaltTimerPerDag },
    }));
};
