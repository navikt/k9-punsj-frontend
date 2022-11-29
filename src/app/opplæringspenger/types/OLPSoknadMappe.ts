import { IOLPSoknadBackend } from 'app/models/types/søknadTypes/OLPSoknad';

export interface IOLPSoknadMappe {
    søker: string;
    fagsakTypeKode: string;
    søknader: IOLPSoknadBackend[];
}
