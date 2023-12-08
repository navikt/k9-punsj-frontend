/* eslint-disable max-classes-per-file */
import { Arbeidstid, IArbeidstid } from './Arbeidstid';
import BegrunnelseForInnsending from './BegrunnelseForInnsending';
import { Barn, IBarn } from './IBarn';
import { IOmsorg, Omsorg } from './Omsorg';
import { IOpptjeningAktivitet, OpptjeningAktivitet } from './OpptjeningAktivitet';
import { IPeriode, ITimerOgMinutter, Periode, PeriodeMedTimerMinutter } from './Periode';
import { Periodeinfo } from './Periodeinfo';
import { ISoknadsInfo, SoknadsInfo } from './SoknadsInfo';
import { IUtenlandsOpphold, UtenlandsOpphold } from './UtenlandsOpphold';
import { IUttak, Uttak } from './Uttak';

export interface IPSBSoknad {
    soeknadId?: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    soeknadsperiode: IPeriode[];
    opptjeningAktivitet: IOpptjeningAktivitet;
    arbeidstid?: IArbeidstid;
    beredskap?: Periodeinfo<ITilleggsinformasjon>[];
    nattevaak?: Periodeinfo<ITilleggsinformasjon>[];
    tilsynsordning?: ITilsynsordning;
    uttak?: Periodeinfo<IUttak>[];
    utenlandsopphold?: Periodeinfo<IUtenlandsOpphold>[];
    utenlandsoppholdV2?: Periodeinfo<IUtenlandsOpphold>[];
    lovbestemtFerie?: IPeriode[];
    lovbestemtFerieSomSkalSlettes?: IPeriode[];
    omsorg?: IOmsorg;
    bosteder?: Periodeinfo<IUtenlandsOpphold>[];
    soknadsinfo?: ISoknadsInfo;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
    trekkKravPerioder?: IPeriode[];
    begrunnelseForInnsending?: BegrunnelseForInnsending;
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

const getTrekkKravPerioder = (soknad: IPSBSoknad) => {
    if (soknad.trekkKravPerioder) {
        return soknad.trekkKravPerioder.map((periode) => new Periode(periode));
    }
    return undefined;
};

export class PSBSoknad implements IPSBSoknad {
    soeknadId: string;

    soekerId: string;

    journalposter: Set<string>;

    mottattDato: string;

    klokkeslett: string;

    barn: Barn;

    soeknadsperiode: Periode[];

    opptjeningAktivitet: OpptjeningAktivitet;

    arbeidstid: Arbeidstid;

    beredskap: Tilleggsinformasjon[];

    nattevaak: Tilleggsinformasjon[];

    tilsynsordning: Tilsynsordning;

    uttak: Uttak[];

    utenlandsopphold: UtenlandsOpphold[];

    utenlandsoppholdV2: UtenlandsOpphold[];

    lovbestemtFerie: Periode[];

    lovbestemtFerieSomSkalSlettes: Periode[];

    omsorg: Omsorg;

    bosteder: UtenlandsOpphold[];

    soknadsinfo: SoknadsInfo;

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    trekkKravPerioder?: Periode[];

    begrunnelseForInnsending?: BegrunnelseForInnsending;

    constructor(soknad: IPSBSoknad) {
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {});
        this.barn = new Barn(soknad.barn || {});
        this.begrunnelseForInnsending = soknad.begrunnelseForInnsending || { tekst: '' };
        this.beredskap = (soknad.beredskap || []).map((b) => new Tilleggsinformasjon(b));
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
        this.journalposter = new Set(soknad.journalposter || []);
        this.klokkeslett = soknad.klokkeslett || '';
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map((p) => new Periode(p));
        this.lovbestemtFerieSomSkalSlettes = (soknad.lovbestemtFerieSomSkalSlettes || []).map((p) => new Periode(p));
        this.mottattDato = soknad.mottattDato || '';
        this.nattevaak = (soknad.nattevaak || []).map((n) => new Tilleggsinformasjon(n));
        this.omsorg = new Omsorg(soknad.omsorg || {});
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {});
        this.soekerId = soknad.soekerId || '';
        this.soeknadId = soknad.soeknadId || '';
        this.soeknadsperiode = (soknad.soeknadsperiode || []).map((s) => new Periode(s));
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.tilsynsordning = new Tilsynsordning(soknad.tilsynsordning || {});
        this.trekkKravPerioder = getTrekkKravPerioder(soknad);
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.utenlandsoppholdV2 = (soknad.utenlandsoppholdV2 || soknad.utenlandsopphold || []).map(
            (u) => new UtenlandsOpphold(u),
        );
        this.uttak = (soknad.uttak || []).map((t) => new Uttak(t));
    }
}
