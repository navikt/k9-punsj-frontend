import { IPLSSoknad, PLSSoknad } from './PLSSoknad';

export interface IPLSSoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IPLSSoknad[];
}

export class PLSSoknadSvar implements IPLSSoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: PLSSoknad[];

    constructor(svar: IPLSSoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = (svar.søknader || []).map((s) => new PLSSoknad(s));
    }
}
