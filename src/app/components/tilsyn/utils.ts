import { IOmsorgstid, Periode, Periodeinfo, PeriodeMedTimerMinutter } from 'app/models/types';
import { formats, includesDate, removeDatesFromPeriods } from 'app/utils';
import dayjs from 'dayjs';
import { ITilsynTidPayload } from './TilsynTid';

interface LagreTimerProps extends ITilsynTidPayload {
    perioderMedTimer: Periodeinfo<IOmsorgstid>[];

    updateSoknad: (v: Periodeinfo<IOmsorgstid>[]) => void;
    updateSoknadState: (v: Periodeinfo<IOmsorgstid>[]) => void;
}

export const tilsynLagreTimer = (props: LagreTimerProps) => {
    const { perioderMedTimer, selectedDates = [], timer, minutter, perDagString, tidsformat } = props;
    const { updateSoknad, updateSoknadState } = props;

    // Filter out dates that already exist in the periods
    const newDates = selectedDates.filter(
        (day) =>
            !perioderMedTimer.some((periodeInfo) => {
                const periode = periodeInfo?.periode;
                return periode ? includesDate(periode, day) : false;
            }),
    );

    // Create new periods for the filtered dates
    const newPeriods = newDates.map((day) => ({
        periode: new Periode({
            fom: dayjs(day).format(formats.YYYYMMDD),
            tom: dayjs(day).format(formats.YYYYMMDD),
        }),
        timer: timer?.toString(),
        minutter: minutter?.toString(),
        perDagString,
        tidsformat,
    })) as Periodeinfo<IOmsorgstid>[];

    // Combine existing and new periods
    const updatedPeriods = [...perioderMedTimer, ...newPeriods];

    // Update state
    updateSoknad(updatedPeriods);
    updateSoknadState(updatedPeriods);
};

export interface ISlettDagerProps {
    perioderMedTimer: Periodeinfo<IOmsorgstid>[];
    selectedDates?: Date[];

    updateSoknad: (v: Periodeinfo<IOmsorgstid>[]) => void;
    updateSoknadState: (v: Periodeinfo<IOmsorgstid>[]) => void;
}

export const tilsynSlettDager = (props: ISlettDagerProps) => {
    const { perioderMedTimer, selectedDates } = props;
    const { updateSoknad, updateSoknadState } = props;

    if (!selectedDates) {
        return;
    }

    const perioderFiltert = removeDatesFromPeriods(perioderMedTimer, selectedDates).map(
        (v: Periodeinfo<IOmsorgstid>) => new PeriodeMedTimerMinutter(v),
    );

    updateSoknad(perioderFiltert);
    updateSoknadState(perioderFiltert);
};

// Funksjon for å sjekke overlappende perioder
export const checkPeriodOverlapTilsyn = (periods: Periodeinfo<IOmsorgstid>[]) => {
    for (let i = 0; i < periods.length; i++) {
        const currentPeriod = periods[i];
        if (!currentPeriod.periode?.fom || !currentPeriod.periode?.tom) {
            return true; // Tomme datoer regnes som feil
        }

        const currentStart = dayjs(currentPeriod.periode.fom, formats.YYYYMMDD);
        const currentEnd = dayjs(currentPeriod.periode.tom, formats.YYYYMMDD);

        // Sjekker overlapp med andre perioder
        for (let j = i + 1; j < periods.length; j++) {
            const otherPeriod = periods[j];
            if (!otherPeriod.periode?.fom || !otherPeriod.periode?.tom) {
                return true; // Tomme datoer regnes som feil
            }

            const otherStart = dayjs(otherPeriod.periode.fom, formats.YYYYMMDD);
            const otherEnd = dayjs(otherPeriod.periode.tom, formats.YYYYMMDD);

            // Sjekker overlappende perioder
            // Perioder overlapper hvis:
            // 1. Starten på én periode er innenfor en annen periode
            // 2. Slutten på én periode er innenfor en annen periode
            // 3. Én periode inneholder en annen helt
            if (
                (currentStart.isSameOrAfter(otherStart) && currentStart.isSameOrBefore(otherEnd)) || // Starten på nåværende periode er innenfor en annen
                (currentEnd.isSameOrAfter(otherStart) && currentEnd.isSameOrBefore(otherEnd)) || // Slutten på nåværende periode er innenfor en annen
                (otherStart.isSameOrAfter(currentStart) && otherStart.isSameOrBefore(currentEnd)) || // Starten på annen periode er innenfor nåværende
                (otherEnd.isSameOrAfter(currentStart) && otherEnd.isSameOrBefore(currentEnd)) || // Slutten på annen periode er innenfor nåværende
                (currentStart.isSameOrBefore(otherStart) && currentEnd.isSameOrAfter(otherEnd)) || // Nåværende periode inneholder en annen helt
                (otherStart.isSameOrBefore(currentStart) && otherEnd.isSameOrAfter(currentEnd)) // Annen periode inneholder nåværende helt
            ) {
                return true; // Overlapp funnet
            }
        }
    }
    return false; // Ingen overlapp funnet
};
