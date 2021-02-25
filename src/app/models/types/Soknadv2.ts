import {JaNeiVetikke}                                            from 'app/models/enums';
import {Arbeidstaker, IArbeidstaker, Tilstedevaerelsesgrad}      from 'app/models/types/Arbeidstaker';
import {Periode}                                       from 'app/models/types/Periode';
import {IPeriodeinfoExtension, Periodeinfo}                      from 'app/models/types/Periodeinfo';
import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {IntlShape}                                               from 'react-intl';
import {ISoknadPeriode, SoknadPeriode} from "./HentSoknad";
import {FrilanserV2, IFrilanserV2} from "./FrilanserV2";
import {PeriodeinfoV2} from "./PeriodeInfoV2";
import {PeriodeV2} from "./PeriodeV2";

export interface ISoknadV2 {
    søknadId?: string;
    journalposter?: string[];
    datoMottatt?: string;
    sendtInn?: boolean;
    erFraK9?: boolean;
    ytelse?: IYtelse;
}

export class SoknadV2 implements Required<ISoknadV2> {

    søknadId: string;
    datoMottatt: string;
    journalposter: string[];
    sendtInn: boolean;
    erFraK9: boolean;
    ytelse: Ytelse;

    constructor(soknad: ISoknadV2) {

        this.søknadId = soknad.søknadId || '';
        this.datoMottatt = soknad.datoMottatt || '';
        this.ytelse = new Ytelse(soknad.ytelse || {});
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.journalposter = soknad.journalposter || [];
    }

    values(): Required<ISoknadV2> {
        return {
            søknadId: this.søknadId,
            datoMottatt: this.datoMottatt,
            erFraK9: this.erFraK9,
            journalposter: this.journalposter,
            ytelse: this.ytelse,
            sendtInn: this.sendtInn
        };
    }
}

export interface IArbeidV2 {
    arbeidstaker?: IArbeidstaker[];
    selvstendigNaeringsdrivende?: Periodeinfo<ISelvstendigNaerinsdrivende>[];
    frilanser?: IFrilanserV2;
}

export class ArbeidV2 implements Required<IArbeidV2> {

    arbeidstaker: Arbeidstaker[];
    selvstendigNaeringsdrivende: SelvstendigNaerinsdrivende[];
    frilanser: FrilanserV2;

    constructor(arbeid: IArbeidV2) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(a => new Arbeidstaker(a));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaerinsdrivende(s));
        this.frilanser = new FrilanserV2(arbeid.frilanser || {});
    }

    values(): Required<IArbeidV2> {
        return {
            arbeidstaker: this.arbeidstaker.map(a => a.values()),
            selvstendigNaeringsdrivende: this.selvstendigNaeringsdrivende.map(s => s.values()),
            frilanser: this.frilanser
        };
    }

    numberOfWorkPeriods(): number {
        return this.arbeidstaker.length + this.selvstendigNaeringsdrivende.length + (this.frilanser ? 1 : 0);
    }

    generateTgStrings = (intl: IntlShape): string[][] => this.arbeidstaker.map((a: Arbeidstaker) => a.generateTgStrings(intl));
}

export interface ITilsynsordning {
    iTilsynsordning?: JaNeiVetikke;
    opphold?: Periodeinfo<ITilsyn>[];
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
    norskIdentitetsnummer?: string;
    foedselsdato?: string;
}

export class Barn implements Required<IBarn> {

    norskIdentitetsnummer: string;
    foedselsdato: string;

    constructor(barn: IBarn) {
        this.norskIdentitetsnummer = barn.norskIdentitetsnummer || '';
        this.foedselsdato = barn.foedselsdato || '';
    }

    values(): Required<IBarn> {
        const {norskIdentitetsnummer, foedselsdato} = this; // tslint:disable-line:no-this-assignment
        return {norskIdentitetsnummer, foedselsdato};
    }

    getFnrOrFdato(): string {
        return this.norskIdentitetsnummer || this.foedselsdato;
    }
}

export interface ITilleggsinformasjonV2 {
    tilleggsinformasjon?: string;
}

export class TilleggsinformasjonV2 implements Required<PeriodeinfoV2<ITilleggsinformasjonV2>> {

