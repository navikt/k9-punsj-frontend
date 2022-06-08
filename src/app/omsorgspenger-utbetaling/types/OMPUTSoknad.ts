import { Periode, PersonEnkel } from 'app/models/types';
import { SoeknadType } from '../../models/forms/soeknader/SoeknadType';

export type Arbeidstaker = { organisasjonsnummer: string; fravaersperioder: Fravaersperiode[] };

type Fravaersperiode = {
    aktivitetsFravær: string;
    fraværÅrsak: string;
    søknadÅrsak: string;
    periode: Periode;
    faktiskTidPrDag: string;
};

export type Arbeidsforhold = {
    arbeidstaker: boolean;
    selvstendigNæringsdrivende: boolean;
    frilanser: boolean;
};
interface IOpptjeningAktivitet {
    arbeidstaker: Arbeidstaker[];
}

export interface IOMPUTSoknad extends SoeknadType {
    arbeidsforhold: Arbeidsforhold;
    opptjeningAktivitet: IOpptjeningAktivitet;
    barn: PersonEnkel[];
}

export interface IOMPUTSoknadBackend extends IOMPUTSoknad {
    fravaersperioder: Fravaersperiode[];
}
