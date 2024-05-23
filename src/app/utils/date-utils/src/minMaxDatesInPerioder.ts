import { IPeriode } from 'app/models/types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

export const getMinDatoFraSøknadsperioder = (søknadsperioder?: IPeriode[]): string | undefined => {
    if (!søknadsperioder || søknadsperioder.length === 0) {
        return undefined;
    }

    const dates = søknadsperioder
        .filter((periode) => periode.fom) // filter out null or undefined fom
        .map((periode) => dayjs(periode.fom as string, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD.MM.YYYY']))
        .filter((date) => date.isValid());

    if (dates.length === 0) {
        return undefined;
    }

    const minDate = dayjs.min(dates);

    if (!minDate) {
        return undefined;
    }

    return minDate.format('YYYY-MM-DD');
};

export const getMaxDatoFraSøknadsperioder = (søknadsperioder?: IPeriode[]): string | undefined => {
    if (!søknadsperioder || søknadsperioder.length === 0) {
        return undefined;
    }

    const dates = søknadsperioder
        .filter((periode) => periode.tom)
        // filter out null or undefined fom
        .map((periode) => dayjs(periode.tom as string, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD.MM.YYYY']))
        .filter((date) => date.isValid());

    if (dates.length === 0) {
        return undefined;
    }

    const maxDate = dayjs.max(dates);

    if (!maxDate) {
        return undefined;
    }

    return maxDate.format('YYYY-MM-DD');
};
