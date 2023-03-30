import { IOLPSoknadBackend } from 'app/models/types/OLPSoknad';

export interface IOLPSoknadMappe {
    søker: string;
    fagsakTypeKode: string;
    søknader: IOLPSoknadBackend[];
}
