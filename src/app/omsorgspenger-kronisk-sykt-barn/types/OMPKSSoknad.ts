/* eslint-disable max-classes-per-file */

export interface IOMPKSSoknad {
    soeknadId?: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
    k9saksnummer?: string;
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

export class OMPKSSoknad implements IOMPKSSoknad {
    soeknadId: string;

    soekerId: string;

    journalposter: Set<string>;

    mottattDato: string;

    klokkeslett: string;

    barn: Barn;

    harInfoSomIkkeKanPunsjes?: boolean;

    harMedisinskeOpplysninger?: boolean;

    k9saksnummer?: string;

    constructor(soknad: IOMPKSSoknad) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = new Set(soknad.journalposter || []);
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = new Barn(soknad.barn || {});
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
        this.k9saksnummer = soknad.k9saksnummer || undefined;
    }
}
