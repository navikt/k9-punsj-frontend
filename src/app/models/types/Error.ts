// TODO Remove after all forms are migrated to ApiProblemDetail.
export interface IError {
    status?: number;
    statusText?: string;
    url?: string;
    message?: string;
    exceptionId?: string;
    feil?: string;
    raw?: any;
}

export interface K9ErrorDetail {
    feilmelding?: string;
    feilkode?: string | null;
    type?: string;
}

export type GetUhaandterteFeil = (kode: string) => (string | undefined)[];
export type GetErrorMessage = (kode: string, indeks?: number) => React.ReactNode | boolean | undefined;
