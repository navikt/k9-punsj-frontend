import {URL_AUTH_CHECK} from 'app/apiConfig';
import {AuthActionKeys} from 'app/models/enums';
import {IError}         from 'app/models/types';
import {loginUrl}       from 'app/utils';

interface IAuthLoadAction       {type: AuthActionKeys.LOAD}
interface IAuthRedirectAction   {type: AuthActionKeys.REDIRECT, redirectUrl: string}
interface IAuthOkAction         {type: AuthActionKeys.OK}
interface IAuthErrorAction      {type: AuthActionKeys.ERROR,    error: IError}

export type IAuthActionTypes = IAuthLoadAction | IAuthRedirectAction | IAuthOkAction | IAuthErrorAction;

const loadingAction     = ():                       IAuthLoadAction     => ({type: AuthActionKeys.LOAD});
const redirectAction    = (redirectUrl: string):    IAuthRedirectAction => ({type: AuthActionKeys.REDIRECT, redirectUrl});
const authOkAction      = ():                       IAuthOkAction       => ({type: AuthActionKeys.OK});
const authErrorAction   = (error: IError):          IAuthErrorAction    => ({type: AuthActionKeys.ERROR,    error});

export function checkAuth() {return (dispatch: any) => {
    dispatch(loadingAction());
    fetch(URL_AUTH_CHECK, {credentials: 'include'}).then(response => {
        switch (response.status) {
            case 200:   return dispatch(authOkAction());
            case 401:   return dispatch(redirectAction(loginUrl()));
            default:    return dispatch(authErrorAction(response));
        }
    });
}}