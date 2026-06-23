import countries from 'i18n-iso-countries';
import nb from 'i18n-iso-countries/langs/nb.json';

import { getLocaleFromSessionStorage } from './localeUtils';

export interface ICountry {
    code: string;
    name: string;
}
countries.registerLocale(nb);

const alpha2CodesMap = countries.getAlpha2Codes();
const alpha3CodesMap = countries.getAlpha3Codes();
const nbCountryEntries = Object.entries(nb.countries);
const nbCountrySamples = nbCountryEntries.slice(0, 5).map(([alpha2, name]) => ({
    alpha2,
    alpha3: countries.alpha2ToAlpha3(alpha2),
    name,
}));

//  Kosovo = XXK i kodeverk
const alpha3Codes = () =>
    Object.keys(alpha3CodesMap).map((alpha3) => {
        const isKosovo = alpha3 === 'XKK'; // Kosovo var tidligere XKX i i18n-iso-countries, de endret det til XKK
        return isKosovo ? 'XXK' : alpha3;
    });
const getCountryNameFromAlpha3 = (code: string) => {
    const isKosovo = code === 'XXK';
    const newCode = isKosovo ? 'XKK' : code;
    return countries.getName(newCode, getLocaleFromSessionStorage());
};

const mapLand = (code: string) => ({
    code,
    name: getCountryNameFromAlpha3(code),
});
const countryList = alpha3Codes()
    .map(mapLand)
    .sort((a, b) => {
        if (!a.name || !b.name) {
            return 0;
        }
        return a.name > b.name ? 1 : -1;
    });

// Temporary runtime diagnostics for empty country lists in dev/prod bundles.
// Remove after we confirm whether getAlpha3Codes() is empty at runtime.
// eslint-disable-next-line no-console
console.log('[country-debug] countryUtils:init', {
    locale: getLocaleFromSessionStorage(),
    alpha2CodeCount: Object.keys(alpha2CodesMap).length,
    alpha3CodeCount: Object.keys(alpha3CodesMap).length,
    nbLocale: nb.locale,
    nbCountryCount: nbCountryEntries.length,
    nbCountrySamples,
    directAlpha2ToAlpha3: {
        NO: countries.alpha2ToAlpha3('NO'),
        SE: countries.alpha2ToAlpha3('SE'),
        XK: countries.alpha2ToAlpha3('XK'),
    },
    directGetName: {
        NOR: countries.getName('NOR', getLocaleFromSessionStorage()),
        SWE: countries.getName('SWE', getLocaleFromSessionStorage()),
        XKK: countries.getName('XKK', getLocaleFromSessionStorage()),
    },
    countryListCount: countryList.length,
    sampleCountries: countryList.slice(0, 5),
});

export const getCountryList = () => {
    if (countryList.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[country-debug] getCountryList returned empty list', {
            locale: getLocaleFromSessionStorage(),
            alpha2CodeCount: Object.keys(alpha2CodesMap).length,
            alpha3CodeCount: Object.keys(alpha3CodesMap).length,
            nbCountryCount: nbCountryEntries.length,
            nbCountrySamples,
            directAlpha2ToAlpha3: {
                NO: countries.alpha2ToAlpha3('NO'),
                SE: countries.alpha2ToAlpha3('SE'),
                XK: countries.alpha2ToAlpha3('XK'),
            },
            directGetName: {
                NOR: countries.getName('NOR', getLocaleFromSessionStorage()),
                SWE: countries.getName('SWE', getLocaleFromSessionStorage()),
                XKK: countries.getName('XKK', getLocaleFromSessionStorage()),
            },
        });
    }
    return [...countryList];
};

export const landkodeTilNavn = (landskode: string) => {
    const landNavn = getCountryList().find((country) => country.code === landskode);
    return landNavn ? landNavn?.name : '';
};
