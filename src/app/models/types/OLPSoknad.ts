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
import { v4 } from 'uuid';

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

const initialKurs = (soknad: IOLPSoknadBackend, eksisterendePerioder: Periode[]) => {
    // vi har en mellomlagret søknad
    if (soknad.kurs) {
        return new Kurs(soknad.kurs);
    }

    // vi har en ny søknad, og vi har perioder i k9
    if (eksisterendePerioder.length > 0) {
        return new Kurs({
            kursHolder: { institusjonsUuid: null, holder: '' },
            kursperioder: [],
            reise: { reisedager: [], reisedagerBeskrivelse: '' },
        });
    }

    // vi har en ny søknad, og ingen perioder i k9
    return new Kurs({
        kursHolder: { institusjonsUuid: null, holder: '' },
        kursperioder: [{ periode: new Periode({ fom: '', tom: '' }), key: v4() }],
        reise: { reisedager: [], reisedagerBeskrivelse: '' },
    });
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
        skalOppgiReise: JaNei;
        nyttInstitusjonsopphold: boolean;
        harSøkerRegnskapsfører: JaNei;
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

    soknadsinfo: SoknadsInfo;

    trekkKravPerioder?: Periode[];

    utenlandsopphold: UtenlandsOpphold[];

    uttak: Uttak[] | null;

    constructor(soknad: IOLPSoknadBackend, eksisterendePerioder: Periode[] = []) {
        this.metadata = soknad.metadata || {
            harBoddIUtlandet: '',
            harUtenlandsopphold: '',
            harValgtAnnenInstitusjon: [],
            skalOppgiReise: '',
            nyttInstitusjonsopphold: soknad.kurs || eksisterendePerioder.length === 0,
            harSøkerRegnskapsfører: JaNei.NEI,
        };
        this.arbeidstid = new Arbeidstid(soknad.arbeidstid || {});
        this.barn = new Barn(soknad.barn || {});
        this.begrunnelseForInnsending = soknad.begrunnelseForInnsending || { tekst: '' };
        this.bosteder = (soknad.bosteder || []).map((m) => new UtenlandsOpphold(m));
        this.journalposter = soknad.journalposter || [];
        this.klokkeslett = soknad.klokkeslett || '';
        this.kurs = initialKurs(soknad, eksisterendePerioder);
        this.lovbestemtFerie = (soknad.lovbestemtFerie || []).map((p) => new Periode(p));
        this.mottattDato = soknad.mottattDato || '';
        this.omsorg = new Omsorg(soknad.omsorg || {});
        this.opptjeningAktivitet = new OpptjeningAktivitet(soknad.opptjeningAktivitet || {});
        this.soekerId = soknad.soekerId || '';
        this.soeknadId = soknad.soeknadId || '';
        this.soknadsinfo = new SoknadsInfo(soknad.soknadsinfo || {});
        this.trekkKravPerioder = getTrekkKravPerioder(soknad);
        this.utenlandsopphold = (soknad.utenlandsopphold || []).map((u) => new UtenlandsOpphold(u));
        this.uttak = soknad.uttak && soknad.uttak.length > 0 ? soknad.uttak.map((t) => new Uttak(t)) : null;
    }
}
