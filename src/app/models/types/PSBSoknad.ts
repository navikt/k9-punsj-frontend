/* eslint-disable max-classes-per-file */
import { ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende } from 'app/models/types/SelvstendigNaerinsdrivende';
import { Arbeidstaker, IArbeidstaker } from './Arbeidstaker';
import { FrilanserOpptjening, IFrilanserOpptjening } from './FrilanserOpptjening';
import {
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    IPeriodeMedTimerMinutter,
    Periode,
    PeriodeMedTimerMinutter,
} from './Periode';
import { Periodeinfo } from './Periodeinfo';
import { ArbeidstidInfo } from './ArbeidstidInfo';


export interface IPSBSoknad {
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

export interface ISelvstendigNaeringsdrivendeOpptjening {
    virksomhetNavn?: string | null;
    organisasjonsnummer?: string | null;
    info?: ISelvstendigNaerinsdrivende | null;
}

export class SelvstendigNaeringsdrivendeOpptjening implements Required<ISelvstendigNaeringsdrivendeOpptjening> {
    virksomhetNavn: string;

    organisasjonsnummer: string;

    info: SelvstendigNaerinsdrivende | null;

    constructor(s: ISelvstendigNaeringsdrivendeOpptjening) {
        this.virksomhetNavn = s.virksomhetNavn || '';
        this.organisasjonsnummer = s.organisasjonsnummer || '';
        this.info = s.info ? new SelvstendigNaerinsdrivende(s.info) : null;
    }
}

export interface IOpptjeningAktivitet {
    selvstendigNaeringsdrivende?: ISelvstendigNaeringsdrivendeOpptjening | null;
    frilanser?: IFrilanserOpptjening | null;
    arbeidstaker?: IArbeidstaker[];
}

export class OpptjeningAktivitet implements IOpptjeningAktivitet {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening | null;

    frilanser: FrilanserOpptjening | null;

    arbeidstaker: Arbeidstaker[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map((at) => new Arbeidstaker(at));
        this.selvstendigNaeringsdrivende = arbeid.selvstendigNaeringsdrivende
            ? new SelvstendigNaeringsdrivendeOpptjening(arbeid.selvstendigNaeringsdrivende)
            : null;
        this.frilanser = arbeid.frilanser ? new FrilanserOpptjening(arbeid.frilanser) : null;
    }
}

export interface IArbeidstidInfo {
    perioder?: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}
export interface IArbeidstid {
    arbeidstakerList?: IArbeidstaker[];
    frilanserArbeidstidInfo?: IArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo?: IArbeidstidInfo | null;
}
export class Arbeidstid implements Required<IArbeidstid> {
    arbeidstakerList: Arbeidstaker[];

    frilanserArbeidstidInfo: ArbeidstidInfo | null;

    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | null;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = a.arbeidstakerList ? a.arbeidstakerList.map((ab) => new Arbeidstaker(ab)) : [];
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo
            ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo)
            : null;
    }
}

export interface ISoknadsInfo {
    samtidigHjemme?: boolean | null;
    harMedsøker?: boolean | null;
}

export class SoknadsInfo implements ISoknadsInfo {
    samtidigHjemme: boolean | null;

    harMedsøker: boolean | null;

    constructor(s: ISoknadsInfo) {
        this.samtidigHjemme = s.samtidigHjemme || null;
        this.harMedsøker = s.harMedsøker || null;
    }
}

export interface ITilsynsordning {
    perioder?: Periodeinfo<IPeriodeMedTimerMinutter>[];
}

export class Tilsynsordning implements Required<ITilsynsordning> {
    perioder: PeriodeMedTimerMinutter[];

    constructor(t: ITilsynsordning) {
        this.perioder = (t.perioder || []).map((p) => new PeriodeMedTimerMinutter(p));
    }

    values(): Required<IPeriodeMedTimerMinutter>[] {
        return this.perioder.map((p) => p.values());
    }
}

export interface IOmsorg {
    relasjonTilBarnet?: string;
    beskrivelseAvOmsorgsrollen?: string;
}

export class Omsorg implements Required<IOmsorg> {
    relasjonTilBarnet: string;

    beskrivelseAvOmsorgsrollen: string;

    constructor(omsorg: IOmsorg) {
        this.relasjonTilBarnet = omsorg.relasjonTilBarnet || '';
        this.beskrivelseAvOmsorgsrollen = omsorg.beskrivelseAvOmsorgsrollen || '';
    }
}

export interface IUttak {
    periode?: Periode;
    etablertTilsynTimerPerDag?: string;
}

export class Uttak implements Required<Periodeinfo<IUttak>> {
    periode: Periode;

    etablertTilsynTimerPerDag: string;

    constructor(tilsynsordning: Periodeinfo<IUttak>) {
        this.periode = new Periode(tilsynsordning.periode || {});
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
        const { norskIdent, foedselsdato } = this; // tslint:disable-line:no-this-assignment
        return { norskIdent, foedselsdato };
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
            tilleggsinformasjon: this.tilleggsinformasjon,
        };
    }
}

export interface IOppholdsLand {
    land?: string;
}

export interface IUtenlandsOpphold {
    land?: string;
    årsak?: string;
}

export class UtenlandsOpphold implements Required<Periodeinfo<IUtenlandsOpphold>> {
    periode: Periode;

    land: string;

    årsak: string;

    constructor(periodeinfo: Periodeinfo<IUtenlandsOpphold>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.land = periodeinfo.land || '';
        this.årsak = periodeinfo.årsak || '';
    }

    values(): Required<Periodeinfo<IUtenlandsOpphold>> {
        return {
            periode: this.periode.values(),
            land: this.land,
            årsak: this.årsak,
        };
    }
}

export class PSBSoknad implements IPSBSoknad {
    soeknadId: string;

    soekerId: string;

    journalposter: Set<string>;

    mottattDato: string;

    klokkeslett: string;

    barn: Barn;

    soeknadsperiode: Periode | null;

    opptjeningAktivitet: OpptjeningAktivitet;

    arbeidstid: Arbeidstid;

    beredskap: Tilleggsinformasjon[];

    nattevaak: Tilleggsinformasjon[];

    tilsynsordning: Tilsynsordning;

    uttak: Uttak[];

    utenlandsopphold: UtenlandsOpphold[];

    lovbestemtFerie: Periode[];

    lovbestemtFerieSomSkalSlettes: Periode[];

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
        this.soeknadsperiode = soknad.soeknadsperiode ? new Periode(soknad.soeknadsperiode) : null;
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {});
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {});
        this.beredskap = (soknad.beredskap || []).map((b) => new Tilleggsinformasjon(b));
        this.nattevaak = (soknad.nattevaak || []).map((n) => new Tilleggsinformasjon(n));
        this.tilsynsordning = new Tilsynsordning(soknad.tilsynsordning || {});
        this.uttak = (soknad.uttak || []).map((t) => new Uttak(t));
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map((p) => new Periode(p));
        this.lovbestemtFerieSomSkalSlettes = (soknad.lovbestemtFerieSomSkalSlettes || []).map((p) => new Periode(p));
        this.omsorg = new Omsorg(soknad.omsorg || {});
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}
