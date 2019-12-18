import {IPerson} from "./Person";
import {Locale} from "./Locale";

export interface ISoknad {
    perioder?: IPeriode[];
    spraak?: Locale;
    barn?: IBarn;
    signert?: boolean;
}

interface IPeriode {
    fra_og_med?: string;
    til_og_med?: string;
    beredskap?: IJaNeiTilleggsinformasjon;
    nattevaak?: IJaNeiTilleggsinformasjon;
    arbeidsgivere?: IArbeidsgivere;
}

interface IBarn extends IPerson {}

interface IJaNeiTilleggsinformasjon {
    svar?: boolean;
    tilleggsinformasjon?: string;
}

interface IArbeidsgivere {
    arbeidstaker?: IArbeidstaker[],
    annet?: IAnnet[]
}

interface IArbeidstaker {
    organisasjonsnummer?: string;
    grad?: number;
}

interface IAnnet {
    selvstendig?: boolean;
}