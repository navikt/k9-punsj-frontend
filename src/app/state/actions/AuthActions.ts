import { URL_AUTH_CHECK, URL_AUTH_LOGIN } from 'app/apiConfig';
import { AuthActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { convertResponseToError } from 'app/utils';

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

const loadingAction = (): IAuthLoadAction => ({ type: AuthActionKeys.LOAD });
const redirectAction = (redirectUrl: string): IAuthRedirectAction => ({
    type: AuthActionKeys.REDIRECT,
    redirectUrl,
});
const authOkAction = (name: string): IAuthOkAction => ({
    type: AuthActionKeys.OK,
    name,
});
const authErrorAction = (error: IError): IAuthErrorAction => ({
    type: AuthActionKeys.ERROR,
    error,
});

export function checkAuth() {
    return (dispatch: any) => {
        dispatch(loadingAction());
        fetch(URL_AUTH_CHECK(), { credentials: 'include' }).then((response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((user) => dispatch(authOkAction(user.name)));
                case 401:
                    return dispatch(redirectAction(URL_AUTH_LOGIN()));
                default:
                    return dispatch(authErrorAction(convertResponseToError(response)));
            }
        });
    };
}
