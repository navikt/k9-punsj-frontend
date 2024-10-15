import { Barn, IBarn } from './OMPKSSoknad';

export interface IOMPKSSoknadUt {
    soeknadId?: string;
    soekerId: string;
    journalposter?: string[];
    mottattDato?: string;
    klokkeslett?: string;
    barn: IBarn;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
}

export class OMPKSSoknadUt implements IOMPKSSoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    mottattDato: string;

    klokkeslett: string;

    barn: Barn | Record<string, unknown>;

    harInfoSomIkkeKanPunsjes: boolean;

    harMedisinskeOpplysninger: boolean;

    constructor(soknad: IOMPKSSoknadUt) {
        this.soeknadId = soknad.soeknadId || '';
        this.soekerId = soknad.soekerId || '';
        this.journalposter = soknad.journalposter || [];
        this.mottattDato = soknad.mottattDato || '';
        this.klokkeslett = soknad.klokkeslett || '';
        this.barn = soknad.barn ? new Barn(soknad.barn) : {};
        this.harInfoSomIkkeKanPunsjes = !!soknad.harInfoSomIkkeKanPunsjes || false;
        this.harMedisinskeOpplysninger = !!soknad.harMedisinskeOpplysninger || false;
    }
}
