import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import React, { useMemo } from 'react';

import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';
import DateRange from 'app/models/types/DateRange';
import { getMonthsInDateRange } from 'app/utils';

import TidsbrukKalenderÅr from './TidsbrukKalenderÅr';

interface OwnProps {
    gyldigePerioder: IPeriode[];
    kalenderdager: KalenderDag[];
    ModalContent: React.ReactElement;
    dateContentRenderer: (kalenderdager: KalenderDag[]) => (date: Date, isDisabled?: boolean) => React.ReactNode;
    slettPeriode: (dates?: Date[]) => void;
}

const TidsbrukKalenderContainer = ({
    gyldigePerioder,
    kalenderdager,
    ModalContent,
    dateContentRenderer,
    slettPeriode,
}: OwnProps) => {
    const dateRanges = useMemo(
        () =>
            gyldigePerioder
                .filter((periode) => periode.fom && periode.tom)
                .map((periode) => ({ fom: new Date(periode.fom), tom: new Date(periode.tom) })),
        [gyldigePerioder],
    );
    const months = useMemo(
        () =>
            dateRanges
                .map((dateRange) => getMonthsInDateRange(dateRange))
                .flat()
                .sort((a, b) => (a.fom > b.fom ? 1 : -1)),
        [dateRanges],
    );

    const gyldigePerioderPerMåned = useMemo(() => {
        const reducer = (acc: DateRange[][], currentDateRange: DateRange) => {
            const indexOfArrayToInsertInto = acc.findIndex((dateRangeArr: DateRange[]) =>
                dateRangeArr.some((dateRange) => dayjs(dateRange.fom).isSame(currentDateRange.fom, 'month')),
            );
            if (indexOfArrayToInsertInto > -1 && currentDateRange) {
                const originalArray = acc[indexOfArrayToInsertInto];
                const mutableAccumulator = acc;
                mutableAccumulator[indexOfArrayToInsertInto] = [...originalArray, currentDateRange];
                return mutableAccumulator;
            }
            return [...acc, [currentDateRange]];
        };
        return months.reduce(reducer, []);
    }, [months]);

    const gyldigePerioderPerÅr = useMemo(
        () =>
            Object.entries(groupBy(gyldigePerioderPerMåned, (perioder) => dayjs(perioder[0].fom).year()))
                .map(([year, perioder]) => ({
                    aar: parseInt(year, 10),
                    perioder,
                }))
                .sort((a, b) => b.aar - a.aar),
        [gyldigePerioderPerMåned],
    );

    const kalenderdagerForYear = (year: number) =>
        kalenderdager.filter((kalenderdag) => dayjs(kalenderdag.date).year() === year);
    return (
        <div style={{ maxWidth: '1000px' }}>
            {gyldigePerioderPerÅr.map(({ perioder, aar }) => {
                const kalenderdagerIÅr = kalenderdagerForYear(aar);
                return (
                    <div className="mt-3" key={aar}>
                        <TidsbrukKalenderÅr
                            aar={aar}
                            perioder={perioder}
                            ModalContent={ModalContent}
                            dateContentRenderer={dateContentRenderer(kalenderdagerIÅr)}
                            kalenderdager={kalenderdagerIÅr}
                            slettPeriode={slettPeriode}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(TidsbrukKalenderContainer);
