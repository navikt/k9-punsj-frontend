import { AuthActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';

interface IAuthLoadAction {
    type: AuthActionKeys.LOAD;
}
interface IAuthRedirectAction {
    type: AuthActionKeys.REDIRECT;
    redirectUrl: string;
}
interface IAuthOkAction {
    type: AuthActionKeys.OK;
    name: string;
}
interface IAuthErrorAction {
    type: AuthActionKeys.ERROR;
    error: IError;
}

export type IAuthActionTypes = IAuthLoadAction | IAuthRedirectAction | IAuthOkAction | IAuthErrorAction;
