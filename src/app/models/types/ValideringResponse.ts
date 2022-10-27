export interface ValideringResponse {
    søknadIdDto: string;
    feil: Feil[];
}

export interface Feil {
    felt: string;
    feilkode: string;
    feilmelding: string;
}
