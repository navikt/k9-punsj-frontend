import countries from 'i18n-iso-countries';
import nb from 'i18n-iso-countries/langs/nb.json';

import { getLocaleFromSessionStorage } from './localeUtils';

export interface ICountry {
    code: string;
    name: string;
}
countries.registerLocale(nb);

const countriesModule = countries as unknown as Record<string, unknown>;
const alpha2CodesMap = countries.getAlpha2Codes();
const alpha3CodesMap = countries.getAlpha3Codes();
const namesForLocale = countries.getNames(getLocaleFromSessionStorage());
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

const buildCountryDiagnostics = () => ({
    locale: getLocaleFromSessionStorage(),
    countriesModuleType: typeof countries,
    countriesConstructorName: countriesModule.constructor?.name,
    countriesModuleKeys: Object.keys(countriesModule),
    countriesMethodTypes: {
        registerLocale: typeof countries.registerLocale,
        getAlpha2Codes: typeof countries.getAlpha2Codes,
        getAlpha3Codes: typeof countries.getAlpha3Codes,
        getName: typeof countries.getName,
        getNames: typeof countries.getNames,
        alpha2ToAlpha3: typeof countries.alpha2ToAlpha3,
        alpha3ToAlpha2: typeof countries.alpha3ToAlpha2,
        toAlpha2: typeof countries.toAlpha2,
        toAlpha3: typeof countries.toAlpha3,
    },
    alpha2CodeCount: Object.keys(alpha2CodesMap).length,
    alpha2CodeKeysSample: Object.keys(alpha2CodesMap).slice(0, 10),
    alpha2CodeEntriesSample: Object.entries(alpha2CodesMap).slice(0, 5),
    alpha3CodeCount: Object.keys(alpha3CodesMap).length,
    alpha3CodeKeysSample: Object.keys(alpha3CodesMap).slice(0, 10),
    alpha3CodeEntriesSample: Object.entries(alpha3CodesMap).slice(0, 5),
    localeNamesCount: Object.keys(namesForLocale).length,
    localeNamesSample: Object.entries(namesForLocale).slice(0, 5),
    nbLocale: nb.locale,
    nbCountryCount: nbCountryEntries.length,
    nbCountrySamples,
    directAlpha2ToAlpha3: {
        NO: countries.alpha2ToAlpha3('NO'),
        SE: countries.alpha2ToAlpha3('SE'),
        XK: countries.alpha2ToAlpha3('XK'),
        AD: countries.alpha2ToAlpha3('AD'),
        AE: countries.alpha2ToAlpha3('AE'),
    },
    directAlpha3ToAlpha2: {
        NOR: countries.alpha3ToAlpha2('NOR'),
        SWE: countries.alpha3ToAlpha2('SWE'),
        XKK: countries.alpha3ToAlpha2('XKK'),
        AND: countries.alpha3ToAlpha2('AND'),
        ARE: countries.alpha3ToAlpha2('ARE'),
    },
    directToAlpha2: {
        NOR: countries.toAlpha2('NOR'),
        SWE: countries.toAlpha2('SWE'),
        XKK: countries.toAlpha2('XKK'),
    },
    directToAlpha3: {
        NO: countries.toAlpha3('NO'),
        SE: countries.toAlpha3('SE'),
        XK: countries.toAlpha3('XK'),
    },
    directGetName: {
        NOR: countries.getName('NOR', getLocaleFromSessionStorage()),
        SWE: countries.getName('SWE', getLocaleFromSessionStorage()),
        XKK: countries.getName('XKK', getLocaleFromSessionStorage()),
        AND: countries.getName('AND', getLocaleFromSessionStorage()),
        ARE: countries.getName('ARE', getLocaleFromSessionStorage()),
    },
    countryListCount: countryList.length,
    sampleCountries: countryList.slice(0, 5),
});

// Temporary runtime diagnostics for empty country lists in dev/prod bundles.
// Remove after we confirm whether getAlpha3Codes() is empty at runtime.
// eslint-disable-next-line no-console
console.log('[country-debug] countryUtils:init', buildCountryDiagnostics());

export const getCountryList = () => {
    if (countryList.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[country-debug] getCountryList returned empty list', buildCountryDiagnostics());
    }
    return [...countryList];
};

export const landkodeTilNavn = (landskode: string) => {
    const landNavn = getCountryList().find((country) => country.code === landskode);
    return landNavn ? landNavn?.name : '';
};
