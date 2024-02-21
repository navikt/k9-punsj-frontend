import { DokumenttypeForkortelse } from 'app/models/enums';

interface Fagsak {
    fagsakId: string;
    k9FagsakYtelseType: DokumenttypeForkortelse;
    pleietrengendeIdent?: string;
    gyldigPeriode: { fom: string; tom: string };
    reservertSaksnummer?: boolean;
    annenPart?: string; // TODO: Kanskje ikke nødvendig
}

export default Fagsak;
