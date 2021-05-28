import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {FrilanserOpptjening, IFrilanserOpptjening} from "./FrilanserOpptjening";
import {PeriodeinfoV2} from "./PeriodeInfoV2";
import {
    IArbeidstidPeriodeMedTimer,
    IPeriodeMedTimerMinutter,
    IPeriodeV2,
    ArbeidstidPeriodeMedTimer, PeriodeMedTimerMinutter,
    PeriodeV2
} from "./PeriodeV2";
import {ArbeidstakerV2, IArbeidstakerV2} from "./ArbeidstakerV2";

export interface IPSBSoknad {
    soeknadId?: string;
    soekerId: string;
    journalposter?: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    sendtInn?: boolean;
    erFraK9?: boolean;
    soeknadsperiode?: IPeriodeV2 | null;
    opptjeningAktivitet: IOpptjeningAktivitet;
    arbeidstid?: IArbeidstid;
    beredskap?: PeriodeinfoV2<ITilleggsinformasjon>[];
    nattevaak?: PeriodeinfoV2<ITilleggsinformasjon>[];
    tilsynsordning?: ITilsynsordningV2;
    uttak?: PeriodeinfoV2<IUttak>[];
    utenlandsopphold?: PeriodeinfoV2<IUtenlandsOpphold>[];
    lovbestemtFerie?: IPeriodeV2[];
    omsorg?: IOmsorg;
    bosteder?: PeriodeinfoV2<IUtenlandsOpphold>[];
    soknadsinfo?: ISoknadsInfo;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;

}

export class PSBSoknad implements IPSBSoknad {

    soeknadId: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato: string;
    klokkeslett: string;
    barn: Barn;
    sendtInn: boolean;
    erFraK9: boolean;
    soeknadsperiode: PeriodeV2 | null;
    opptjeningAktivitet: OpptjeningAktivitet;
    arbeidstid: Arbeidstid;
    beredskap: TilleggsinformasjonV2[];
    nattevaak: TilleggsinformasjonV2[];
    tilsynsordning: TilsynsordningV2;
    uttak: Uttak[];
    utenlandsopphold: UtenlandsOpphold[];
    lovbestemtFerie: PeriodeV2[];
    omsorg: Omsorg;
    bosteder: UtenlandsOpphold[];
    soknadsinfo: SoknadsInfo;
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;

    constructor(soknad: IPSBSoknad) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = new Set(soknad.journalposter || []);
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = new Barn(soknad.barn || {});
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.soeknadsperiode = soknad.soeknadsperiode ? new PeriodeV2(soknad.soeknadsperiode) : null;
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {})
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {})
        this.beredskap = (soknad.beredskap || []).map(b => new TilleggsinformasjonV2(b));
        this.nattevaak = (soknad.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = new TilsynsordningV2(soknad.tilsynsordning || {});
        this.uttak = (soknad.uttak || []).map(t => new Uttak(t));
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map(u => new UtenlandsOpphold(u));
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map(p => new PeriodeV2(p));
        this.omsorg = new Omsorg(soknad.omsorg || {});
        this.bosteder = (soknad.bosteder || []).map(m => new UtenlandsOpphold(m));
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.harInfoSomIkkeKanPunsjes = soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = soknad.harMedisinskeOpplysninger || false;
    }
}

export interface IOpptjeningAktivitet {
    selvstendigNaeringsdrivende?: ISelvstendigNaeringsdrivendeOpptjening | null;
    frilanser?: IFrilanserOpptjening | null;
    arbeidstaker?: IArbeidstakerV2[];
}

export class OpptjeningAktivitet implements IOpptjeningAktivitet {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening | null;
    frilanser: FrilanserOpptjening | null;
    arbeidstaker: ArbeidstakerV2[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(at => new ArbeidstakerV2(at));
        this.selvstendigNaeringsdrivende = arbeid.selvstendigNaeringsdrivende ?  new SelvstendigNaeringsdrivendeOpptjening(arbeid.selvstendigNaeringsdrivende) : null;
        this.frilanser = arbeid.frilanser ? new FrilanserOpptjening(arbeid.frilanser) : null;
    }

}

export interface IArbeidstid {
    arbeidstakerList?: IArbeidstakerV2[];
    frilanserArbeidstidInfo?: IArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo?: IArbeidstidInfo | null;
}

export class Arbeidstid implements Required<IArbeidstid>{
    arbeidstakerList: ArbeidstakerV2[];
    frilanserArbeidstidInfo: ArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | null;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = a.arbeidstakerList ? a.arbeidstakerList.map(ab => new ArbeidstakerV2(ab)) : [];
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo) : null;
    }
}

export interface IArbeidstidInfo {
    perioder?: PeriodeinfoV2<IArbeidstidPeriodeMedTimer>[];
}

export class ArbeidstidInfo implements Required<IArbeidstidInfo>{
    perioder: ArbeidstidPeriodeMedTimer[];

