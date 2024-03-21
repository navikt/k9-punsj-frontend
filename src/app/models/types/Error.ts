export interface IError {
    status?: number;
    statusText?: string;
    url?: string;
    message?: string;
    exceptionId?: string;
    feil?: string;
}

export type GetUhaandterteFeil = (kode: string) => (string | undefined)[];
export type GetErrorMessage = (kode: string, indeks?: number) => React.ReactNode | boolean | undefined;
