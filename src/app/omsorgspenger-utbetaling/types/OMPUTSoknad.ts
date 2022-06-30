import { IPeriode, PersonEnkel } from 'app/models/types';
import { SoeknadType } from '../../models/forms/soeknader/SoeknadType';

export type Arbeidstaker = { organisasjonsnummer: string; fravaersperioder: FravaersperiodeType[] };
export type SelvstendigNaeringsdrivende = {
    virksomhetNavn: string;
    organisasjonsnummer: string;
    info: {
        periode: IPeriode;
        virksomhetstyper: string[];
        landkode: string;
        regnskapsførerNavn: string;
        regnskapsførerTlf: string;
        harSøkerRegnskapsfører: boolean;
        registrertIUtlandet: boolean;
        bruttoInntekt: number;
        erNyoppstartet: boolean;
        erVarigEndring: boolean;
        endringInntekt: number;
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
    metadata: { arbeidsforhold: Arbeidsforhold };
    opptjeningAktivitet: IOpptjeningAktivitet;
    barn: PersonEnkel[];
}

export interface IOMPUTSoknadBackend extends Omit<IOMPUTSoknad, 'opptjeningAktivitet'> {
    fravaersperioder: FravaersperiodeType[];
    opptjeningAktivitet: {
        arbeidstaker: Omit<Arbeidstaker, 'fravaersperioder'>[];
        selvstendigNaeringsdrivende: Omit<SelvstendigNaeringsdrivende, 'fravaersperioder'>;
        frilanser: Omit<Frilanser, 'fravaersperioder'>;
    };
}
