import { IPeriode, PersonEnkel } from 'app/models/types';
import Fagsak from 'app/types/Fagsak';
import { SoeknadType } from 'app/models/forms/soeknader/SoeknadType';

export type Arbeidstaker = { organisasjonsnummer: string; fravaersperioder: FravaersperiodeType[] };
export type SelvstendigNaeringsdrivende = {
    virksomhetNavn: string;
    organisasjonsnummer: string;
    info: {
        periode: IPeriode;
        virksomhetstyper: string;
        erFiskerPåBladB: boolean;
        landkode: string;
        regnskapsførerNavn: string;
        regnskapsførerTlf: string;
        harSøkerRegnskapsfører: boolean;
        registrertIUtlandet: boolean;
        bruttoInntekt: string;
        erNyoppstartet: boolean;
        erVarigEndring: boolean;
        endringInntekt: string;
        endringDato: string;
        endringBegrunnelse: string;
    };
    fravaersperioder: FravaersperiodeType[];
};

export type Frilanser = {
    startdato: string;
    sluttdato: string | undefined;
    jobberFortsattSomFrilans: boolean;
    fravaersperioder: FravaersperiodeType[];
};
export type FravaersperiodeType = {
    aktivitetsFravær: string;
    organisasjonsnummer: string;
    fraværÅrsak: string;
    søknadÅrsak: string;
    periode: IPeriode;
    faktiskTidPrDag: string;
    normalArbeidstidPrDag: string;
};

export type PeriodeMedUtenlandsopphold = {
    periode: IPeriode;
    land: string;
};

export type Arbeidsforhold = {
    arbeidstaker: boolean;
    selvstendigNaeringsdrivende: boolean;
    frilanser: boolean;
};
interface IOpptjeningAktivitet {
    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivende;
    frilanser: Frilanser;
}

export interface IOMPUTSoknad extends SoeknadType {
    metadata: {
        arbeidsforhold: Arbeidsforhold;
        medlemskap: string;
        utenlandsopphold: string;
        signatur: string;
        harSoekerDekketOmsorgsdager: string;
        eksisterendeFagsak?: Fagsak;
    };
    opptjeningAktivitet: IOpptjeningAktivitet;
    bosteder: PeriodeMedUtenlandsopphold[];
    utenlandsopphold: PeriodeMedUtenlandsopphold[];
    erKorrigering: boolean;
    barn: PersonEnkel[];
}

export interface IOMPUTSoknadBackend
    extends Omit<IOMPUTSoknad, 'opptjeningAktivitet' | 'bosteder' | 'utenlandsopphold'> {
    fravaersperioder: FravaersperiodeType[];
    opptjeningAktivitet: {
        arbeidstaker: Omit<Arbeidstaker, 'fravaersperioder'>[];
        selvstendigNaeringsdrivende: Omit<SelvstendigNaeringsdrivende, 'fravaersperioder'>;
        frilanser: Omit<Frilanser, 'fravaersperioder'>;
    };
    bosteder?: PeriodeMedUtenlandsopphold[];
    utenlandsopphold?: PeriodeMedUtenlandsopphold[];
}
