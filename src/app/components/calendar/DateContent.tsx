import { KalenderDag } from 'app/models/KalenderDag';
import { verdiOgTekstHvisVerdi } from 'app/utils';
import dayjs from 'dayjs';
import React from 'react';

const DateContent = (kalenderdager: KalenderDag[]) => (date: Date, isDisabled: boolean) => {
    if (kalenderdager.length === 0) {
        return null;
    }

    const kalenderdag = kalenderdager.find((dag) => dayjs(dag.date).isSame(dayjs(date), 'date'));

    if (!kalenderdag) {
        return null;
    }

    return (
        <>
            <div>
                {verdiOgTekstHvisVerdi(kalenderdag?.tid?.timer, 't ')}
                {verdiOgTekstHvisVerdi(kalenderdag?.tid?.minutter, 'min')}
            </div>
            <div style={{ fontWeight: 'bold' }}>
                {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.timer, 't ')}
                {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.minutter, 'min')}
            </div>
        </>
    );
};

export default DateContent;
