import {FrilanserOpptjening} from "./FrilanserOpptjening";
import {Periodeinfo} from "./Periodeinfo";
import {
    IPeriode,
    Periode
} from "./Periode";
import {Arbeidstaker} from "./Arbeidstaker";
import {
    ArbeidstidInfo,
    Barn,
    IArbeidstid,
    IBarn,
    IOmsorg,
    IOpptjeningAktivitet,
    ISoknadsInfo,
    ITilleggsinformasjon,
    ITilsynsordning,
    IUtenlandsOpphold,
    IUttak,
    Omsorg,
    SelvstendigNaeringsdrivendeOpptjening, SoknadsInfo,
    Tilleggsinformasjon,
    Tilsynsordning,
    UtenlandsOpphold,
    Uttak
} from "./PSBSoknad";

export interface IPSBSoknadUt {
    soeknadId?: string;
    soekerId: string;
    journalposter?: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    soeknadsperiode?: IPeriode | null;
    opptjeningAktivitet: IOpptjeningAktivitet;
    arbeidstid?: IArbeidstid;
    beredskap?: Periodeinfo<ITilleggsinformasjon>[];
    nattevaak?: Periodeinfo<ITilleggsinformasjon>[];
    tilsynsordning?: ITilsynsordning;
    uttak?: Periodeinfo<IUttak>[];
    utenlandsopphold?: Periodeinfo<IUtenlandsOpphold>[];
    lovbestemtFerie?: IPeriode[];
    lovbestemtFerieSomSkalSlettes?: IPeriode[];
    omsorg?: IOmsorg;
    bosteder?: Periodeinfo<IUtenlandsOpphold>[];
    soknadsinfo?: ISoknadsInfo;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
}

export class PSBSoknadUt implements IPSBSoknadUt {
    soeknadId: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato: string;
    klokkeslett: string;
    barn: Barn | {};
    soeknadsperiode: Periode | null;
    opptjeningAktivitet: OpptjeningAktivitetUt;
    arbeidstid: ArbeidstidUt;
    beredskap: Tilleggsinformasjon[];
    nattevaak: Tilleggsinformasjon[];
    tilsynsordning: Tilsynsordning;
    uttak: Uttak[];
    utenlandsopphold: UtenlandsOpphold[];
    lovbestemtFerie: Periode[];
    lovbestemtFerieSomSkalSlettes: Periode[];
    omsorg: Omsorg | {};
    bosteder: UtenlandsOpphold[];
    soknadsinfo: SoknadsInfo;
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;

    constructor(soknad: IPSBSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = new Set(soknad.journalposter || []);
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = soknad.barn ? new Barn(soknad.barn) : {};
        this.soeknadsperiode = soknad.soeknadsperiode ? new Periode(soknad.soeknadsperiode) : null;
        this.opptjeningAktivitet = new OpptjeningAktivitetUt(soknad.opptjeningAktivitet || {})
        this.arbeidstid = new ArbeidstidUt(soknad.arbeidstid || {})
        this.beredskap = (soknad.beredskap || []).map(b => new Tilleggsinformasjon(b));
        this.nattevaak = (soknad.nattevaak || []).map(n => new Tilleggsinformasjon(n));
        this.tilsynsordning = new Tilsynsordning(soknad.tilsynsordning || {});
        this.uttak = (soknad.uttak || []).map(t => new Uttak(t));
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map(u => new UtenlandsOpphold(u));
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map(p => new Periode(p));
        this.lovbestemtFerieSomSkalSlettes = (soknad.lovbestemtFerieSomSkalSlettes || []).map(p => new Periode(p));
        this.omsorg = soknad.omsorg ? new Omsorg(soknad.omsorg) : {};
        this.bosteder = (soknad.bosteder || []).map(m => new UtenlandsOpphold(m));
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}

export class OpptjeningAktivitetUt implements Required<IOpptjeningAktivitet> {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening | null;
    frilanser: FrilanserOpptjening | null;
    arbeidstaker: Arbeidstaker[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map(at => new Arbeidstaker(at));
        this.selvstendigNaeringsdrivende = arbeid.selvstendigNaeringsdrivende ? new SelvstendigNaeringsdrivendeOpptjening(arbeid.selvstendigNaeringsdrivende) : null;
        this.frilanser = arbeid.frilanser ? new FrilanserOpptjening(arbeid.frilanser) : null;
    }
}

export class ArbeidstidUt implements Required<IArbeidstid> {
    arbeidstakerList: Arbeidstaker[];
    frilanserArbeidstidInfo: ArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | {};

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = (a.arbeidstakerList || []).map(at => new Arbeidstaker(at));
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo) : {};
    }

}