    constructor(ai: IArbeidstidInfo) {
        this.perioder = (ai.perioder || []).map(p => new ArbeidstidPeriodeMedTimer(p));
    }
}

export interface ISelvstendigNaeringsdrivendeOpptjening {
    virksomhetNavn?: string | null;
    organisasjonsnummer?: string | null;
    info?: ISelvstendigNaerinsdrivende | null;
}

export class SelvstendigNaeringsdrivendeOpptjening implements Required<ISelvstendigNaeringsdrivendeOpptjening>{
    virksomhetNavn: string;
    organisasjonsnummer: string;
    info: SelvstendigNaerinsdrivende | null;

    constructor(s: ISelvstendigNaeringsdrivendeOpptjening) {

        this.virksomhetNavn = s.virksomhetNavn || "";
        this.organisasjonsnummer = s.organisasjonsnummer || "";
        this.info = s.info ? new SelvstendigNaerinsdrivende(s.info) : null;
    }
}

export interface ISoknadsInfo {
    samtidigHjemme?: boolean | null;
    harMedsøker?: boolean | null;
}

export class SoknadsInfo implements ISoknadsInfo{
    samtidigHjemme: boolean | null;
    harMedsøker: boolean | null;

    constructor(s: ISoknadsInfo) {
        this.samtidigHjemme = s.samtidigHjemme || null;
        this.harMedsøker = s.harMedsøker || null;
    }
}

export interface ITilsynsordningV2 {
    perioder?: PeriodeinfoV2<IPeriodeMedTimerMinutter>[];
}

export class TilsynsordningV2 implements Required<ITilsynsordningV2>{
    perioder: PeriodeMedTimerMinutter[];

    constructor(t: ITilsynsordningV2) {
        this.perioder = (t.perioder || []).map(p => new PeriodeMedTimerMinutter(p));
    }

    values(): Required<IPeriodeMedTimerMinutter>[] {
        return this.perioder.map(p => p.values())
    }
}

export interface IOmsorg {
    relasjonTilBarnet?: string;
    beskrivelseAvOmsorgsrollen?: string;
}

export class Omsorg implements Required<IOmsorg>{
    relasjonTilBarnet: string;
    beskrivelseAvOmsorgsrollen: string;

    constructor(omsorg: IOmsorg) {
        this.relasjonTilBarnet = omsorg.relasjonTilBarnet || '';
        this.beskrivelseAvOmsorgsrollen = omsorg.beskrivelseAvOmsorgsrollen || '';
    }
}

export interface IUttak {
    periode?: PeriodeV2;
    etablertTilsynTimerPerDag?: string;
}

export class Uttak implements Required<PeriodeinfoV2<IUttak>> {

    periode: PeriodeV2;
    etablertTilsynTimerPerDag: string;
    constructor(tilsynsordning: PeriodeinfoV2<IUttak>) {
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

    values(): Required<IBarn> {
        const {norskIdent, foedselsdato} = this; // tslint:disable-line:no-this-assignment
        return {norskIdent, foedselsdato};
    }
}

export interface ITilleggsinformasjon {
    tilleggsinformasjon?: string;
}

export class TilleggsinformasjonV2 implements Required<PeriodeinfoV2<ITilleggsinformasjon>> {
    periode: PeriodeV2;
    tilleggsinformasjon: string;

    constructor(periodeinfo: PeriodeinfoV2<ITilleggsinformasjon>) {
        this.periode = new PeriodeV2(periodeinfo.periode || {});
        this.tilleggsinformasjon = periodeinfo.tilleggsinformasjon || '';
    }

    values(): Required<PeriodeinfoV2<ITilleggsinformasjon>> {
        return {
            periode: this.periode.values(),
            tilleggsinformasjon: this.tilleggsinformasjon
        };
    }
}

export interface IOppholdsLand {
    land?: string;
}

export class OppholdsLand implements Required<PeriodeinfoV2<IOppholdsLand>> {
    periode: PeriodeV2;
    land: string;

    constructor(periodeinfo: PeriodeinfoV2<IOppholdsLand>) {
        this.periode = new PeriodeV2(periodeinfo.periode || {});
        this.land = periodeinfo.land || '';
    }
}

export interface IUtenlandsOpphold {
    land?: string;
    årsak?: string;

}

export class UtenlandsOpphold implements Required<PeriodeinfoV2<IUtenlandsOpphold>> {
    periode: PeriodeV2;
    land: string;
    årsak: string;

    constructor(periodeinfo: PeriodeinfoV2<IUtenlandsOpphold>) {
        this.periode = new PeriodeV2(periodeinfo.periode || {});
        this.land = periodeinfo.land || '';
        this.årsak = periodeinfo.årsak || '';
    }

    values(): Required<PeriodeinfoV2<IUtenlandsOpphold>> {
        return {
            periode: this.periode.values(),
            land: this.land,
            årsak: this.årsak
        };
    }
}
