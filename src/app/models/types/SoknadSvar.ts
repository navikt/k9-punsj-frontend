import { IPSBSoknad, PSBSoknad } from './PSBSoknad';

export interface ISoknadSvar {
    søker?: string;
    fagsakTypeKode?: string;
    søknader?: IPSBSoknad[];
}

export class SoknadSvar implements ISoknadSvar {
    søker: string;

    fagsakTypeKode: string;

    søknader: PSBSoknad[];

    constructor(svar: ISoknadSvar) {
        this.søker = svar.søker || '';
        this.fagsakTypeKode = svar.fagsakTypeKode || '';
        this.søknader = (svar.søknader || []).map((s) => new PSBSoknad(s));
    }
}
