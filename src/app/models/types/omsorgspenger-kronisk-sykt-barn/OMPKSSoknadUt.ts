/* eslint-disable max-classes-per-file */

import {Barn, IBarn} from './OMPKSSoknad';

export interface IOMPKSSoknadUt {
    soeknadId?: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    kroniskEllerFunksjonshemming: boolean;
}

export class OMPKSSoknadUt implements IOMPKSSoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    mottattDato: string;

    klokkeslett: string;

    barn: Barn | Record<string, unknown>;

    kroniskEllerFunksjonshemming: boolean;

    constructor(soknad: IOMPKSSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = soknad.barn ? new Barn(soknad.barn) : {};
        this.kroniskEllerFunksjonshemming = soknad.kroniskEllerFunksjonshemming;
    }
}
