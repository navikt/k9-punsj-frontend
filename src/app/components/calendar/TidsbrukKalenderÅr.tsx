import React, { useEffect, useState } from 'react';

import { BodyShort, ExpansionCard, Heading } from '@navikt/ds-react';

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
    visÅrWrapper?: boolean;
};

const TidsbrukKalenderÅr = ({
    aar,
    perioder,
    dateContentRenderer,
    kalenderdager,
    selectedDates,
    setSelectedDates,
    visÅrWrapper = true,
}: Props) => {
    const harRegistrerteDager = kalenderdager.length > 0;
    const [ekspandert, setEkspandert] = useState<boolean>(harRegistrerteDager);
    const [harBrukerToggled, setHarBrukerToggled] = useState(false);
    const registrerteDagerTekst =
        kalenderdager.length === 0
            ? 'Ingen dager registrert i år'
            : `${kalenderdager.length} ${kalenderdager.length === 1 ? 'dag' : 'dager'} registrert i år`;

    useEffect(() => {
        if (!harBrukerToggled && harRegistrerteDager) {
            setEkspandert(true);
        }
    }, [harBrukerToggled, harRegistrerteDager]);

    const toggleEkspandert = () => {
        setHarBrukerToggled(true);
        setEkspandert(!ekspandert);
    };

    const renderMåneder = () =>
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
        });

    if (!visÅrWrapper) {
        return <>{renderMåneder()}</>;
    }

    return (
        <ExpansionCard open={ekspandert} onToggle={toggleEkspandert} aria-labelledby="tidsbruk-kalender-år">
            <ExpansionCard.Header>
                <>
                    <Heading size="small">{aar}</Heading>
                    <BodyShort>{registrerteDagerTekst}</BodyShort>
                </>
            </ExpansionCard.Header>
            <ExpansionCard.Content>{ekspandert && renderMåneder()}</ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default TidsbrukKalenderÅr;
