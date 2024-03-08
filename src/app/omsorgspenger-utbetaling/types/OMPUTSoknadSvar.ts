import { IOMPUTSoknad } from './OMPUTSoknad';

export interface IOMPUTSoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IOMPUTSoknad[];
}

export class OMPUTSoknadSvar implements IOMPUTSoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: IOMPUTSoknad[];

    constructor(svar: IOMPUTSoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = svar.søknader || [];
    }
}
