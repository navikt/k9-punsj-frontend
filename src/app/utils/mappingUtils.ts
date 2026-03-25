import { KalenderDag } from 'app/models/KalenderDag';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, PeriodeMedTimerMinutter } from 'app/models/types';
import { Periode } from 'app/models/types/Periode';

import { getDatesInDateRange, Tidsformat } from './timeUtils';
import { timerMedDesimalerTilTimerOgMinutter } from './utils';

export const fraværPeriodeTilKalenderdag = (periode: IArbeidstidPeriodeMedTimer): KalenderDag[] => {
    if (!periode.periode) return [];
    const dateRange = new Periode(periode.periode).tilDateRange();
    const fromDesimal = (desimal: string | undefined) => {
        const [timer, minutter] = timerMedDesimalerTilTimerOgMinutter(
            Number((desimal || '0').replace(',', '.')),
        );
        return { timer, minutter };
    };
    const usesTimerOgMin = periode.tidsformat !== Tidsformat.Desimaler;
    const fraværTid = usesTimerOgMin
        ? { timer: String(periode.fraværPerDag?.timer || ''), minutter: String(periode.fraværPerDag?.minutter || '') }
        : fromDesimal(periode.fraværTimerPerDag);
    const normaltTid = usesTimerOgMin
        ? { timer: String(periode.jobberNormaltPerDag?.timer || ''), minutter: String(periode.jobberNormaltPerDag?.minutter || '') }
        : fromDesimal(periode.jobberNormaltTimerPerDag);
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: fraværTid,
        tidOpprinnelig: normaltTid,
    }));
};

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
