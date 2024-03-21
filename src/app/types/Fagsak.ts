import { DokumenttypeForkortelse } from 'app/models/enums';

interface Fagsak {
    fagsakId: string;
    sakstype: DokumenttypeForkortelse;
    pleietrengendeIdent?: string;
    gyldigPeriode: { fom: string; tom: string };
    reservertSaksnummer?: boolean;
    annenPart?: string; // TODO: Kanskje ikke nødvendig
    behandlingsÅr?: string; // For OMS
    reservert?: boolean;
}

export default Fagsak;
