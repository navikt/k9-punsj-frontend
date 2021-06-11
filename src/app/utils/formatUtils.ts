import {IntlShape} from 'react-intl';

export function numberToString(intl: IntlShape, num: number, numberOfFractionDigits?: number) {
    return intl.formatNumber(num, {
        style: 'decimal',
        minimumFractionDigits: numberOfFractionDigits,
        maximumFractionDigits: numberOfFractionDigits
    });
}

export function stringToNumber(formattedNumber: string) {
    const firstCommaIndex = formattedNumber.indexOf(',');
    const firstPointIndex = formattedNumber.indexOf('.');
    const separatorIndex = Math.max(firstCommaIndex, firstPointIndex);
    const exp = separatorIndex >= 0 ? cleanNumberString(formattedNumber.substr(separatorIndex)).length : 0;
    return Number(cleanNumberString(formattedNumber))/10**exp;
}

function cleanNumberString(formattedNumber: string) {
    // Fjerner alle tegn som ikke er sifre
    return formattedNumber.replace(/\D/gm, '');
}

export function periodToFormattedString(periode: string) {
    let formateradPeriode= periode.replace('..','');
   formateradPeriode =  formateradPeriode.split('-').join('.');
   formateradPeriode = formateradPeriode.split('/').join(' - ');
   return formateradPeriode;
}