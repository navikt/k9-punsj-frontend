import {ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende} from 'app/models/types/SelvstendigNaerinsdrivende';
import {FrilanserOpptjening, IFrilanserOpptjening} from "./FrilanserOpptjening";
import {IPeriodeinfoV2, PeriodeinfoV2} from "./PeriodeInfoV2";
import {
    IPeriodeMedFaktiskeTimer,
    IPeriodeMedTimerMinutter,
    IPeriodeV2,
    PeriodeMedFaktiskeTimer, PeriodeMedTimerMinutter,
    PeriodeV2
} from "./PeriodeV2";
import {ArbeidstakerV2, IArbeidstakerV2} from "./ArbeidstakerV2";
import {IntlShape} from "react-intl";

export interface IPSBSoknad {
    soeknadId?: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    barn: IBarn;
    sendtInn?: boolean;
    erFraK9?: boolean;
    soeknadsperiode?: IPeriodeV2;
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
}

export class PSBSoknad implements IPSBSoknad {

    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    barn: Barn;
    sendtInn: boolean;
    erFraK9: boolean;
    soeknadsperiode: PeriodeV2;
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

    constructor(soknad: IPSBSoknad) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.barn = new Barn(soknad.barn || {});
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.soeknadsperiode = new PeriodeV2(soknad.soeknadsperiode || {})
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
    }
}

export interface IOpptjeningAktivitet {
    selvstendigNaeringsdrivende?: ISelvstendigNaeringsdrivendeOpptjening[];
    frilanser?: IFrilanserOpptjening;
    arbeidstaker?: IArbeidstakerV2[];
}

export class OpptjeningAktivitet implements Required<IOpptjeningAktivitet> {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening[];
    frilanser: FrilanserOpptjening;
    arbeidstaker: ArbeidstakerV2[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(at => new ArbeidstakerV2(at));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaeringsdrivendeOpptjening(s));
        this.frilanser = new FrilanserOpptjening(arbeid.frilanser || {});
    }

    numberOfWorkPeriods(): number {
        return this.arbeidstaker.length + this.selvstendigNaeringsdrivende.length + (this.frilanser ? 1 : 0);
    }
}

export interface IArbeidstid {
    arbeidstakerList?: IArbeidstakerV2[];
    frilanserArbeidstidInfo?: IPeriodeMedFaktiskeTimer;
    selvstendigNæringsdrivendeArbeidstidInfo?: IArbeidstidInfo;
}

export class Arbeidstid implements Required<IArbeidstid>{
    arbeidstakerList: ArbeidstakerV2[];
    frilanserArbeidstidInfo: PeriodeMedFaktiskeTimer;
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = a.arbeidstakerList ? a.arbeidstakerList.map(ab => new ArbeidstakerV2(ab)) : [];
        this.frilanserArbeidstidInfo = new PeriodeMedFaktiskeTimer(a.frilanserArbeidstidInfo || {});
        this.selvstendigNæringsdrivendeArbeidstidInfo = new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo || {});
    }

    faktiskeTimer = (): string[][] => this.arbeidstakerList.map((a: ArbeidstakerV2) => a.generateFaktiskeTimer());
}

export interface IArbeidstidInfo {
    jobberNormaltTimerPerDag?: string;
    perioder?: PeriodeinfoV2<IPeriodeMedFaktiskeTimer>[];
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

export interface ISelvstendigNaeringsdrivendeOpptjening {
    virksomhetNavn?: string | null;
    organisasjonsnummer?: string | null;
    perioder: PeriodeinfoV2<ISelvstendigNaerinsdrivende>[];
}

export class SelvstendigNaeringsdrivendeOpptjening implements Required<ISelvstendigNaeringsdrivendeOpptjening>{
    virksomhetNavn: string;
    organisasjonsnummer: string;
    perioder: SelvstendigNaerinsdrivende[];

    constructor(s: ISelvstendigNaeringsdrivendeOpptjening) {

        this.virksomhetNavn = s.virksomhetNavn || "";
        this.organisasjonsnummer = s.organisasjonsnummer || "";
        this.perioder = s.perioder.map(p => new SelvstendigNaerinsdrivende(p))
    }
}

export interface ITilsynsordningV2 {
    perioder?: IPeriodeMedTimerMinutter[];
}

export class TilsynsordningV2 implements Required<ITilsynsordningV2>{
    perioder: PeriodeMedTimerMinutter[];

    constructor(t: ITilsynsordningV2) {
        this.perioder = (t.perioder || []).map(p => new PeriodeMedTimerMinutter(p));
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
}

export interface ITilleggsinformasjon {
    periode?: IPeriodeV2;
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
            periode: this.periode,
            tilleggsinformasjon: this.tilleggsinformasjon
        };
    }
}

export interface IOppholdsLand {
    periode?: IPeriodeV2;
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
    periode?: IPeriodeV2;
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
}
