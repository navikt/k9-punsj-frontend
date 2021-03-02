import {Arbeidstaker, IArbeidstaker} from 'app/models/types/Arbeidstaker';
import { Periodeinfo}                      from 'app/models/types/Periodeinfo';
import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {IntlShape}                                               from 'react-intl';
import {FrilanserV2, IFrilanserV2} from "./FrilanserV2";
import {IPeriodeinfoExtensionV2, PeriodeinfoV2} from "./PeriodeInfoV2";
import {IPeriodeV2, PeriodeV2} from "./PeriodeV2";
import {ArbeidstakerV2} from "./ArbeidstakerV2";

export interface ISoknadV2 {
    søknadId?: string;
    journalposter?: string[];
    mottattDato?: string;
    sendtInn?: boolean;
    erFraK9?: boolean;
    ytelse?: IYtelse;
}

export class SoknadV2 implements Required<ISoknadV2> {

    søknadId: string;
    mottattDato: string;
    journalposter: string[];
    sendtInn: boolean;
    erFraK9: boolean;
    ytelse: Ytelse;

    constructor(soknad: ISoknadV2) {

        this.søknadId = soknad.søknadId || '';
        this.mottattDato = soknad.mottattDato || '';
        this.ytelse = new Ytelse(soknad.ytelse || {});
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.journalposter = soknad.journalposter || [];
    }

    values(): Required<ISoknadV2> {
        return {
            søknadId: this.søknadId,
            mottattDato: this.mottattDato,
            erFraK9: this.erFraK9,
            journalposter: this.journalposter,
            ytelse: this.ytelse,
            sendtInn: this.sendtInn
        };
    }
}

export interface IArbeidV2 {
    arbeidstakerList?: IArbeidstaker[];
    selvstendigNaeringsdrivende?: Periodeinfo<ISelvstendigNaerinsdrivende>[];
    frilanser?: IFrilanserV2;
}

export class ArbeidV2 implements Required<IArbeidV2> {

    arbeidstakerList: ArbeidstakerV2[];
    selvstendigNaeringsdrivende: SelvstendigNaerinsdrivende[];
    frilanser: FrilanserV2;

    constructor(arbeid: IArbeidV2) {
        this.arbeidstakerList = (arbeid.arbeidstakerList || []).map(a => new ArbeidstakerV2(a));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaerinsdrivende(s));
        this.frilanser = new FrilanserV2(arbeid.frilanser || {});
    }

    values(): Required<IArbeidV2> {
        return {
            arbeidstakerList: this.arbeidstakerList.map(a => a.values()),
            selvstendigNaeringsdrivende: this.selvstendigNaeringsdrivende.map(s => s.values()),
            frilanser: this.frilanser
        };
    }

    numberOfWorkPeriods(): number {
        return this.arbeidstakerList.length + this.selvstendigNaeringsdrivende.length + (this.frilanser ? 1 : 0);
    }

    generateTgStrings = (intl: IntlShape): string[][] => this.arbeidstakerList.map((a: ArbeidstakerV2) => a.generateTgStrings());

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
    fødselsdato?: string;
}

export class Barn implements Required<IBarn> {

    norskIdentitetsnummer: string;
    fødselsdato: string;

    constructor(barn: IBarn) {
        this.norskIdentitetsnummer = barn.norskIdentitetsnummer || '';
        this.fødselsdato = barn.fødselsdato || '';
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
    søknadsperiode?: IPeriodeV2;
    barn?: IBarn;
    arbeidAktivitet?: IArbeidV2;
    beredskap?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
    nattevaak?: PeriodeinfoV2<ITilleggsinformasjonV2>[];
    tilsynsordning?: ITilsynsordningV2[];


}

export class Ytelse implements Required<IYtelse> {
    søknadsperiode: PeriodeV2;
    barn: Barn;
    arbeidAktivitet: ArbeidV2;
    beredskap: PeriodeinfoV2<TilleggsinformasjonV2>[];
    nattevaak: PeriodeinfoV2<TilleggsinformasjonV2>[];
    tilsynsordning: TilsynsordningV2[];

    private workPeriods: PeriodeinfoV2<IPeriodeinfoExtensionV2>[];
    private allPeriods: PeriodeinfoV2<IPeriodeinfoExtensionV2>[];



    constructor(ytelse: IYtelse) {
        this.søknadsperiode = new PeriodeV2(ytelse.søknadsperiode || {});
        this.barn = new Barn(ytelse.barn || {});
        this.arbeidAktivitet = new ArbeidV2(ytelse.arbeidAktivitet || {})
        this.beredskap = (ytelse.beredskap || []).map(b => new TilleggsinformasjonV2(b));
        this.nattevaak = (ytelse.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = (ytelse.tilsynsordning || []).map(t => new TilsynsordningV2(t));


        this.workPeriods = [];
 //       this.workPeriods.push(...this.arbeidAktivitet.arbeidstaker.reduce((pv: Tilstedevaerelsesgrad[], cv) => pv.concat(cv.arbeidstidInfo.perioder), []));
        this.workPeriods.push(...this.arbeidAktivitet.selvstendigNaeringsdrivende);
     //   this.workPeriods.push(...this.arbeidAktivitet.frilanser);

        this.allPeriods = [];
        this.allPeriods.push(...this.workPeriods);
        this.allPeriods.push(...this.beredskap);
        this.allPeriods.push(...this.nattevaak);
     //   this.allPeriods.push(...this.tilsynsordning);
    }

    values(): Required<IYtelse> {
        return {
            barn: this.barn,
            arbeidAktivitet: this.arbeidAktivitet.values(),
            beredskap: this.beredskap.map(b => b.values()),
            nattevaak: this.nattevaak.map(n => n.values()),
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

}
