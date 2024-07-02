import { Arbeidstaker, IPeriode, Periode, Periodeinfo } from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import BegrunnelseForInnsending from 'app/models/types/BegrunnelseForInnsending';
import { FrilanserOpptjening } from 'app/models/types/FrilanserOpptjening';
import {
    IArbeidstid,
    IOpptjeningAktivitet,
    IPleietrengende,
    IUtenlandsOpphold,
    Pleietrengende,
    SelvstendigNaeringsdrivendeOpptjening,
    UtenlandsOpphold,
} from './PLSSoknad';

export interface IPLSSoknadUt {
    soeknadId?: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    klokkeslett?: string;
    soeknadsperiode?: IPeriode[] | null;
    pleietrengende: IPleietrengende;
    arbeidstid?: IArbeidstid;
    opptjeningAktivitet: IOpptjeningAktivitet;
    bosteder?: Periodeinfo<IUtenlandsOpphold>[];
    utenlandsopphold?: Periodeinfo<IUtenlandsOpphold>[];
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
    trekkKravPerioder?: IPeriode[];
    begrunnelseForInnsending?: BegrunnelseForInnsending;
}

export class ArbeidstidUt implements Required<IArbeidstid> {
    arbeidstakerList: Arbeidstaker[];

    frilanserArbeidstidInfo: ArbeidstidInfo | null;

    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | Record<string, unknown>;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = (a.arbeidstakerList || []).map((at) => new Arbeidstaker(at));
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo
            ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo)
            : {};
    }
}

export class OpptjeningAktivitetUt implements Required<IOpptjeningAktivitet> {
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

const getTrekkKravPerioder = (soknad: IPLSSoknadUt) => {
    if (soknad.trekkKravPerioder) {
        return soknad.trekkKravPerioder.map((periode) => new Periode(periode));
    }
    return undefined;
};

export class PLSSoknadUt implements IPLSSoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    mottattDato: string;

    klokkeslett: string;

    soeknadsperiode: Periode[] | null;

    pleietrengende: Pleietrengende | Record<string, unknown>;

    arbeidstid: ArbeidstidUt;

    opptjeningAktivitet: OpptjeningAktivitetUt;

    bosteder: UtenlandsOpphold[];

    utenlandsopphold: UtenlandsOpphold[];

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    trekkKravPerioder?: Periode[];

    begrunnelseForInnsending?: BegrunnelseForInnsending;

    constructor(soknad: IPLSSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.pleietrengende = soknad.pleietrengende ? new Pleietrengende(soknad.pleietrengende) : {};
        this.soeknadsperiode = (soknad.soeknadsperiode || []).map((s) => new Periode(s));
        this.opptjeningAktivitet = new OpptjeningAktivitetUt(soknad.opptjeningAktivitet || {});
        this.arbeidstid = new ArbeidstidUt(soknad.arbeidstid || {});
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
        this.trekkKravPerioder = getTrekkKravPerioder(soknad);
        this.begrunnelseForInnsending = soknad.begrunnelseForInnsending || { tekst: '' };
    }
}
