export interface IQueryResponse {
    mangler?: IMangel[];
}

interface IMangel {
    attributt?: string;
    ugyldig_verdi?: any;
    melding?: string;
}