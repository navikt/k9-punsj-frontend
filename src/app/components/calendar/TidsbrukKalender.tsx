import React, { useState } from 'react';
import dayjs from 'dayjs';
import CalendarGrid from './CalendarGrid';

import DateRange from '../../models/types/DateRange';

interface OwnProps {
    periode: DateRange;
}

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = ({ periode }) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const toggleDay = (date: Date) =>
        selectedDates.some((v) => dayjs(v).isSame(date))
            ? setSelectedDates(selectedDates.filter((v) => !dayjs(v).isSame(date)))
            : setSelectedDates([...selectedDates, date]);

    return (
        <div>
            <CalendarGrid
                onDateClick={(date) => toggleDay(date)}
                month={periode}
                dateContentRenderer={() => 'lel'}
                selectedDates={selectedDates}
            />
        </div>
    );
};

export default TidsbrukKalender;
