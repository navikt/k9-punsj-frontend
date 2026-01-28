import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import minMax from 'dayjs/plugin/minMax';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { IPeriode } from 'app/models/types';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(minMax);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Henter tidligste fom-dato fra en liste med perioder
 */
export const getMinDatoFraSøknadsperioder = (søknadsperioder?: IPeriode[]): string | undefined => {
    if (!søknadsperioder || søknadsperioder.length === 0) {
        return undefined;
    }

    const dates = søknadsperioder
        .filter((periode) => periode.fom)
        .map((periode) => dayjs(periode.fom as string, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD.MM.YYYY']))
        .filter((date) => date.isValid());

    if (dates.length === 0) {
        return undefined;
    }

    const minDate = dayjs.min(dates);
    return minDate ? minDate.format('YYYY-MM-DD') : undefined;
};

/**
 * Henter seneste tom-dato fra en liste med perioder
 */
export const getMaxDatoFraSøknadsperioder = (søknadsperioder?: IPeriode[]): string | undefined => {
    if (!søknadsperioder || søknadsperioder.length === 0) {
        return undefined;
    }

    const dates = søknadsperioder
        .filter((periode) => periode.tom)
        .map((periode) => dayjs(periode.tom as string, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD.MM.YYYY']))
        .filter((date) => date.isValid());

    if (dates.length === 0) {
        return undefined;
    }

    const maxDate = dayjs.max(dates);
    return maxDate ? maxDate.format('YYYY-MM-DD') : undefined;
};

/**
 * Sjekker om en dato er innenfor minst én periode
 */
export const datoErInnenforPerioder = (dato: string, perioder: IPeriode[]): boolean => {
    const d = dayjs(dato);
    return perioder.some((p) => d.isSameOrAfter(dayjs(p.fom)) && d.isSameOrBefore(dayjs(p.tom)));
};

/**
 * Formaterer perioder til lesbar tekst (DD.MM.YYYY - DD.MM.YYYY)
 */
export const formaterPerioder = (perioder: IPeriode[]): string =>
    perioder.map((p) => `${dayjs(p.fom).format('DD.MM.YYYY')} - ${dayjs(p.tom).format('DD.MM.YYYY')}`).join(', ');

/**
 * Beregner min og max dato fra en liste med perioder
 * @param perioder - Liste med perioder
 * @returns Objekt med fromDate (tidligste fom) og toDate (seneste tom)
 */
export const beregnMinMaxDato = (perioder: IPeriode[]): { fromDate?: Date; toDate?: Date } => {
    const gyldigePerioder = perioder.filter((p) => p?.fom && p?.tom);
    if (gyldigePerioder.length === 0) return {};

    const fomDatoer = gyldigePerioder.map((p) => dayjs(p.fom));
    const tomDatoer = gyldigePerioder.map((p) => dayjs(p.tom));

    return {
        fromDate: dayjs.min(fomDatoer)?.toDate(),
        toDate: dayjs.max(tomDatoer)?.toDate(),
    };
};

/**
 * Oppretter en matcher-funksjon som kan brukes i disabled-prop i DatePicker
 * for å deaktivere datoer som ikke er innenfor tillatte perioder.
 * @param perioder - Liste med tillatte perioder
 * @returns Funksjon som returnerer true for datoer som skal være disabled
 */
export const lagDisabledDatoerFunksjon = (perioder: IPeriode[]): ((date: Date) => boolean) | undefined => {
    const gyldigePerioder = perioder.filter((p) => p?.fom && p?.tom);
    if (gyldigePerioder.length === 0) return undefined;

    return (date: Date) => {
        const d = dayjs(date);
        const erInnenforEnPeriode = gyldigePerioder.some(
            (p) => d.isSameOrAfter(dayjs(p.fom), 'day') && d.isSameOrBefore(dayjs(p.tom), 'day'),
        );
        return !erInnenforEnPeriode;
    };
};
