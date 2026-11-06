import dayjs from 'dayjs';
import React from 'react';

import { KalenderDag } from 'app/models/KalenderDag';
import { verdiOgTekstHvisVerdi } from 'app/utils';

const DateContent = (kalenderdager: KalenderDag[]) => (date: Date) => {
    if (kalenderdager.length === 0) {
        return null;
    }

    const kalenderdag = kalenderdager.find((dag) => dayjs(dag.date).isSame(dayjs(date), 'date'));

    if (!kalenderdag) {
        return null;
    }

    return (
        <>
            <div style={{ fontWeight: 'bold' }}>
                {verdiOgTekstHvisVerdi(kalenderdag?.tid?.timer, 't ')}
                {verdiOgTekstHvisVerdi(kalenderdag?.tid?.minutter, 'min')}
            </div>
            <div>
                {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.timer, 't ')}
                {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.minutter, 'min')}
            </div>
        </>
    );
};

export default DateContent;
