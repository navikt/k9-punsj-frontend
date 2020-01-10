import {Periodeinfo} from 'app/models/types/Periodeinfo';
import {ITilsyn}     from 'app/models/types/Tilsyn';
import {Locale}      from './Locale';
import {IPerson}     from './Person';

export interface ISoknad {
    perioder?: IPeriodeMedBeredskapNattevaakArbeid[];
    spraak?: Locale;
    barn?: IBarn;
    signert?: boolean;
    beredskap?: Periodeinfo<IJaNeiTilleggsinformasjon>[];
    nattevaak?: Periodeinfo<IJaNeiTilleggsinformasjon>[];
    tilsynsordning?: Periodeinfo<ITilsyn>[];
}

interface IPeriodeMedBeredskapNattevaakArbeid {
    fraOgMed?: string;
    tilOgMed?: string;
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