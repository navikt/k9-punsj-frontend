import { JaNei } from '../enums/JaNei';
import { JaNeiIkkeOpplyst } from '../enums/JaNeiIkkeOpplyst';
import { Arbeidstid } from './Arbeidstid';
import { Barn, IBarn } from './IBarn';
import { Kurs } from './Kurs';
import { Omsorg } from './Omsorg';
import { OpptjeningAktivitet } from './OpptjeningAktivitet';
import { Periode } from './Periode';
import { SoknadsInfo } from './SoknadsInfo';
import { UtenlandsOpphold } from './UtenlandsOpphold';
import { Uttak } from './Uttak';

export interface IOLPSoknadBackend {
    metadata?: any;
    arbeidstid?: Arbeidstid;
    barn?: IBarn;
    begrunnelseForInnsending?: BegrunnelseForInnsending;
    bosteder?: Bosteder[];
    journalposter: string[];
    klokkeslett?: string;
    kurs?: Kurs;
    lovbestemtFerie?: Periode[];
    mottattDato?: string;
    omsorg?: Omsorg;
    opptjeningAktivitet?: OpptjeningAktivitet;
    soekerId: string;
    soeknadId: string;
    soeknadsperiode?: Periode[] | null;
    soknadsinfo?: SoknadsInfo;
    trekkKravPerioder?: Periode[];
    utenlandsopphold?: UtenlandsOpphold[];
    uttak?: Uttak[] | null;
}

export interface BegrunnelseForInnsending {
    tekst: string;
}

export interface Bosteder {
    periode: Periode;
    land: string;
}

const getTrekkKravPerioder = (soknad: IOLPSoknadBackend) => {
    if (soknad.trekkKravPerioder) {
        return soknad.trekkKravPerioder.map((periode) => new Periode(periode));
    }
    return undefined;
};

export interface IOppholdsLand {
    land?: string;
}

export class OLPSoknad implements IOLPSoknadBackend {
    metadata: {
        harBoddIUtlandet: JaNeiIkkeOpplyst;
        harUtenlandsopphold: JaNeiIkkeOpplyst;
        // checkbox komponenten er array, men vi har kun en verdi
        harValgtAnnenInstitusjon: Array<JaNei>;
    };
    arbeidstid: Arbeidstid;

    barn?: Barn;

    begrunnelseForInnsending: BegrunnelseForInnsending;

    bosteder: Bosteder[];

    journalposter: string[];

    klokkeslett?: string;

    kurs: Kurs;

    lovbestemtFerie: Periode[];

    mottattDato: string;

    omsorg: Omsorg;

    opptjeningAktivitet: OpptjeningAktivitet;

    soekerId: string;

    soeknadId: string;

    soeknadsperiode: Periode[] | null;

    soknadsinfo: SoknadsInfo;

    trekkKravPerioder?: Periode[];

    utenlandsopphold: UtenlandsOpphold[];

    uttak: Uttak[] | null;

    constructor(soknad: IOLPSoknadBackend) {
        this.metadata = soknad.metadata || {};
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {});
        this.barn = new Barn(soknad.barn || {});
        this.begrunnelseForInnsending = soknad.begrunnelseForInnsending || { tekst: '' };
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.journalposter = soknad.journalposter || [];
        this.klokkeslett = soknad.klokkeslett || '';
        this.kurs = new Kurs(
            soknad.kurs || {
                kursHolder: { institusjonsUuid: '', holder: '' },
                kursperioder: [],
                reise: { reisedager: [], reisedagerBeskrivelse: '' },
            },
        );
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map((p) => new Periode(p));
        this.mottattDato = soknad.mottattDato || '';
        this.omsorg = new Omsorg(soknad.omsorg || {});
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {});
        this.soekerId = soknad.soekerId || '';
        this.soeknadId = soknad.soeknadId || '';
        this.soeknadsperiode =
            soknad.soeknadsperiode && soknad.soeknadsperiode.length > 0
                ? soknad.soeknadsperiode.map((s) => new Periode(s))
                : null;
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.trekkKravPerioder = getTrekkKravPerioder(soknad);
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.uttak = soknad.uttak && soknad.uttak.length > 0 ? soknad.uttak.map((t) => new Uttak(t)) : null;
    }
}
