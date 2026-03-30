import React from 'react';

import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { Heading } from '@navikt/ds-react';
import {
    ArbeidstidPeriodeMedTimer,
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    ITimerOgMinutterString,
    Periode,
} from 'app/models/types';
import { ArbeidstidInfo, IArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { formats, removeDatesFromPeriods } from 'app/utils';
import { arbeidstidPeriodeTilKalenderdag } from 'app/utils/mappingUtils';
import KalenderMedModal from '../calendar/KalenderMedModal';
import ArbeidstidPeriodeListe from '../timefoering/ArbeidstidPeriodeListe';
import FaktiskOgNormalTid from '../timefoering/FaktiskOgNormalTid';

export interface ArbeidstidKalenderProps {
    arbeidstidInfo?: ArbeidstidInfo | IArbeidstidInfo | null;
    updateSoknad: (v: IArbeidstidPeriodeMedTimer[]) => void;
    updateSoknadState?: (v: IArbeidstidPeriodeMedTimer[]) => void;
    søknadsperioder: IPeriode[];
}

const ArbeidstidKalender = ({
    arbeidstidInfo,
    updateSoknad,
    updateSoknadState,
    søknadsperioder = [],
}: ArbeidstidKalenderProps) => {
    const normalisertArbeidstidInfo = React.useMemo(() => new ArbeidstidInfo(arbeidstidInfo || {}), [arbeidstidInfo]);

    const save = (perioder: IArbeidstidPeriodeMedTimer[]) => {
        updateSoknad(perioder);
        updateSoknadState?.(perioder);
    };

    const lagreTimer = (
        { faktiskArbeidPerDag, jobberNormaltPerDag }: { faktiskArbeidPerDag: ITimerOgMinutterString; jobberNormaltPerDag: ITimerOgMinutterString },
        selectedDates: Date[],
    ) => {
        const eksisterende = removeDatesFromPeriods(normalisertArbeidstidInfo.perioder, selectedDates).map(
            (v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v),
        );
        const nye = selectedDates.map((day) => ({
            periode: new Periode({ fom: dayjs(day).format(formats.YYYYMMDD), tom: dayjs(day).format(formats.YYYYMMDD) }),
            faktiskArbeidPerDag,
            jobberNormaltPerDag,
        }));
        save([...eksisterende, ...nye]);
    };

    const slettDager = (selectedDates?: Date[]) => {
        if (!selectedDates) return;
        save(
            removeDatesFromPeriods(normalisertArbeidstidInfo.perioder, selectedDates).map(
                (v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v),
            ),
        );
    };

    return (
        <div className="mt-6">
            <Heading size="xsmall" className="mb-4">
                <FormattedMessage id="skjema.arbeid.arbeidstidKalender.header" />
            </Heading>

            <KalenderMedModal
                gyldigePerioder={søknadsperioder}
                kalenderdager={normalisertArbeidstidInfo.perioder
                    .map((p) => new ArbeidstidPeriodeMedTimer(p))
                    .flatMap(arbeidstidPeriodeTilKalenderdag)}
                tidModal={
                    <FaktiskOgNormalTid
                        heading="Registrer arbeidstid"
                        lagre={lagreTimer}
                        toggleModal={() => {}}
                        selectedDates={[]}
                    />
                }
                periodeListeModal={(close) => (
                    <ArbeidstidPeriodeListe
                        arbeidstidPerioder={normalisertArbeidstidInfo.perioder.map((p) => new ArbeidstidPeriodeMedTimer(p))}
                        soknadsperioder={søknadsperioder}
                        lagre={(periodeInfo) => {
                            save(periodeInfo);
                            close();
                        }}
                        avbryt={close}
                    />
                )}
                slettPeriode={slettDager}
                modalLabel="Periode med jobb modal"
            />
        </div>
    );
};

export default ArbeidstidKalender;