    periode: PeriodeV2;
    tilleggsinformasjon: string;

    constructor(periodeinfo: PeriodeinfoV2<ITilleggsinformasjonV2>) {
        this.periode = new PeriodeV2(periodeinfo.periode || {});
        this.tilleggsinformasjon = periodeinfo.tilleggsinformasjon || '';
    }

    values(): Required<PeriodeinfoV2<ITilleggsinformasjonV2>> {
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

export interface IYtelse {
    søknadsPeriode?: ISoknadPeriode;
    barn?: IBarn;
    arbeidAktivitet?: IArbeidV2;
    beredskap?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
    nattevaak?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
    tilsynsordning?: ITilsynsordning;


}

export class Ytelse implements Required<IYtelse> {
    søknadsPeriode: SoknadPeriode;
    barn: Barn;
    arbeidAktivitet: ArbeidV2;
    beredskap: PeriodeinfoV2<TilleggsinformasjonV2>[];
    nattevaak: PeriodeinfoV2<TilleggsinformasjonV2>[];
    tilsynsordning: Tilsynsordning;

    private workPeriods: PeriodeinfoV2<IPeriodeinfoExtension>[];
    private allPeriods: PeriodeinfoV2<IPeriodeinfoExtension>[];



    constructor(ytelse: IYtelse) {
        this.søknadsPeriode = new SoknadPeriode(ytelse.søknadsPeriode || {});
        this.barn = new Barn(ytelse.barn || {});
        this.arbeidAktivitet = new ArbeidV2(ytelse.arbeidAktivitet || {})
        this.beredskap = (ytelse.beredskap || []).map(b => new TilleggsinformasjonV2(b));
        this.nattevaak = (ytelse.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = new Tilsynsordning(ytelse.tilsynsordning || {});


        this.workPeriods = [];
        this.workPeriods.push(...this.arbeidAktivitet.arbeidstaker.reduce((pv: Tilstedevaerelsesgrad[], cv) => pv.concat(cv.skalJobbeProsent), []));
        this.workPeriods.push(...this.arbeidAktivitet.selvstendigNaeringsdrivende);
      //  this.workPeriods.push(...this.arbeidAktivitet.frilanser);

        this.allPeriods = [];
        this.allPeriods.push(...this.workPeriods);
        this.allPeriods.push(...this.beredskap);
        this.allPeriods.push(...this.nattevaak);
        this.allPeriods.push(...this.tilsynsordning.opphold);
    }

    values(): Required<IYtelse> {
        return {
            barn: this.barn.values(),
            arbeidAktivitet: this.arbeidAktivitet.values(),
            beredskap: this.beredskap.map(b => b.values()),
            nattevaak: this.nattevaak.map(n => n.values()),
            søknadsPeriode: this.søknadsPeriode,
            tilsynsordning: this.tilsynsordning.values()
        };
    }


    /* getFom(): string | null {
         return this.perioder
                 .map(p => p!.fraOgMed)
                 .filter(fom => !!fom && fom !== '')
                 .sort((a, b) => (a! > b!) ? 1 : -1)?.[0]
             || this.allPeriods
                 .map(p => p.periode)
                 .filter(p => !!p)
                 .map(p => p!.fraOgMed)
                 .filter(fom => !!fom && fom !== '')
                 .sort((a, b) => (a! > b!) ? 1 : -1)?.[0] || null;
     }

     getTom(): string | null {
         return this.perioder
                 .map(p => p!.tilOgMed)
                 .filter(tom => !!tom && tom !== '')
                 .sort((a, b) => (a! < b!) ? 1 : -1)?.[0]
             || this.allPeriods
                 .map(p => p.periode)
                 .filter(p => !!p)
                 .map(p => p!.tilOgMed)
                 .filter(tom => !!tom && tom !== '')
                 .sort((a, b) => (a! < b!) ? 1 : -1)?.[0] || null;
     } */

    getNumberOfWorkPeriods(): number {
        return this.workPeriods.length;
    }

    generateTgStrings(intl: IntlShape): string[][] {
        return this.arbeidAktivitet.generateTgStrings(intl);
    }

    getFnrOrFdato(): string {
        return this.barn.getFnrOrFdato();
    }
}
