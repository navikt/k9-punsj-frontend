export type Barn = {
    navn: string;
    identifikator: string;
};

export interface IIdentState {
    ident1: string;
    ident2: string | null;
    annenSokerIdent: string | null;
    barn: Barn[];
}
