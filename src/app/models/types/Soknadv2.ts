import {Arbeidstaker, IArbeidstaker, Tilstedevaerelsesgrad}      from 'app/models/types/Arbeidstaker';
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

export interface ITilsynsordningV2 {
    periode?: PeriodeV2;
    etablertTilsynTimerPerDag?: string;
}

export class TilsynsordningV2 implements Required<ITilsynsordningV2> {

    periode: PeriodeV2;
    etablertTilsynTimerPerDag: string;
    constructor(tilsynsordning: ITilsynsordningV2) {
        this.periode = new PeriodeV2(tilsynsordning.periode || {});
        this.etablertTilsynTimerPerDag = tilsynsordning.etablertTilsynTimerPerDag || '';
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

export interface IYtelse {
    søknadsperiode?: ISoknadPeriode;
    barn?: IBarn;
    arbeidAktivitet?: IArbeidV2;
  //  beredskap?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
  //  nattevaak?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
    tilsynsordning?: ITilsynsordningV2[];


}

export class Ytelse implements Required<IYtelse> {
    søknadsperiode: SoknadPeriode;
    barn: Barn;
    arbeidAktivitet: ArbeidV2;
 //   beredskap: PeriodeinfoV2<TilleggsinformasjonV2>[];
 //   nattevaak: PeriodeinfoV2<TilleggsinformasjonV2>[];
    tilsynsordning: TilsynsordningV2[];

    private workPeriods: PeriodeinfoV2<IPeriodeinfoExtension>[];
    private allPeriods: PeriodeinfoV2<IPeriodeinfoExtension>[];



    constructor(ytelse: IYtelse) {
        this.søknadsperiode = new SoknadPeriode(ytelse.søknadsperiode || {});
        this.barn = new Barn(ytelse.barn || {});
        this.arbeidAktivitet = new ArbeidV2(ytelse.arbeidAktivitet || {})
   //     this.beredskap = (ytelse.beredskap || []).map(b => new TilleggsinformasjonV2(b));
   //     this.nattevaak = (ytelse.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = (ytelse.tilsynsordning || []).map(t => new TilsynsordningV2(t));


        this.workPeriods = [];
        this.workPeriods.push(...this.arbeidAktivitet.arbeidstaker.reduce((pv: Tilstedevaerelsesgrad[], cv) => pv.concat(cv.skalJobbeProsent), []));
        this.workPeriods.push(...this.arbeidAktivitet.selvstendigNaeringsdrivende);
      //  this.workPeriods.push(...this.arbeidAktivitet.frilanser);

        this.allPeriods = [];
        this.allPeriods.push(...this.workPeriods);
 //       this.allPeriods.push(...this.beredskap);
 //       this.allPeriods.push(...this.nattevaak);
        this.allPeriods.push(...this.tilsynsordning);
    }

    values(): Required<IYtelse> {
        return {
            barn: this.barn.values(),
            arbeidAktivitet: this.arbeidAktivitet.values(),
 //           beredskap: this.beredskap.map(b => b.values()),
 //           nattevaak: this.nattevaak.map(n => n.values()),
            søknadsperiode: this.søknadsperiode,
            tilsynsordning: this.tilsynsordning
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
