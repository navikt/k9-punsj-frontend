import {JaNeiVetikke}                      from '../enums';
import {IArbeidstaker}                     from './Arbeidstaker';
import {IFrilanser}                        from './Frilanser';
import {Locale}                            from './Locale';
import {Periodeinfo, PeriodeinfoExtension} from './Periodeinfo';
import {IPerson}                           from './Person';
import {ISelvstendigNaerinsdrivende}       from './SelvstendigNaerinsdrivende';
import {ITilsyn}                           from './Tilsyn';

export interface ISoknad {
    arbeidsgivere?: IArbeidsgivere;
    spraak?: Locale;
    barn?: IBarn;
    beredskap?: Array<Periodeinfo<ITilleggsinformasjon>>;
    nattevaak?: Array<Periodeinfo<ITilleggsinformasjon>>;
    tilsynsordning?: ITilsynsordning;
}

export class Soknad implements ISoknad {

    arbeidsgivere?: IArbeidsgivere;
    spraak?: Locale;
    barn?: IBarn;
    beredskap?: Array<Periodeinfo<ITilleggsinformasjon>>;
    nattevaak?: Array<Periodeinfo<ITilleggsinformasjon>>;
    tilsynsordning?: ITilsynsordning;
    private allPeriods: Array<Periodeinfo<PeriodeinfoExtension>>;

    constructor(soknad: ISoknad) {

        this.arbeidsgivere = soknad.arbeidsgivere;
        this.spraak = soknad.spraak;
        this.barn = soknad.barn;
        this.beredskap = soknad.beredskap;
        this.nattevaak = soknad.nattevaak;
        this.tilsynsordning = soknad.tilsynsordning;

        this.allPeriods = [];
        !!this.arbeidsgivere?.arbeidstaker?.length && this.allPeriods.push(...this.arbeidsgivere.arbeidstaker);
        !!this.arbeidsgivere?.selvstendigNæringsdrivende?.length && this.allPeriods.push(...this.arbeidsgivere.selvstendigNæringsdrivende);
        !!this.arbeidsgivere?.frilanser?.length && this.allPeriods.push(...this.arbeidsgivere.frilanser);
        !!this.beredskap?.length && this.allPeriods.push(...this.beredskap);
        !!this.nattevaak?.length && this.allPeriods.push(...this.nattevaak);
        !!this.tilsynsordning?.opphold?.length && this.allPeriods.push(...this.tilsynsordning.opphold);
    }

    getFom(): string | null {
        return this.allPeriods
                   .map(p => p.periode)
                   .filter(p => !!p)
                   .map(p => p!.fraOgMed)
                   .filter(fom => !!fom && fom !== '')
                   .sort((a, b) => (a! > b!) ? 1 : -1)?.[0] || null;
    }

    getTom(): string | null {
        return this.allPeriods
                   .map(p => p.periode)
                   .filter(p => !!p)
                   .map(p => p!.tilOgMed)
                   .filter(tom => !!tom && tom !== '')
                   .sort((a, b) => (a! < b!) ? 1 : -1)?.[0] || null;
    }
}

export interface IArbeidsgivere {
    arbeidstaker?: Array<Periodeinfo<IArbeidstaker>>;
    selvstendigNæringsdrivende?: Array<Periodeinfo<ISelvstendigNaerinsdrivende>>;
    frilanser?: Array<Periodeinfo<IFrilanser>>;
}

export interface ITilsynsordning {
    iTilsynsordning?: JaNeiVetikke,
    opphold?: Array<Periodeinfo<ITilsyn>>;
}

export interface IBarn extends IPerson {}

export interface ITilleggsinformasjon {
    tilleggsinformasjon?: string;
}