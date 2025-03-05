import React from 'react';

import { periodToFormattedString } from 'app/utils';

interface Props {
    kursperioder: string[];
}

const VisningAvKursperioderSoknadKvittering = ({ kursperioder }: Props) => {
    return (
        <>
            {kursperioder.map((kursperiode, index) => (
                <div key={`kursperiode-${index}`}>
                    <p>Periode med opplæring:</p>
                    {periodToFormattedString(kursperiode)}
                </div>
            ))}
        </>
    );
};

export default VisningAvKursperioderSoknadKvittering;
