import React from 'react';

import { KursperioderSoknadKvittering } from 'app/ytelser/opplæringspenger/OLPSoknadKvittering';
import { periodToFormattedString } from 'app/utils';

interface Props {
    kursperioder: KursperioderSoknadKvittering[];
}

const VisningAvKursperioderSoknadKvittering = ({ kursperioder }: Props) => (
    <>
        {kursperioder.map((kursperiode) => (
            <div>
                <p>Periode med opplæring:</p>
                {periodToFormattedString(kursperiode.periode)}
                {/*    <p>Avreise</p>
            <p>Hjemkomst</p> */}
            </div>
        ))}
    </>
);

export default VisningAvKursperioderSoknadKvittering;
