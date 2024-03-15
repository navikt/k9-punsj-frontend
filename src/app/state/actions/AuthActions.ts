import { ApiPath } from 'app/apiConfig';
import { AuthActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { convertResponseToError, get } from 'app/utils';

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
        get(ApiPath.ME, { credentials: 'include' }).then((response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((user) => {
                        const username = user.name;
                        dispatch(authOkAction(username));
                    });
                default:
                    return dispatch(authErrorAction(convertResponseToError(response)));
            }
        });
    };
}
