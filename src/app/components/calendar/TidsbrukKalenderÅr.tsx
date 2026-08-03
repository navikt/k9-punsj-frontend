import React, { useState } from 'react';

import { ExpansionCard, Heading } from '@navikt/ds-react';

import { KalenderDag } from 'app/models/KalenderDag';
import DateRange from 'app/models/types/DateRange';

import TidsbrukKalender from './TidsbrukKalender';

type Props = {
    aar: number;
    perioder: DateRange[][];
    kalenderdager: KalenderDag[];
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    selectedDates: Date[];
    setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
};

const TidsbrukKalenderÅr = ({
    aar,
    perioder,
    dateContentRenderer,
    kalenderdager,
    selectedDates,
    setSelectedDates,
}: Props) => {
    const [ekspandert, setEkspandert] = useState<boolean>(false);
    const toggleEkspandert = () => {
        setEkspandert(!ekspandert);
    };

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
                            <div key={periode?.[0].fom.toString()}>
                                <TidsbrukKalender
                                    gyldigePerioder={periode}
                                    dateContentRenderer={dateContentRenderer}
                                    kalenderdager={filteredKalenderdager}
                                    selectedDates={selectedDates}
                                    setSelectedDates={setSelectedDates}
                                />
                            </div>
                        );
                    })}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default TidsbrukKalenderÅr;
