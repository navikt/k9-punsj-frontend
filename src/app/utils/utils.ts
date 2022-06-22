import { ICountry } from '../components/country-select/CountrySelect';

export const formattereDatoIArray = (dato: number[]) => {
    const formatertDato: string[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = dato.length - 1; i >= 0; i--) {
        formatertDato.push(i > 0 ? `${dato[i]}.` : `${dato[i]}`);
    }
    return formatertDato.join('');
};

export const sjekkPropertyEksistererOgIkkeErNull = (property: string, object: any) => {
    if (!object) {
        return false;
    }
    if (property in object && object[property] !== null) {
        return true;
    }
    return false;
};

export const formattereLandTilNavn = (landskode: string, countryList: ICountry[]) => {
    const landNavn = countryList.find((country) => country.code === landskode);
    return typeof landNavn !== undefined ? landNavn?.name : '';
};

export const nummerPrefiks = (tekst: string, number: number) => `${number}. ${tekst}`;
export const capitalize = (tekst: string) => (tekst ? tekst[0].toUpperCase() + tekst.substring(1) : tekst);
export const erYngreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) > fireAarSiden;
};

export const erEldreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) < fireAarSiden;
};