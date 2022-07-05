import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
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

export const finnVisningsnavnForSakstype = (kode: string) => {
    const sakstyper = [
        {
            kode: DokumenttypeForkortelse.PSB,
            navn: 'Pleiepenger sykt barn',
        },
        {
            kode: DokumenttypeForkortelse.PPN,
            navn: 'Pleiepenger i livets sluttfase',
        },
        {
            kode: DokumenttypeForkortelse.OMP,
            navn: 'Omsorgspenger',
        },
        {
            kode: DokumenttypeForkortelse.OMP_KS,
            navn: 'Omsorgspenger kronisk sykt barn',
        },
        {
            kode: DokumenttypeForkortelse.OMP_MA,
            navn: 'Ekstra omsorgsdager midlertidig alene',
        },
        {
            kode: DokumenttypeForkortelse.OMP_AO,
            navn: 'Alene om omsorgen',
        },
    ];
    return sakstyper.find((st) => st.kode === kode)?.navn || kode;
};

export const finnForkortelseForDokumenttype = (dokumenttype?: FordelingDokumenttype) => {
    if (!dokumenttype) {
        return undefined;
    }
    const dokumenttyper = [
        {
            navn: FordelingDokumenttype.PLEIEPENGER,
            forkortelse: DokumenttypeForkortelse.PSB,
        },
        {
            navn: FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
            forkortelse: DokumenttypeForkortelse.PPN,
        },
        {
            navn: FordelingDokumenttype.KORRIGERING_IM,
            forkortelse: DokumenttypeForkortelse.OMP,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER,
            forkortelse: DokumenttypeForkortelse.OMP,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_KS,
            forkortelse: DokumenttypeForkortelse.OMP_KS,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_MA,
            forkortelse: DokumenttypeForkortelse.OMP_MA,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_AO,
            forkortelse: DokumenttypeForkortelse.OMP_AO,
        },
    ];
    return dokumenttyper.find((dt) => dt.navn === dokumenttype)?.forkortelse;
};
