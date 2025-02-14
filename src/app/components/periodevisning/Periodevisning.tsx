import React from 'react';

import { CalendarIcon } from '@navikt/aksel-icons';

import { Periode } from 'app/models/types';
import { generateDateString } from '../skjema/skjemaUtils';

export default function Periodevisning({ periode }: { periode: Periode }) {
    return (
        <div key={`${periode.fom}_${periode.tom}`} style={{ display: 'flex' }}>
            <CalendarIcon title="a11y-title" fontSize="2rem" />
            <div
                style={{
                    marginLeft: '0.5rem',
                    lineHeight: '25px',
                }}
            >
                {generateDateString(periode)}
            </div>
        </div>
    );
}
