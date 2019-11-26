import {IPerson} from "./Person";
import {Locale} from "./Locale";

export interface ISoknad {
    versjon?: string;
    mottatt_dato?: Date;
    soker?: ISoker;
    medsoker?: ISoker;
    periode?: IPeriode;
    relasjon_til_barnet?: string;
    barn?: IBarn;
    medlemskap?: IMedlemskap;
    beredskap?: IBeredskap;
    nattevaak?: INattevaak;
}

interface ISoker extends IPerson {
    spraak_valg?: Locale;
}

interface IPeriode {
    fra_og_med?: string;
    til_og_med?: string;
}

interface IBarn extends IPerson {}

interface IMedlemskap {
    opphold: IOpphold[];
    har_bodd_i_utlandet_siste_12_mnd?: boolean;
    skal_bo_i_utlandet_neste_12_mnd?: boolean;
}

interface IOpphold {
    periode?: IPeriode;
    land?: string;
}

interface IBeredskap {
    svar?: boolean;
    tilleggsinformasjon?: string;
}

interface INattevaak {
    svar?: boolean;
    tilleggsinformasjon?: string;
}