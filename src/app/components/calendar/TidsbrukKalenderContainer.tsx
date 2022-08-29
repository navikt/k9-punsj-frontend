import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';
import { getMonthsInDateRange } from 'app/utils';
import React from 'react';
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
    const dateRanges = gyldigePerioder
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: new Date(periode.fom), tom: new Date(periode.tom) }));
    const months = dateRanges.map((dateRange) => getMonthsInDateRange(dateRange)).flat();
    return (
        <div style={{ maxWidth: '1000px' }}>
            {months.map((month) => (
                <TidsbrukKalender
                    key={month.fom.toString()}
                    gyldigPeriode={month}
                    ModalContent={ModalContent}
                    dateContentRenderer={dateContentRenderer(kalenderdager)}
                    slettPeriode={slettPeriode}
                />
            ))}
        </div>
    );
};

export default TidsbrukKalenderContainer;
