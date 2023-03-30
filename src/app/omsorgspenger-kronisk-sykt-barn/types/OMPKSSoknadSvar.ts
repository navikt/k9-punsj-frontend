import { IOMPKSSoknad, OMPKSSoknad } from './OMPKSSoknad';

export interface IOMPKSSoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IOMPKSSoknad[];
}

export class OMPKSSoknadSvar implements IOMPKSSoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: OMPKSSoknad[];

    constructor(svar: IOMPKSSoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = (svar.søknader || []).map((s) => new OMPKSSoknad(s));
    }
}
