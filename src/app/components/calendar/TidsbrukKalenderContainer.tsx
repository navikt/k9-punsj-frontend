import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';
import DateRange from 'app/models/types/DateRange';
import { getMonthsInDateRange } from 'app/utils';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import React, { useRef } from 'react';
import TidsbrukKalender from './TidsbrukKalender';

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
    const ref = useRef();
    const dateRanges = gyldigePerioder
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: new Date(periode.fom), tom: new Date(periode.tom) }));
    const months = dateRanges
        .map((dateRange) => getMonthsInDateRange(dateRange))
        .flat()
        .sort((a, b) => (a.fom > b.fom ? 1 : -1));

    const reducer = (acc: DateRange[][], currentDateRange: DateRange) => {
        const indexOfArrayToInsertInto = acc.findIndex((dateRangeArr: DateRange[]) =>
            dateRangeArr.some((dateRange) => dayjs(dateRange.fom).isSame(currentDateRange.fom, 'month'))
        );
        if (indexOfArrayToInsertInto > -1 && currentDateRange) {
            const originalArray = acc[indexOfArrayToInsertInto];
            const mutableAccumulator = acc;
            mutableAccumulator[indexOfArrayToInsertInto] = [...originalArray, currentDateRange];
            return mutableAccumulator;
        }
        return [...acc, [currentDateRange]];
    };
    const gyldigePerioderPerMåned = months.reduce(reducer, []);
    const id = uniqueId('tidsbrukKalender');
    return (
        <div style={{ maxWidth: '1000px' }} id={id} ref={ref}>
            {gyldigePerioderPerMåned.map((perioder) => (
                <TidsbrukKalender
                    ref={ref}
                    key={perioder[0].fom.toString()}
                    gyldigePerioder={perioder}
                    ModalContent={ModalContent}
                    dateContentRenderer={dateContentRenderer(kalenderdager)}
                    kalenderdager={kalenderdager}
                    slettPeriode={slettPeriode}
                />
            ))}
        </div>
    );
};

export default TidsbrukKalenderContainer;
