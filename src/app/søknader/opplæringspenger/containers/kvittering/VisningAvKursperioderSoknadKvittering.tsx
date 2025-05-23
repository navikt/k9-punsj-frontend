import React from 'react';

import { BodyShort, Label } from '@navikt/ds-react';

import { periodToFormattedString } from 'app/utils';

interface Props {
    kursperioder: string[];
}

const VisningAvKursperioderSoknadKvittering = ({ kursperioder }: Props) => {
    return (
        <div className="flex flex-col gap-2">
            <Label size="small">Periode med opplæring</Label>
            {kursperioder.map((kursperiode, index) => (
                <div key={`kursperiode-${index}`}>
                    <BodyShort size="small">{periodToFormattedString(kursperiode)}</BodyShort>
                </div>
            ))}
        </div>
    );
};

export default VisningAvKursperioderSoknadKvittering;
