import {FrilanserOpptjening} from "./FrilanserOpptjening";
import { PeriodeinfoV2} from "./PeriodeInfoV2";
import {
    IPeriodeV2,
    PeriodeMedFaktiskeTimer,
    PeriodeV2
} from "./PeriodeV2";
import {ArbeidstakerV2} from "./ArbeidstakerV2";
import {
    ArbeidstidInfo,
    Barn,
    IArbeidstid,
    IArbeidstidInfo,
    IBarn,
    IOmsorg,
    IOpptjeningAktivitet,
    IPSBSoknad,
    ISelvstendigNaeringsdrivendeOpptjening,
    ITilleggsinformasjon,
    ITilsynsordningV2,
    IUtenlandsOpphold,
    IUttak,
    Omsorg,
    OpptjeningAktivitet,
    SelvstendigNaeringsdrivendeOpptjening,
    TilleggsinformasjonV2,
    TilsynsordningV2,
    UtenlandsOpphold,
    Uttak
} from "./PSBSoknad";

export interface IPSBSoknadUt {
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
    nattevaak?: PeriodeinfoV2<ITilleggsinformasjon>[]
    tilsynsordning?: ITilsynsordningV2;
    uttak?: PeriodeinfoV2<IUttak>[];
    utenlandsopphold?: PeriodeinfoV2<IUtenlandsOpphold>[];
    lovbestemtFerie?: IPeriodeV2[];
    omsorg?: IOmsorg;
    bosteder?: PeriodeinfoV2<IUtenlandsOpphold>[];
}

export class PSBSoknadUt implements Required<IPSBSoknadUt> {

    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    barn: Barn | {};
    sendtInn: boolean;
    erFraK9: boolean;
    soeknadsperiode: PeriodeV2 | {};
    opptjeningAktivitet: OpptjeningAktivitetUt;
    arbeidstid: ArbeidstidUt;
    beredskap: TilleggsinformasjonV2[];
    nattevaak: TilleggsinformasjonV2[];
    tilsynsordning: TilsynsordningV2;
    uttak: Uttak[];
    utenlandsopphold: UtenlandsOpphold[];
    lovbestemtFerie: PeriodeV2[];
    omsorg: Omsorg | {};
    bosteder: UtenlandsOpphold[];

    constructor(soknad: IPSBSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.barn = soknad.barn ? new Barn(soknad.barn) : {};
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.soeknadsperiode = soknad.soeknadsperiode ? new PeriodeV2(soknad.soeknadsperiode) : {}
        this.opptjeningAktivitet = new OpptjeningAktivitetUt(soknad.opptjeningAktivitet || {})
        this.arbeidstid = new ArbeidstidUt(soknad.arbeidstid || {})
        this.beredskap = (soknad.beredskap || []).map(b => new TilleggsinformasjonV2(b));
        this.nattevaak = (soknad.nattevaak || []).map(n => new TilleggsinformasjonV2(n));
        this.tilsynsordning = new TilsynsordningV2(soknad.tilsynsordning || {});
        this.uttak = (soknad.uttak || []).map(t => new Uttak(t));
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map(u => new UtenlandsOpphold(u));
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map(p => new PeriodeV2(p));
        this.omsorg = soknad.omsorg ? new Omsorg(soknad.omsorg) : {};
        this.bosteder = (soknad.bosteder || []).map(m => new UtenlandsOpphold(m));
    }
}

export class OpptjeningAktivitetUt implements Required<IOpptjeningAktivitet> {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening[];
    frilanser: FrilanserOpptjening | {};
    arbeidstaker: ArbeidstakerV2[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(at => new ArbeidstakerV2(at));
        this.selvstendigNaeringsdrivende = (arbeid.selvstendigNaeringsdrivende || []).map(s => new SelvstendigNaeringsdrivendeOpptjening(s));
        this.frilanser = arbeid.frilanser ? new FrilanserOpptjening(arbeid.frilanser) : {};
    }
}

export class ArbeidstidUt implements Required<IArbeidstid>{
    arbeidstakerList: ArbeidstakerV2[];
    frilanserArbeidstidInfo: PeriodeMedFaktiskeTimer | {};
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | {};

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = (a.arbeidstakerList || []).map(at => new ArbeidstakerV2(at));
        this.frilanserArbeidstidInfo = (a.frilanserArbeidstidInfo?.periode?.fom &&a.frilanserArbeidstidInfo?.periode?.tom)? new PeriodeMedFaktiskeTimer(a.frilanserArbeidstidInfo) : {};
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo) : {};
    }

}
