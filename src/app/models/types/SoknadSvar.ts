
import {ISoknadV2, SoknadV2} from "./Soknadv2";

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
   søknadId?: string;
   erFraK9: boolean;
   søknad?: ISoknadV2;
   søkerId: string;
}

export class SoknadInfo implements ISoknadInfo {
    søknadId: string;
    erFraK9: boolean;
    søknad: SoknadV2;
    søkerId: string;

    constructor(info: ISoknadInfo) {
        this.søknadId = info.søknadId || '';
        this.erFraK9 = info.erFraK9;
        this.søkerId = info.søkerId;
        this.søknad = new SoknadV2(info.søknad || {})
    }
}

