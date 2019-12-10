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
}

interface IBarn extends IPerson {}

interface IJaNeiTilleggsinformasjon {
    svar?: boolean;
    tilleggsinformasjon?: string;
}