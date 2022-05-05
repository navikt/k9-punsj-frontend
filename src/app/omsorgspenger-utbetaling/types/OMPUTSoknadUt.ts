/* eslint-disable max-classes-per-file */
import { PersonEnkel } from 'app/models/types';
import { Personvalg } from 'app/models/types/IdentState';

export interface IOMPUTSoknadUt {
    soeknadId: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    klokkeslett?: string;
    barn: PersonEnkel[];
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
}
export class OMPUTSoknadUt implements IOMPUTSoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    mottattDato: string;

    klokkeslett: string;

    barn: PersonEnkel[];

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    constructor(soknad: Omit<IOMPUTSoknadUt, 'barn'> & { barn: Personvalg[] }) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = soknad.barn ? soknad.barn.map((barn) => ({ norskIdent: barn.identitetsnummer })) : [];
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}
