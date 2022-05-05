import {IOMPUTSoknad, OMPUTSoknad} from './OMPUTSoknad';

export interface IOMPUTSoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IOMPUTSoknad[];
}

export class OMPUTSoknadSvar implements IOMPUTSoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: OMPUTSoknad[];

    constructor(svar: IOMPUTSoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = (svar.søknader || []).map((s) => new OMPUTSoknad(s));
    }
}
