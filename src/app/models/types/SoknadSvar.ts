
import {Soknad} from 'app/models/types/Soknad';

export interface ISoknadSvar {
    søker: string;
    fagsakKode: string;
    søknader: ISoknadInfo[];
}

export class SoknadSvar implements ISoknadSvar {

    søker: string;
    fagsakKode: string;
    søknader: ISoknadInfo[];

    constructor(svar: ISoknadSvar) {
        this.søker = svar.søker;
        this.fagsakKode = svar.fagsakKode;
        this.søknader = svar.søknader;
    }
}



export interface ISoknadInfo {
   søknadId: string;
   erFraK9: boolean;
   søknad: Soknad
}

