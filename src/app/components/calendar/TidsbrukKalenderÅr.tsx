import React, { useState } from 'react';

import { ExpansionCard, Heading } from '@navikt/ds-react';

import { KalenderDag } from 'app/models/KalenderDag';
import DateRange from 'app/models/types/DateRange';

import TidsbrukKalender from './TidsbrukKalender';

type Props = {
    aar: number;
    perioder: DateRange[][];
    kalenderdager: KalenderDag[];
    ModalContent: React.ReactElement;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    slettPeriode: (dates?: Date[]) => void;
};

const TidsbrukKalenderÅr = ({
    aar,
    perioder,
    ModalContent,
    dateContentRenderer,
    kalenderdager,
    slettPeriode,
}: Props) => {
    const [ekspandert, setEkspandert] = useState<boolean>(false);
    const toggleEkspandert = () => {
        setEkspandert(!ekspandert);
    };

    const ref = React.useRef<HTMLDivElement>(null);

    return (
        <ExpansionCard open={ekspandert} onToggle={toggleEkspandert} aria-labelledby="tidsbruk-kalender-år">
            <ExpansionCard.Header>
                <Heading size="small">{aar}</Heading>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                {ekspandert &&
                    perioder.map((periode) => {
                        const filteredKalenderdager = kalenderdager.filter((kalenderdag) => {
                            const date = new Date(kalenderdag.date);
                            return date.getMonth() === periode[0].fom.getMonth();
                        });
                        return (
                            <div ref={ref} key={periode?.[0].fom.toString()}>
                                <TidsbrukKalender
                                    gyldigePerioder={periode}
                                    ModalContent={ModalContent}
                                    dateContentRenderer={dateContentRenderer}
                                    kalenderdager={filteredKalenderdager}
                                    slettPeriode={slettPeriode}
                                    ref={ref}
                                />
                            </div>
                        );
                    })}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default TidsbrukKalenderÅr;
