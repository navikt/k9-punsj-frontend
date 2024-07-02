import { DokumenttypeForkortelse } from 'app/models/enums';
import { PersonFagsak } from 'app/models/types';

interface Fagsak {
    fagsakId: string;
    sakstype: DokumenttypeForkortelse;
    pleietrengende?: PersonFagsak;
    gyldigPeriode: { fom: string; tom: string };
    reservertSaksnummer?: boolean;
    relatertPerson?: PersonFagsak;
    behandlingsår?: string; // For OMS
    reservert?: boolean;
}

export default Fagsak;
