export interface IInputError {
    felt?: string;
    feilkode?: any;
    feilmelding?: string;
}

export interface IInputErrorResponse {
    feil: IInputError[];
    søknadIdDto: string;
}
