import React from 'react';

import dayjs from 'dayjs';
import { Heading } from '@navikt/ds-react';

import { IArbeidstidPeriodeMedTimer, IPeriode } from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { Periode } from 'app/models/types/Periode';
import { formats } from 'app/utils';
import { fraværPeriodeTilKalenderdag } from 'app/utils/mappingUtils';
import { removeDatesFromPeriods } from 'app/utils/periodUtils';
import KalenderMedModal from 'app/components/calendar/KalenderMedModal';

import FraværTid, { FraværTidPayload } from './FraværTid';
import FraværPeriodeListe from './FraværPeriodeListe';

interface Props {
    arbeidstidInfo: ArbeidstidInfo | null | undefined;
    søknadsperioder: IPeriode[];
    updateSoknad: (perioder: IArbeidstidPeriodeMedTimer[]) => void;
}

const FraværKalender = ({ arbeidstidInfo, søknadsperioder, updateSoknad }: Props) => {
    const perioder = (arbeidstidInfo?.perioder ?? []) as IArbeidstidPeriodeMedTimer[];

    const lagreTimer = ({ tidsformat, fraværTimerPerDag, jobberNormaltTimerPerDag, fraværPerDag, jobberNormaltPerDag, selectedDates = [] }: FraværTidPayload) => {
        const eksisterende = removeDatesFromPeriods(perioder, selectedDates) as IArbeidstidPeriodeMedTimer[];
        const nye: IArbeidstidPeriodeMedTimer[] = selectedDates.map((day) => ({
            periode: new Periode({ fom: dayjs(day).format(formats.YYYYMMDD), tom: dayjs(day).format(formats.YYYYMMDD) }),
            tidsformat,
            fraværTimerPerDag,
            jobberNormaltTimerPerDag,
            fraværPerDag,
            jobberNormaltPerDag,
        }));
        updateSoknad([...eksisterende, ...nye]);
    };

    const slettDager = (selectedDates?: Date[]) => {
        if (!selectedDates) return;
        updateSoknad(removeDatesFromPeriods(perioder, selectedDates) as IArbeidstidPeriodeMedTimer[]);
    };

    return (
        <>
            <Heading size="xsmall" className="mb-4">Fravær</Heading>

            <KalenderMedModal
                gyldigePerioder={søknadsperioder}
                kalenderdager={perioder
                    .filter((p) => p.fraværTimerPerDag !== undefined || p.fraværPerDag !== undefined || p.jobberNormaltTimerPerDag !== undefined || p.jobberNormaltPerDag !== undefined)
                    .flatMap(fraværPeriodeTilKalenderdag)}
                tidModal={<FraværTid heading="Registrer fravær" lagre={lagreTimer} />}
                periodeListeModal={(close) => (
                    <FraværPeriodeListe
                        perioder={perioder}
                        soknadsperioder={søknadsperioder}
                        lagre={(nyePerioder) => { updateSoknad(nyePerioder as IArbeidstidPeriodeMedTimer[]); close(); }}
                        avbryt={close}
                    />
                )}
                slettPeriode={slettDager}
                lengrePeriodeIntlId="skjema.fravaer.registrerFraværLengrePeriode"
                modalLabel="Periode med fravær modal"
            />
        </>
    );
};

export default FraværKalender;
