import { FagsakYtelseType } from 'app/models/types/RequestBodies';

interface Fagsak {
    fagsakId: string;
    sakstype: FagsakYtelseType;
    pleietrengendeIdent: string;
    gyldigPeriode: { fom: string; tom: string };
}

export default Fagsak;
