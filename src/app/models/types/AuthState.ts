import { IError } from 'app/models/types/Error';

export interface ITilganger {
    erSaksbehandler: boolean;
    erVeileder: boolean;
    harBasistilgang: boolean;
    harHistoriskTilgang: boolean;
}

export interface IAuthState {
    isLoading: boolean;
    redirectUrl?: string;
    loggedIn: boolean;
    error?: IError;
    userName?: string;
    tilganger?: ITilganger;
}
