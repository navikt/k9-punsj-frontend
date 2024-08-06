import { KalenderDag } from 'app/models/KalenderDag';
import { ArbeidstidPeriodeMedTimer, PeriodeMedTimerMinutter } from 'app/models/types';
import { Periode } from 'app/models/types/Periode';

import { getDatesInDateRange } from './timeUtils';

 import/prefer-default-export
export const arbeidstidPeriodeTilKalenderdag = (arbeidstid: ArbeidstidPeriodeMedTimer): KalenderDag[] => {
    const dateRange = new Periode(arbeidstid.periode).tilDateRange();
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
    const dateRange = new Periode(periodeMedTimerOgMinutter.periode).tilDateRange();
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: {
            timer: String(periodeMedTimerOgMinutter.timer),
            minutter: String(periodeMedTimerOgMinutter.minutter),
        },
    }));
};
