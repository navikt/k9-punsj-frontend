import React from 'react';
import dayjs from 'dayjs';
import IntlProvider from '../app/components/intl-provider/IntlProvider';
import CalendarGrid from '../app/components/calendar/CalendarGrid';

export default {
    component: CalendarGrid,
};

export const enMåned = () => (
    <IntlProvider locale="nb">
        <CalendarGrid
            month={{ fom: new Date('2022-08-01'), tom: new Date('2022-08-30') }}
            dateRendererShort={(date) => dayjs(date).format('D.')}
            dateRendererFull={(date) => dayjs(date).format('DD.MM.YYYY')}
            dateContentRenderer={() => 'test'}
            onDateClick={() => console.error('gi meg modal')}
        />
    </IntlProvider>
);
