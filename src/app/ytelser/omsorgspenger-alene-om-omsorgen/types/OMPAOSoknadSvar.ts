import { IOMPAOSoknad } from './OMPAOSoknad';

export interface IOMPAOSoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IOMPAOSoknad[];
}

export class OMPAOSoknadSvar implements IOMPAOSoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: IOMPAOSoknad[];

    constructor(svar: IOMPAOSoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = svar.søknader || [];
    }
}
