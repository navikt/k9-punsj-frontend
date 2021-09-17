import {ICountry} from "../components/country-select/CountrySelect";


export const formattereDatoIArray = (dato: number[]) => {
    const formatertDato: string[] = [];
    for (let i = dato.length - 1; i >= 0; i--) {
        formatertDato.push(i > 0 ? `${dato[i]}.` : `${dato[i]}`)
    }
    return formatertDato.join('');
};

export const sjekkPropertyEksistererOgIkkeErNull = (property: string, object: any) => {
    if (property in object && object[property] !== null) {
        return true
    }
    return false
};

export const formattereLandTilNavn = (landskode: string, countryList: ICountry[]) => {
    const landNavn = countryList.find(country => country.code === landskode);
    return typeof landNavn !== undefined ? landNavn?.name : '';
};