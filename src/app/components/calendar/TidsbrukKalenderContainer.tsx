import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';
import { getMonthsInDateRange } from 'app/utils';
import React from 'react';
import TidsbrukKalender from './TidsbrukKalender';

interface OwnProps {
    gyldigePerioder: IPeriode[];
    kalenderdager: KalenderDag[];
    ModalContent: React.ReactElement;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
}

const TidsbrukKalenderContainer = ({ gyldigePerioder, kalenderdager, ModalContent, dateContentRenderer }: OwnProps) => {
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
                    kalenderdager={kalenderdager}
                    ModalContent={ModalContent}
                    dateContentRenderer={dateContentRenderer}
                />
            ))}
        </div>
    );
};

export default TidsbrukKalenderContainer;
