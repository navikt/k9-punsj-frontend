import { IPeriode } from 'app/models/types';

export interface IOMSKorrigeringFravaersperiode {
    periode?: IPeriode | null;
    faktiskTidPrDag?: string | null;
}

export interface IOMSKorrigeringSoknad {
    soeknadId?: string;
    soekerId?: string;
    journalposter?: string[] | Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    organisasjonsnummer?: string | null;
    arbeidsforholdId?: string | null;
    fravaersperioder?: IOMSKorrigeringFravaersperiode[] | null;
}
