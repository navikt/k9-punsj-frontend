import { IntlShape } from 'react-intl';

export const formats = {
    DDMMYYYY: 'DD-MM-YYYY',
    YYYYMMDD: 'YYYY-MM-DD',
};

export function numberToString(intl: IntlShape, num: number, numberOfFractionDigits?: number) {
    return intl.formatNumber(num, {
        style: 'decimal',
        minimumFractionDigits: numberOfFractionDigits,
        maximumFractionDigits: numberOfFractionDigits,
    });
}

function cleanNumberString(formattedNumber: string) {
    // Fjerner alle tegn som ikke er sifre
    return formattedNumber.replace(/\D/gm, '');
}

export function stringToNumber(formattedNumber: string) {
    const firstCommaIndex = formattedNumber.indexOf(',');
    const firstPointIndex = formattedNumber.indexOf('.');
    const separatorIndex = Math.max(firstCommaIndex, firstPointIndex);
    const exp = separatorIndex >= 0 ? cleanNumberString(formattedNumber.substr(separatorIndex)).length : 0;
    return Number(cleanNumberString(formattedNumber)) / 10 ** exp;
}

export function periodToFormattedString(periode: string) {
    const formateradPeriode = periode.replace('..', '');
    let splittetFormateradePerioder = formateradPeriode.split('/');
    splittetFormateradePerioder = splittetFormateradePerioder.filter((p) => p.length > 0);
    const formateradeDato = splittetFormateradePerioder.map((p) => {
        const splittetDato = p.split('-');
        return splittetDato.length > 0 ? `${splittetDato[2]}.${splittetDato[1]}.${splittetDato[0]}` : '';
    });

    switch (formateradeDato.length) {
        case 1:
            return `${formateradeDato[0]} - `;
        case 2:
            return `${formateradeDato[0]} - ${formateradeDato[1]}`;
        default:
            return '';
    }
}

export const canStringBeParsedToJSON = (stringToBeParsed: string) => {
    try {
        JSON.parse(stringToBeParsed);
    } catch (error) {
        return false;
    }
    return true;
};
