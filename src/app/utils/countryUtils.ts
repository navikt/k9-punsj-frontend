import countries from 'i18n-iso-countries';
import nb from 'i18n-iso-countries/langs/nb.json';

import { getLocaleFromSessionStorage } from './localeUtils';

export interface ICountry {
    code: string;
    name: string;
}
countries.registerLocale(nb);

//  Kosovo = XXK i kodeverk
const alpha3Codes = () =>
    Object.keys(countries.getAlpha3Codes()).map((alpha3) => {
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

export const getCountryList = () => [...countryList];

export const landkodeTilNavn = (landskode: string) => {
    const landNavn = getCountryList().find((country) => country.code === landskode);
    return landNavn ? landNavn?.name : '';
};
