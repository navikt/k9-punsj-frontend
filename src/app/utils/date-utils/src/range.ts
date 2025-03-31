import dayjs from 'dayjs';

export const getDateRange = (years: number = 4) => {
    const today = dayjs();
    return {
        fromDate: today.subtract(years, 'year').toDate(),
        toDate: today.add(years, 'year').toDate(),
    };
};
