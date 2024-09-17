import { Periode } from 'app/models/types/Periode';

export interface GodkjentOpplæringsinstitusjon {
    uuid: string;
    navn: string;
    perioder: Periode[];
}
