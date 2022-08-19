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
export const verdiOgTekstHvisVerdi = (verdi: any, tekst: string) => (verdi ? `${verdi} ${tekst}` : '');
export const capitalize = (tekst: string) => (tekst ? tekst[0].toUpperCase() + tekst.substring(1) : tekst);

export const finnVisningsnavnForSakstype = (kode: string) => {
    const sakstyper = [
        {
            kode: 'PSB',
            navn: 'Pleiepenger sykt barn',
        },
        {
            kode: 'PPN',
            navn: 'Pleiepenger i livets sluttfase',
        },
        {
            kode: 'OMP',
            navn: 'Omsorgspenger',
        },
        {
            kode: 'OMP_KS',
            navn: 'Omsorgspenger kronisk sykt barn',
        },
        {
            kode: 'OMP_MA',
            navn: 'Ekstra omsorgsdager midlertidig alene',
        },
        {
            kode: 'OMP_AO',
            navn: 'Alene om omsorgen',
        },
    ];
    return sakstyper.find((st) => st.kode === kode)?.navn || kode;
};
