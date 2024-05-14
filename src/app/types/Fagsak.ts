import { DokumenttypeForkortelse } from 'app/models/enums';

interface Fagsak {
    fagsakId: string;
    sakstype: DokumenttypeForkortelse;
    pleietrengendeIdent?: string;
    gyldigPeriode: { fom: string; tom: string };
    reservertSaksnummer?: boolean;
    relatertPersonIdent?: string;
    behandlingsår?: string; // For OMS
    reservert?: boolean;
}

export default Fagsak;
