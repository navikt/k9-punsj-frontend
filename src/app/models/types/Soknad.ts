import {Arbeidstaker, IArbeidstaker}                             from 'app/models/types/Arbeidstaker';
import {SoknadFelles, SoknadIndividuelt}                         from 'app/models/types/DobbelSoknad';
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
    periode?: IPeriode;
    beredskap?: Array<Periodeinfo<ITilleggsinformasjon>>;
    nattevaak?: Array<Periodeinfo<ITilleggsinformasjon>>;
    tilsynsordning?: ITilsynsordning;
}

export class Soknad implements Required<ISoknad> {

    arbeid: Arbeid;
    spraak: Locale;
    barn: Barn;
    periode: Periode;
    beredskap: Tilleggsinformasjon[];
    nattevaak: Tilleggsinformasjon[];
    tilsynsordning: Tilsynsordning;
    private workPeriods: Array<Periodeinfo<PeriodeinfoExtension>>;
    private allPeriods: Array<Periodeinfo<PeriodeinfoExtension>>;

    constructor(soknad: ISoknad) {

        this.arbeid = new Arbeid(soknad.arbeid || {});
        this.spraak = soknad.spraak || 'nb';
        this.barn = new Barn(soknad.barn || {});
        this.periode = new Periode(soknad.periode || {});
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

    values(): Required<ISoknad> {
        return {
            spraak: this.spraak,
            barn: this.barn.values(),
            periode: this.periode.values(),
            arbeid: this.arbeid.values(),
            beredskap: this.beredskap.map(b => b.values()),
            nattevaak: this.nattevaak.map(n => n.values()),
            tilsynsordning: this.tilsynsordning.values()
        };
    }

    getFom(): string | null {
        return this.periode.fraOgMed || this.allPeriods
                   .map(p => p.periode)
                   .filter(p => !!p)
                   .map(p => p!.fraOgMed)
                   .filter(fom => !!fom && fom !== '')
                   .sort((a, b) => (a! > b!) ? 1 : -1)?.[0] || null;
    }

    getTom(): string | null {
        return this.periode.tilOgMed || this.allPeriods
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
        return this.arbeid.generateTgStrings(intl);
    }

    getFnrOrFdato(): string {
        return this.barn.getFnrOrFdato();
    }

    extractFelles(): SoknadFelles {
        const {barn, periode, beredskap, nattevaak, tilsynsordning} = this; // tslint:disable-line:no-this-assignment
        return new SoknadFelles({barn, periode, beredskap, nattevaak, tilsynsordning});
    }

    extractIndividuelt(): SoknadIndividuelt {
        const {spraak, arbeid} = this; // tslint:disable-line:no-this-assignment
        return new SoknadIndividuelt({spraak, arbeid});
    }
}

export interface IArbeid {
    arbeidstaker?: Array<Periodeinfo<IArbeidstaker>>;
    selvstendigNaeringsdrivende?: Array<Periodeinfo<ISelvstendigNaerinsdrivende>>;
    frilanser?: Array<Periodeinfo<IFrilanser>>;
}

export class Arbeid implements Required<IArbeid> {

    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: SelvstendigNaerinsdrivende[];
    frilanser: Frilanser[];

    constructor(arbeid: IArbeid) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(a => new Arbeidstaker(a));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaerinsdrivende(s));
        this.frilanser = (arbeid.frilanser || []).map(f => new Frilanser(f));
    }

    values(): Required<IArbeid> {
        return {
            arbeidstaker: this.arbeidstaker.map(a => a.values()),
            selvstendigNaeringsdrivende: this.selvstendigNaeringsdrivende.map(s => s.values()),
            frilanser: this.frilanser.map(f => f.values())
        };
    }

    numberOfWorkPeriods(): number {
        return this.arbeidstaker.length + this.selvstendigNaeringsdrivende.length + this.frilanser.length;
    }

    generateTgStrings = (intl: IntlShape): string[] => this.arbeidstaker.map((a: Arbeidstaker) => a.generateTgString(intl));
}

export interface ITilsynsordning {
    iTilsynsordning?: JaNeiVetikke;
    opphold?: Array<Periodeinfo<ITilsyn>>;
}

export class Tilsynsordning implements Required<ITilsynsordning> {

    iTilsynsordning: JaNeiVetikke;
    opphold: Tilsyn[];

    constructor(tilsynsordning: ITilsynsordning) {
        this.iTilsynsordning = tilsynsordning.iTilsynsordning || JaNeiVetikke.NEI;
        this.opphold = (tilsynsordning.opphold || []).map(o => new Tilsyn(o || {}));
    }

    values(): Required<ITilsynsordning> {
        return {
            iTilsynsordning: this.iTilsynsordning,
            opphold: this.opphold.map(t => t.values())
        }
    }
}

export interface IBarn {
    norskIdent?: string;
    foedselsdato?: string;
}

export class Barn implements Required<IBarn> {

    norskIdent: string;
    foedselsdato: string;

    constructor(barn: IBarn) {
        this.norskIdent = barn.norskIdent || '';
        this.foedselsdato = barn.foedselsdato || '';
    }

    values(): Required<IBarn> {
        const {norskIdent, foedselsdato} = this; // tslint:disable-line:no-this-assignment
        return {norskIdent, foedselsdato};
    }

    getFnrOrFdato(): string {
        return this.norskIdent || this.foedselsdato;
    }
}

export interface ITilleggsinformasjon {
    tilleggsinformasjon?: string;
}

export class Tilleggsinformasjon implements Required<Periodeinfo<ITilleggsinformasjon>> {

    periode: Periode;
    tilleggsinformasjon: string;

    constructor(periodeinfo: Periodeinfo<ITilleggsinformasjon>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.tilleggsinformasjon = periodeinfo.tilleggsinformasjon || '';
    }

    values(): Required<Periodeinfo<ITilleggsinformasjon>> {
        return {
            periode: this.periode.values(),
            tilleggsinformasjon: this.tilleggsinformasjon
        };
    }
}

export interface ITilsyn {
    mandag?:    string | null;
    tirsdag?:   string | null;
    onsdag?:    string | null;
    torsdag?:   string | null;
    fredag?:    string | null;
}

export class Tilsyn implements Required<Periodeinfo<ITilsyn>> {

    periode: Periode;
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

    description(intl: IntlShape): string {
        return this.periode.description(intl);
    }

    values(): Required<Periodeinfo<ITilsyn>> {
        const {periode, mandag, tirsdag, onsdag, torsdag, fredag} = this; // tslint:disable-line:no-this-assignment
        return {periode: periode.values(), mandag, tirsdag, onsdag, torsdag, fredag};
    }
}