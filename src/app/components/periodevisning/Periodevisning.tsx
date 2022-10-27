import CalendarSvg from 'app/assets/SVG/CalendarSVG';
import { Periode } from 'app/models/types';
import React from 'react';
import { generateDateString } from '../skjema/skjemaUtils';

export default function Periodevisning({ periode }: { periode: Periode }) {
    return (
        <div key={`${periode.fom}_${periode.tom}`} style={{ display: 'flex' }}>
            <CalendarSvg title="calendar" />
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
