import { IOMPMASoknad, OMPMASoknad } from './OMPMASoknad';

export interface IOMPMASoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IOMPMASoknad[];
}

export class OMPMASoknadSvar implements IOMPMASoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: OMPMASoknad[];

    constructor(svar: IOMPMASoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = (svar.søknader || []).map((s) => new OMPMASoknad(s));
    }
}
