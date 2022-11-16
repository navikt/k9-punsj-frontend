import { KalenderDag } from 'app/models/KalenderDag';
import { ArbeidstidPeriodeMedTimer, PeriodeMedTimerMinutter } from 'app/models/types';
import { getDatesInDateRange } from './timeUtils';

// eslint-disable-next-line import/prefer-default-export
export const arbeidstidPeriodeTilKalenderdag = (arbeidstid: ArbeidstidPeriodeMedTimer): KalenderDag[] => {
    const dateRange = arbeidstid.periode.tilDateRange();
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: {
            timer: String(arbeidstid.faktiskArbeidPerDag.timer),
            minutter: String(arbeidstid.faktiskArbeidPerDag.minutter),
        },
        tidOpprinnelig: {
            timer: String(arbeidstid.jobberNormaltPerDag.timer),
            minutter: String(arbeidstid.jobberNormaltPerDag.minutter),
        },
    }));
};
export const periodeMedTimerTilKalenderdag = (periodeMedTimerOgMinutter: PeriodeMedTimerMinutter): KalenderDag[] => {
    const dateRange = periodeMedTimerOgMinutter.periode.tilDateRange();
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: {
            timer: String(periodeMedTimerOgMinutter.timer),
            minutter: String(periodeMedTimerOgMinutter.minutter),
        },
    }));
};
