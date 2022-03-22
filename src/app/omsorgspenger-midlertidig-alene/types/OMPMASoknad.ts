/* eslint-disable max-classes-per-file */

import { IPeriode } from 'app/models/types';

export interface IOMPMASoknad {
    soeknadId?: string;
    soekerId: string;
    journalposter?: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    annenForelder: AnnenForelderType;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
}

export type AnnenForelderType = {
    norskIdent: string;
    situasjonType: string;
    situasjonBeskrivelse: string;
    periode: IPeriode;
};

export class OMPMASoknad implements IOMPMASoknad {
    soeknadId: string;

    soekerId: string;

    journalposter: Set<string>;

    mottattDato: string;

    klokkeslett: string;

    annenForelder: AnnenForelderType;

    harInfoSomIkkeKanPunsjes?: boolean;

    harMedisinskeOpplysninger?: boolean;

    constructor(soknad: IOMPMASoknad) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = new Set(soknad.journalposter || []);
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.annenForelder = soknad.annenForelder || {};
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}
