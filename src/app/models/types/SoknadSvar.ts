
import {SoknadV2} from "./Soknadv2";

export interface ISoknadSvar {
    søker: string;
    fagsakTypeKode: string;
    søknader: ISoknadInfo[];
}

export class SoknadSvar implements ISoknadSvar {

    søker: string;
    fagsakTypeKode: string;
    søknader: ISoknadInfo[];

    constructor(svar: ISoknadSvar) {
        this.søker = svar.søker;
        this.fagsakTypeKode = svar.fagsakTypeKode;
        this.søknader = svar.søknader;
    }
}



export interface ISoknadInfo {
   søknadId: string;
   erFraK9: boolean;
   søknad: SoknadV2;
}

