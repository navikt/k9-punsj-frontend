import { IPeriode, PersonEnkel } from 'app/models/types';
import Fagsak from 'app/types/Fagsak';

import { SoeknadType } from '../../../models/forms/soeknader/SoeknadType';

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
export interface IOpptjeningAktivitet {
    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivende;
    frilanser: Frilanser;
}

type OMPUTMetadata = {
    arbeidsforhold: Arbeidsforhold;
    medlemskap: string;
    utenlandsopphold: string;
    signatur: string;
    harSoekerDekketOmsorgsdager: string;
    eksisterendeFagsak?: Fagsak;
};

export type IOMPUTBackendOpptjeningAktivitet = {
    arbeidstaker?: Omit<Arbeidstaker, 'fravaersperioder'>[];
    selvstendigNaeringsdrivende?: Partial<Omit<SelvstendigNaeringsdrivende, 'fravaersperioder' | 'info'>> & {
        info: Partial<Omit<SelvstendigNaeringsdrivende['info'], 'virksomhetstyper'>> & {
            virksomhetstyper: string[];
        };
    };
    frilanser?: Partial<Omit<Frilanser, 'fravaersperioder'>>;
};

export interface IOMPUTSoknad extends SoeknadType {
    metadata: OMPUTMetadata;
    opptjeningAktivitet: IOpptjeningAktivitet;
    bosteder: PeriodeMedUtenlandsopphold[];
    utenlandsopphold: PeriodeMedUtenlandsopphold[];
    erKorrigering: boolean;
    barn: PersonEnkel[];
}

export interface IOMPUTSoknadBackend extends SoeknadType {
    metadata?: Partial<OMPUTMetadata> & Record<string, unknown>;
    barn: PersonEnkel[];
    fravaersperioder?: FravaersperiodeType[];
    opptjeningAktivitet?: IOMPUTBackendOpptjeningAktivitet;
    bosteder?: PeriodeMedUtenlandsopphold[];
    utenlandsopphold?: PeriodeMedUtenlandsopphold[];
    erKorrigering?: boolean;
}
