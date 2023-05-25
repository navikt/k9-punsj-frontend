import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';

export const formatDato = (dato: string) => {
    const [year, month, day] = dato.split('-');
    return `${day}.${month}.${year}`;
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

export const nummerPrefiks = (tekst: string, number: number) => `${number}. ${tekst}`;
export const verdiOgTekstHvisVerdi = (verdi: any, tekst: string) => (verdi ? `${verdi} ${tekst}` : '');
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

export const printAndReturnValue = (value: any) => {
    console.log(value);
    return value;
};

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
        {
            kode: DokumenttypeForkortelse.OMP_UT,
            navn: 'Direkte utbetaling av omsorgspenger',
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
            navn: FordelingDokumenttype.OMSORGSPENGER_UT,
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

export const getModiaPath = (fødselsnummer?: string) => {
    const { host } = window.location;
    if (!fødselsnummer) {
        return null;
    }
    if (host.includes('dev.adeo.no')) {
        return `https://app-q1.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    if (host.includes('nais.adeo.no')) {
        return `https://app.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    return null;
};
