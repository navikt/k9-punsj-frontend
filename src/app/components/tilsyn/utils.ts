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
