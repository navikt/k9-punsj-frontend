
import {ISoknadV2, SoknadV2} from "./Soknadv2";

export interface ISoknadSvar {
    søker: string;
    fagsakTypeKode: string;
    søknader: ISoknadV2[];
}

export class SoknadSvar implements ISoknadSvar {

    søker: string;
    fagsakTypeKode: string;
    søknader: SoknadV2[];

    constructor(svar: ISoknadSvar) {
        this.søker = svar.søker;
        this.fagsakTypeKode = svar.fagsakTypeKode;
        this.søknader = (svar.søknader || []).map(s => new SoknadV2(s));
    }
}

