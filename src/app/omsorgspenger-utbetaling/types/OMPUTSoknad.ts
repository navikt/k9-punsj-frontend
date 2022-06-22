import { IPeriode, Periode, PersonEnkel } from 'app/models/types';
import { SoeknadType } from '../../models/forms/soeknader/SoeknadType';

export type Arbeidstaker = { organisasjonsnummer: string; fravaersperioder: FravaersperiodeType[] };

export type FravaersperiodeType = {
    aktivitetsFravær: string;
    fraværÅrsak: string;
    søknadÅrsak: string;
    periode: Periode;
    faktiskTidPrDag: string;
};

export type Arbeidsforhold = {
    arbeidstaker: boolean;
    selvstendigNaeringsdrivende: boolean;
    frilanser: boolean;
};
interface IOpptjeningAktivitet {
    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: {
        virksomhetNavn: string;
        organisasjonsnummer: string;
        info: {
            periode: IPeriode;
            virksomhetstyper: string[];
            landkode: string;
            regnskapsførerNavn: string;
            regnskapsførerTlf: string;
            harSøkerRegnskapsfører: string;
            registrertIUtlandet: string;
            bruttoInntekt: string;
            erNyoppstartet: boolean;
            erVarigEndring: boolean;
            endringInntekt: string;
            endringDato: string;
            endringBegrunnelse: string;
        };
        fravaersperioder: FravaersperiodeType[];
    };
    frilanser: {
        startdato: string;
        sluttdato: string | undefined;
        jobberFortsattSomFrilans: boolean;
        fravaersperioder: FravaersperiodeType[];
    };
}

export interface IOMPUTSoknad extends SoeknadType {
    metadata: { arbeidsforhold: Arbeidsforhold };
    opptjeningAktivitet: IOpptjeningAktivitet;
    barn: PersonEnkel[];
}

export interface IOMPUTSoknadBackend extends IOMPUTSoknad {
    fravaersperioder: FravaersperiodeType[];
}
