import {FrilanserOpptjening} from "./FrilanserOpptjening";
import { PeriodeinfoV2} from "./PeriodeInfoV2";
import {
    IPeriodeV2,
    ArbeidstidPeriodeMedTimer,
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
    ISelvstendigNaeringsdrivendeOpptjening, ISoknadsInfo,
    ITilleggsinformasjon,
    ITilsynsordningV2,
    IUtenlandsOpphold,
    IUttak,
    Omsorg,
    OpptjeningAktivitet,
    SelvstendigNaeringsdrivendeOpptjening, SoknadsInfo,
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

export class PSBSoknadUt implements Required<IPSBSoknadUt> {

    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    barn: Barn | {};
    sendtInn: boolean;
    erFraK9: boolean;
    soeknadsperiode: PeriodeV2 | null;
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
    soknadsinfo: SoknadsInfo;
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;

    constructor(soknad: IPSBSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.barn = soknad.barn ? new Barn(soknad.barn) : {};
        this.sendtInn = soknad.sendtInn || false;
        this.erFraK9 = soknad.erFraK9 || false;
        this.soeknadsperiode = soknad.soeknadsperiode ? new PeriodeV2(soknad.soeknadsperiode) : null;
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
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.harInfoSomIkkeKanPunsjes = soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = soknad.harMedisinskeOpplysninger || false;
    }
}

export class OpptjeningAktivitetUt implements Required<IOpptjeningAktivitet> {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening | null;
    frilanser: FrilanserOpptjening | null;
    arbeidstaker: ArbeidstakerV2[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(at => new ArbeidstakerV2(at));
        this.selvstendigNaeringsdrivende = arbeid.selvstendigNaeringsdrivende ? new SelvstendigNaeringsdrivendeOpptjening(arbeid.selvstendigNaeringsdrivende) : null;
        this.frilanser = arbeid.frilanser  ? new FrilanserOpptjening(arbeid.frilanser) : null;
    }
}

export class ArbeidstidUt implements Required<IArbeidstid>{
    arbeidstakerList: ArbeidstakerV2[];
    frilanserArbeidstidInfo: ArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | {};

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = (a.arbeidstakerList || []).map(at => new ArbeidstakerV2(at));
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo) : {};
    }

}
