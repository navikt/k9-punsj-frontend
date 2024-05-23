/* eslint-disable max-classes-per-file */
import { ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende } from 'app/models/types/SelvstendigNaerinsdrivende';

import {
    Arbeidstaker,
    IArbeidstaker,
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    ITimerOgMinutter,
    Periode,
    PeriodeMedTimerMinutter,
    Periodeinfo,
} from '../../models/types';
import { ArbeidstidInfo } from '../../models/types/ArbeidstidInfo';
import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';
import { FrilanserOpptjening, IFrilanserOpptjening } from '../../models/types/FrilanserOpptjening';

export interface IPLSSoknad {
    soeknadId: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    soeknadsperiode?: IPeriode[] | null;
    pleietrengende: IPleietrengende;
    arbeidstid?: IArbeidstid;
    opptjeningAktivitet: IOpptjeningAktivitet;
    bosteder?: Periodeinfo<IUtenlandsOpphold>[];
    utenlandsopphold?: Periodeinfo<IUtenlandsOpphold>[];
    lovbestemtFerie?: IPeriode[];
    lovbestemtFerieSomSkalSlettes?: IPeriode[];
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
    trekkKravPerioder?: IPeriode[];
    begrunnelseForInnsending?: BegrunnelseForInnsending;
    k9saksnummer?: string;
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
    perioder?: Periodeinfo<ITimerOgMinutter>[];
}

export class Tilsynsordning implements Required<ITilsynsordning> {
    perioder: PeriodeMedTimerMinutter[];

    constructor(t: ITilsynsordning) {
        this.perioder = (t.perioder || []).map((p) => new PeriodeMedTimerMinutter(p));
    }

    values(): Required<ITimerOgMinutter>[] {
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

export interface IPleietrengende {
    norskIdent?: string;
}

export class Pleietrengende implements Required<IPleietrengende> {
    norskIdent: string;

    constructor(barn: IPleietrengende) {
        this.norskIdent = barn.norskIdent || '';
    }

    values(): Required<IPleietrengende> {
        const { norskIdent } = this; // tslint:disable-line:no-this-assignment
        return { norskIdent };
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

const getTrekkKravPerioder = (soknad: IPLSSoknad) => {
    if (soknad.trekkKravPerioder) {
        return soknad.trekkKravPerioder.map((periode) => new Periode(periode));
    }
    return undefined;
};

export class PLSSoknad implements IPLSSoknad {
    soeknadId: string;

    soekerId: string;

    journalposter: Set<string>;

    mottattDato: string;

    klokkeslett: string;

    soeknadsperiode: Periode[] | null;

    pleietrengende: Pleietrengende;

    arbeidstid: Arbeidstid;

    opptjeningAktivitet: OpptjeningAktivitet;

    bosteder: UtenlandsOpphold[];

    utenlandsopphold: UtenlandsOpphold[];

    lovbestemtFerie: Periode[];

    lovbestemtFerieSomSkalSlettes: Periode[];

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    trekkKravPerioder?: Periode[];

    begrunnelseForInnsending?: BegrunnelseForInnsending;

    k9saksnummer?: string;

    constructor(soknad: IPLSSoknad) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = new Set(soknad.journalposter || []);
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.pleietrengende = new Pleietrengende(soknad.pleietrengende || {});
        this.soeknadsperiode = (soknad.soeknadsperiode || []).map((s) => new Periode(s));
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {});
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {});
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map((p) => new Periode(p));
        this.lovbestemtFerieSomSkalSlettes = (soknad.lovbestemtFerieSomSkalSlettes || []).map((p) => new Periode(p));
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
        this.trekkKravPerioder = getTrekkKravPerioder(soknad);
        this.begrunnelseForInnsending = soknad.begrunnelseForInnsending || { tekst: '' };
        this.k9saksnummer = soknad.k9saksnummer || undefined;
    }
}
