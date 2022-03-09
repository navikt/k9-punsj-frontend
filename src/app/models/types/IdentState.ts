export type Personvalg = {
    navn: string;
    identifikator: string;
    valgt: boolean;
};

export interface IIdentState {
    ident1: string;
    ident2: string | null;
    annenSokerIdent: string | null;
    barn: Personvalg[];
}
