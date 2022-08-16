import dayjs from 'dayjs';
import React from 'react';
import { dateToISODate } from '../../utils/timeUtils';

interface Props {
    date: Date;
    dateRendererShort?: (date: Date) => React.ReactNode;
    dateRendererFull?: (date: Date) => React.ReactNode;
}

const CalendarGridDate: React.FunctionComponent<Props> = ({
    date,
    dateRendererShort = (v) => dayjs(v).format('D.'),
    dateRendererFull = (v) => dayjs(v).format('DD.MM.YYYY'),
}) => {
    const id = `${dateToISODate(date)}_date`;

    const content = (
        <>
            <span className="calendarGrid__date__full">
                {' '}
                <span>{dateRendererFull(date)}</span>
            </span>
            <span className="calendarGrid__date__short" id={id}>
                {dateRendererShort(date)}
            </span>
        </>
    );

    return <span className="calendarGrid__date">{content}</span>;
};
export default CalendarGridDate;
