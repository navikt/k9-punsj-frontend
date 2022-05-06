export type Personvalg = {
    navn: string;
    identitetsnummer: string;
    låsIdentitetsnummer?: boolean;
};

export interface IIdentState {
    ident1: string;
    ident2: string;
    annenSokerIdent: string | null;
    annenPart: string;
}
