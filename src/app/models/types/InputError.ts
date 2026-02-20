// TODO Remove after all forms are migrated to ApiProblemDetail validation mapping.
export interface IInputError {
    felt?: string;
    feilkode?: any;
    feilmelding?: string;
}

export interface IInputErrorResponse {
    feil: IInputError[];
    søknadIdDto: string;
}
