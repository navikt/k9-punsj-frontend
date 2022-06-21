export type PersonEnkel = {
    norskIdent: string;
    foedselsdato?: string;
};
export interface Person {
    etternavn: string;
    fornavn: string;
    fødselsdato: string;
    identitetsnummer: string;
    mellomnavn: string;
    sammensattNavn: string;
}
