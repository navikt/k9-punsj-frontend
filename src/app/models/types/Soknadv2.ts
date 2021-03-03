import { Periodeinfo}  from 'app/models/types/Periodeinfo';
import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {FrilanserV2, IFrilanserV2} from "./FrilanserV2";
import {PeriodeinfoV2} from "./PeriodeInfoV2";
import {IPeriodeMedFaktiskeTimer, IPeriodeV2, PeriodeMedFaktiskeTimer, PeriodeV2} from "./PeriodeV2";
import {ArbeidstakerV2, IArbeidstakerV2} from "./ArbeidstakerV2";
import {IntlShape} from "react-intl";
import {Arbeidstaker} from "./Arbeidstaker";

export interface ISoknadV2 {
    soeknadId?: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    barn: IBarn;
    sendtInn?: boolean;
    erFraK9?: boolean;
    soeknadsperiode?: IPeriodeV2;
    arbeidAktivitet: IArbeidV2;
    arbeidstid?: IArbeidstid;
    beredskap?: ITilleggsinformasjonV2[];
    nattevaak?: ITilleggsinformasjonV2[];
    tilsynsordning?: ITilsynsordningV2[];
    omsorg: IOmsorg;
}

export class SoknadV2 implements ISoknadV2 {

    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    barn: Barn;
    sendtInn: boolean;
    erFraK9: boolean;
    soeknadsperiode: PeriodeV2;
    arbeidAktivitet: ArbeidV2;
    arbeidstid: Arbeidstid;
    beredskap: TilleggsinformasjonV2[];
    nattevaak: TilleggsinformasjonV2[];
    tilsynsordning: TilsynsordningV2[];
    omsorg: Omsorg;

    constructor(soknad: ISoknadV2) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId;
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.barn = new Barn(soknad.barn);
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.soeknadsperiode = new PeriodeV2(soknad.soeknadsperiode || {})
        this.arbeidAktivitet = new ArbeidV2(soknad.arbeidAktivitet || {})
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {})
        this.beredskap = (soknad.beredskap || []).map(b => new TilleggsinformasjonV2(b));
        this.nattevaak = (soknad.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = (soknad.tilsynsordning || []).map(t => new TilsynsordningV2(t));
        this.omsorg = new Omsorg(soknad.omsorg || {})
    }
}

export interface IArbeidV2 {
    selvstendigNaeringsdrivende?: Periodeinfo<ISelvstendigNaerinsdrivende>[];
    frilanser?: IFrilanserV2;
    arbeidstakerList?: IArbeidstakerV2[];
}

export class ArbeidV2 implements Required<IArbeidV2> {
    selvstendigNaeringsdrivende: SelvstendigNaerinsdrivende[];
    frilanser: FrilanserV2;
    arbeidstakerList: ArbeidstakerV2[];

    constructor(arbeid: IArbeidV2) {
        this.arbeidstakerList = (arbeid.arbeidstakerList || []).map(at => new ArbeidstakerV2(at));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaerinsdrivende(s));
        this.frilanser = new FrilanserV2(arbeid.frilanser || {});
    }

    numberOfWorkPeriods(): number {
        return this.arbeidstakerList.length + this.selvstendigNaeringsdrivende.length + (this.frilanser ? 1 : 0);
    }
}

export interface IArbeidstid {
    arbeidstakerList?: IArbeidstakerV2[];
    frilanserArbeidstidInfo?: IArbeidstidInfo;
    selvstendigNæringsdrivendeArbeidstidInfo?: IArbeidstidInfo;
}

export class Arbeidstid implements Required<IArbeidstid>{
    arbeidstakerList: ArbeidstakerV2[];
    frilanserArbeidstidInfo: ArbeidstidInfo;
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = (a.arbeidstakerList || []).map(at => new ArbeidstakerV2(at));
        this.frilanserArbeidstidInfo = new ArbeidstidInfo(a.frilanserArbeidstidInfo || {});
        this.selvstendigNæringsdrivendeArbeidstidInfo = new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo || {});
    }

    faktiskeTimer = (): string[][] => this.arbeidstakerList.map((a: ArbeidstakerV2) => a.generateFaktiskeTimer());
}

export interface IArbeidstidInfo {
    jobberNormaltTimerPerDag?: string;
    perioder?: IPeriodeMedFaktiskeTimer[];
}

export class ArbeidstidInfo implements Required<IArbeidstidInfo>{
    jobberNormaltTimerPerDag: string;
    perioder: PeriodeMedFaktiskeTimer[];

    constructor(ai: IArbeidstidInfo) {
        this.jobberNormaltTimerPerDag = ai.jobberNormaltTimerPerDag || '0';
        this.perioder = (ai.perioder || []).map(p => new PeriodeMedFaktiskeTimer(p));
    }

    faktiskTimer = (): string[] => this.perioder.map(p => p.faktiskArbeidTimerPerDag);
}

export interface IOmsorg {
    relasjonTilBarnet?: string;
    samtykketOmsorgForBarnet: boolean,
    beskrivelseAvOmsorgsrollen?: string;
}

export class Omsorg implements Required<IOmsorg>{
    relasjonTilBarnet: string;
    samtykketOmsorgForBarnet: boolean;
    beskrivelseAvOmsorgsrollen: string;

    constructor(omsorg: IOmsorg) {
        this.beskrivelseAvOmsorgsrollen = omsorg.beskrivelseAvOmsorgsrollen || '';
        this.samtykketOmsorgForBarnet = omsorg.samtykketOmsorgForBarnet;
        this.beskrivelseAvOmsorgsrollen = omsorg.beskrivelseAvOmsorgsrollen || '';
    }
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
}

export interface ITilleggsinformasjonV2 {
    periode: IPeriodeV2;
    tilleggsinformasjon?: string;
}

export class TilleggsinformasjonV2 implements Required<ITilleggsinformasjonV2> {
    periode: PeriodeV2;
    tilleggsinformasjon: string;

    constructor(periodeinfo: PeriodeinfoV2<ITilleggsinformasjonV2>) {
        this.periode = new PeriodeV2(periodeinfo.periode || {});
        this.tilleggsinformasjon = periodeinfo.tilleggsinformasjon || '';
    }

    values(): Required<PeriodeinfoV2<ITilleggsinformasjonV2>> {
        return {
            periode: this.periode,
            tilleggsinformasjon: this.tilleggsinformasjon
        };
    }
}
