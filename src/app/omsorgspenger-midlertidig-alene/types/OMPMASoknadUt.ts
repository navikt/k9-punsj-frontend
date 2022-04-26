/* eslint-disable max-classes-per-file */
import { PersonEnkel } from 'app/models/types';

export interface IOMPMASoknadUt {
    soeknadId: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    klokkeslett?: string;
    barn: PersonEnkel[];
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
}

class Barn implements Required<PersonEnkel> {
    norskIdent: string;

    constructor(barn: PersonEnkel) {
        this.norskIdent = barn.norskIdent || '';
    }

    values(): Required<PersonEnkel> {
        const { norskIdent } = this; // tslint:disable-line:no-this-assignment
        return { norskIdent };
    }
}

export class OMPMASoknadUt implements IOMPMASoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    mottattDato: string;

    klokkeslett: string;

    barn: PersonEnkel[];

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    constructor(soknad: IOMPMASoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = soknad.barn ? soknad.barn.map((barn) => new Barn(barn)) : [];
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}
