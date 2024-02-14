import { DokumenttypeForkortelse } from 'app/models/enums';

interface Fagsak {
    fagsakId: string;
    sakstype: DokumenttypeForkortelse;
    pleietrengendeIdent: string;
    gyldigPeriode: { fom: string; tom: string };
    annenPart?: string;
}

export default Fagsak;
