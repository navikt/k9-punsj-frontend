import React from 'react';
import { FormattedMessage } from 'react-intl';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import { groupBy } from 'lodash';
import classNames from 'classnames';
import { dateToISODate, getDatesInDateRange, getDatesInMonth, isDateInDates } from '../../utils/timeUtils';
import CalendarGridDate from './CalendarGridDate';
import './calendarGrid.less';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

interface WeekToRender {
    weekNumber: number;
    dates: Date[];
}

interface Props {
    month: {
        fom: Date;
        tom: Date;
    };
    renderAsList?: boolean;
    disabledDates?: Date[];
    disabledDateInfo?: string;
    hideEmptyContentInListMode?: boolean;
    hideWeeksWithOnlyDisabledContent?: boolean;
    onDateClick?: (date: Date) => void;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    dateRendererShort?: (date: Date) => React.ReactNode;
    dateRendererFull?: (date: Date) => React.ReactNode;
    allDaysInWeekDisabledContentRenderer?: () => React.ReactNode;
}

const getFullWeeksForDates = (dates: Date[], month: Date): Date[] => {
    const dayOfWeek = dates[0].getUTCDay();
    const firstDateInWeek = dayjs(dates[0]).startOf('isoWeek').toDate();
    if (dayOfWeek > 0 && dayjs(firstDateInWeek).isSame(month, 'month') === false) {
        return [
            ...getDatesInDateRange({ fom: firstDateInWeek, tom: dayjs(dates[0]).subtract(1, 'day').toDate() }, true),
            ...dates,
        ];
    }
    return dates;
};

const getWeeks = (dates: Date[], month: Date): WeekToRender[] => {
    const datesToRender = getFullWeeksForDates(dates, month);
    const weeksAndDays = groupBy(datesToRender, (date) => `week_${dayjs(date).isoWeek()}`);
    const weeks: WeekToRender[] = [];
    Object.keys(weeksAndDays).forEach((key) => {
        const weekDates = weeksAndDays[key];
        const weekHasDatesInMonth = weekDates.some((d) => dayjs(d).isSame(month, 'month'));
        if (weekHasDatesInMonth && weekDates.length > 0) {
            weeks.push({
                weekNumber: dayjs(weekDates[0]).isoWeek(),
                dates: weekDates,
            });
        }
    });
    return weeks;
};

const CalendarGrid: React.FunctionComponent<Props> = ({
    month,
    disabledDates,
    disabledDateInfo,
    renderAsList,
    hideEmptyContentInListMode,
    hideWeeksWithOnlyDisabledContent,
    onDateClick,
    dateContentRenderer,
    dateRendererShort = (date) => dayjs(date).format('DD.MM.YYYY'),
    allDaysInWeekDisabledContentRenderer,
}) => {
    const weekdatesInMonth = getDatesInMonth(month.fom, true);
    const weeks = getWeeks(weekdatesInMonth, month.fom);

    const renderDate = (date: Date) => {
        const dateKey = date.toDateString();
        const dateIsDisabled = isDateInDates(date, disabledDates);
        const renderAsButton = onDateClick !== undefined && dateIsDisabled === false;

        const ButtonOrDivComponent = renderAsButton ? 'button' : 'div';
        return dayjs(date).isSame(month.fom, 'month') === false ? (
            <div key={dateKey} className="calendarGrid__day calendarGrid__day--outsideMonth" aria-hidden />
        ) : (
            <ButtonOrDivComponent
                key={dateKey}
                {...(renderAsButton
                    ? {
                          onClick: (evt) => {
                              evt.stopPropagation();
                              evt.preventDefault();
                              onDateClick(date);
                          },
                          type: 'button',
                      }
                    : {})}
                data-testid={`calendar-grid-date-${dateToISODate(date)}`}
                title={dateIsDisabled ? disabledDateInfo : undefined}
                aria-hidden={dateIsDisabled}
                className={classNames({
                    calendarGrid__day: true,
                    'calendarGrid__day--disabled': dateIsDisabled,
                    'calendarGrid__day--button': renderAsButton,
                })}
            >
                {console.log(date)}
                <CalendarGridDate date={date} dateRendererShort={dateRendererShort} />
                <div className="calendarGrid__day__content">{dateContentRenderer(date, dateIsDisabled)}</div>
            </ButtonOrDivComponent>
        );
    };

    const renderWeek = (week: WeekToRender) => {
        const datesInWeek = week.dates;
        const weekNum = week.weekNumber;
        const areAllDaysInWeekDisabledOrOutsideMonth =
            datesInWeek.filter(
                (date) =>
                    isDateInDates(date, disabledDates) === true || dayjs(date).isSame(month.fom, 'month') === false
            ).length === datesInWeek.length;

        if (hideWeeksWithOnlyDisabledContent && areAllDaysInWeekDisabledOrOutsideMonth) {
            return null;
        }
        return [
            <div
                key={week.weekNumber}
                data-testid={`calendar-grid-week-number-${week.weekNumber}`}
                aria-hidden
                className="calendarGrid__weekNum"
            >
                <span role="presentation" aria-hidden className="calendarGrid__weekNum_label">
                    <FormattedMessage id="uke" /> {` `}
                </span>
                <span>{weekNum}</span>
                {areAllDaysInWeekDisabledOrOutsideMonth && allDaysInWeekDisabledContentRenderer ? (
                    <div className="calendarGrid__allWeekDisabledContent">{allDaysInWeekDisabledContentRenderer()}</div>
                ) : undefined}
            </div>,
            datesInWeek.map(renderDate),
        ];
    };
    return (
        <div
            className={classNames({
                calendarGrid: true,
                'calendarGrid--hideEmptyContentInListMode': hideEmptyContentInListMode,
                'calendarGrid--list': renderAsList,
                'calendarGrid--grid': !renderAsList,
            })}
        >
            <span aria-hidden className="calendarGrid__dayHeader calendarGrid__dayHeader__week">
                <FormattedMessage id="uke" />
            </span>
            <span aria-hidden className="calendarGrid__dayHeader">
                <FormattedMessage id="Ukedag.0" />
            </span>
            <span aria-hidden className="calendarGrid__dayHeader">
                <FormattedMessage id="Ukedag.1" />
            </span>
            <span aria-hidden className="calendarGrid__dayHeader">
                <FormattedMessage id="Ukedag.2" />
            </span>
            <span aria-hidden className="calendarGrid__dayHeader">
                <FormattedMessage id="Ukedag.3" />
            </span>
            <span aria-hidden className="calendarGrid__dayHeader">
                <FormattedMessage id="Ukedag.4" />
            </span>
            {weeks.map(renderWeek)}
        </div>
    );
};

export default CalendarGrid;
