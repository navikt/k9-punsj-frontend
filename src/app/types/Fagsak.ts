import { DokumenttypeForkortelse } from 'app/models/enums';
import { PersonFagsak } from 'app/models/types';

export interface Fosterbarn {
    personId: string;
    norskIdent: string;
    aktørId: string;
}

interface FagsakBase {
    fagsakId: string;
    sakstype: DokumenttypeForkortelse;
    pleietrengendeIdent?: string; // Kun for jp.sak
    pleietrengende?: PersonFagsak; // Kun for saker fra api i select for å vise navn
    gyldigPeriode: { fom: string; tom: string };
    reservertSaksnummer?: boolean;
    relatertPersonIdent?: string; // Kun for jp.sak
    relatertPerson?: PersonFagsak; // Kun for saker fra api i select for å vise navn
    behandlingsår?: string; // For OMS
    reservert?: boolean;
    barnIdenter?: Fosterbarn[]; // For OMS
}

// Brukes kun i Fagsak select for å vise navner
export type FagsakForSelect = Omit<FagsakBase, 'pleietrengendeIdent' | 'relatertPersonIdent'>;

type Fagsak = Omit<FagsakBase, 'pleietrengende' | 'relatertPerson'>;

export default Fagsak;
