import {IError} from 'app/models/types/Error';

export interface IAuthState {
    isLoading:      boolean;
    redirectUrl?:   string;
    loggedIn:       boolean;
    error?:         IError;
}