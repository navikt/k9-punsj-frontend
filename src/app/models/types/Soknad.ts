import {Arbeidstaker, IArbeidstaker}                             from 'app/models/types/Arbeidstaker';
import {Frilanser, IFrilanser}                                   from 'app/models/types/Frilanser';
import {IPeriode, Periode}                                       from 'app/models/types/Periode';
import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {IntlShape}                                               from 'react-intl';
import {JaNeiVetikke}                                            from '../enums';
import {Locale}                                                  from './Locale';
import {Periodeinfo, PeriodeinfoExtension}                       from './Periodeinfo';

export interface ISoknad {
    arbeid?: IArbeid;
    spraak?: Locale;
    barn?: IBarn;
    beredskap?: Array<Periodeinfo<ITilleggsinformasjon>>;
    nattevaak?: Array<Periodeinfo<ITilleggsinformasjon>>;
    tilsynsordning?: ITilsynsordning;
}

export class Soknad implements Required<ISoknad> {

    arbeid: Arbeid;
    spraak: Locale;
    barn: Barn;
    beredskap: Tilleggsinformasjon[];
    nattevaak: Tilleggsinformasjon[];
    tilsynsordning: Tilsynsordning;
    private workPeriods: Array<Periodeinfo<PeriodeinfoExtension>>;
    private allPeriods: Array<Periodeinfo<PeriodeinfoExtension>>;

    constructor(soknad: ISoknad) {

        this.arbeid = new Arbeid(soknad.arbeid || {});
        this.spraak = soknad.spraak || 'nb';
        this.barn = new Barn(soknad.barn || {});
        this.beredskap = (soknad.beredskap || []).map(b => new Tilleggsinformasjon(b));
        this.nattevaak = (soknad.nattevaak || []).map(n => new Tilleggsinformasjon(n));
        this.tilsynsordning = new Tilsynsordning(soknad.tilsynsordning || {});

        this.workPeriods = [];
        this.workPeriods.push(...this.arbeid.arbeidstaker);
        this.workPeriods.push(...this.arbeid.selvstendigNaeringsdrivende);
        this.workPeriods.push(...this.arbeid.frilanser);

        this.allPeriods = [];
        this.allPeriods.push(...this.workPeriods);
        this.allPeriods.push(...this.beredskap);
        this.allPeriods.push(...this.nattevaak);
        this.allPeriods.push(...this.tilsynsordning.opphold);
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

    getNumberOfWorkPeriods(): number {
        return this.workPeriods.length;
    }

    generateTgStrings(intl: IntlShape): string[] {
        return this.arbeid.arbeidstaker.map(a => a.generateTgString(intl));
    }
}

export interface IArbeid {
    arbeidstaker?: Array<Periodeinfo<IArbeidstaker>>;
    selvstendigNaeringsdrivende?: Array<Periodeinfo<ISelvstendigNaerinsdrivende>>;
    frilanser?: Array<Periodeinfo<IFrilanser>>;
}

class Arbeid implements Required<IArbeid> {

    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: SelvstendigNaerinsdrivende[];
    frilanser: Frilanser[];

    constructor(arbeid: IArbeid) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(a => new Arbeidstaker(a));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaerinsdrivende(s));
        this.frilanser = (arbeid.frilanser || []).map(f => new Frilanser(f));
    }
}

export interface ITilsynsordning {
    iTilsynsordning?: JaNeiVetikke,
    opphold?: Array<Periodeinfo<ITilsyn>>;
}

class Tilsynsordning implements Required<ITilsynsordning> {

    iTilsynsordning: JaNeiVetikke;
    opphold: Array<Required<Periodeinfo<ITilsyn>>>;

    constructor(tilsynsordning: ITilsynsordning) {
        this.iTilsynsordning = tilsynsordning.iTilsynsordning || JaNeiVetikke.NEI;
        this.opphold = (tilsynsordning.opphold || []).map(o => new Tilsyn(o || {}));
    }
}

export interface IBarn {
    norsk_ident?: string;
    foedselsdato?: string;
}

class Barn implements Required<IBarn> {

    norsk_ident: string;
    foedselsdato: string;

    constructor(barn: IBarn) {
        this.norsk_ident = barn.norsk_ident || '';
        this.foedselsdato = barn.foedselsdato || '';
    }
}

export interface ITilleggsinformasjon {
    tilleggsinformasjon?: string;
}

class Tilleggsinformasjon implements Required<Periodeinfo<ITilleggsinformasjon>> {

    periode: Required<IPeriode>;
    tilleggsinformasjon: string;

    constructor(periodeinfo: Periodeinfo<ITilleggsinformasjon>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.tilleggsinformasjon = periodeinfo.tilleggsinformasjon || '';
    }
}

export interface ITilsyn {
    mandag?:    string | null;
    tirsdag?:   string | null;
    onsdag?:    string | null;
    torsdag?:   string | null;
    fredag?:    string | null;
}

class Tilsyn implements Required<Periodeinfo<ITilsyn>> {

    periode: Required<IPeriode>;
    mandag: string | null;
    tirsdag: string | null;
    onsdag: string | null;
    torsdag: string | null;
    fredag: string | null;

    constructor(periodeinfo: Periodeinfo<ITilsyn>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.mandag = periodeinfo.mandag || null;
        this.tirsdag = periodeinfo.tirsdag || null;
        this.onsdag = periodeinfo.onsdag || null;
        this.torsdag = periodeinfo.torsdag || null;
        this.fredag = periodeinfo.fredag || null;
    }
}