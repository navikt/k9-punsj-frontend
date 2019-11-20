import {URL_AUTH_CHECK, URL_AUTH_LOGIN} from 'app/apiConfig';
import {AuthActionKeys}                 from 'app/models/enums';
import {IError}                         from 'app/models/types';

interface IAuthLoadAction       {type: AuthActionKeys.LOAD}
interface IAuthRedirectAction   {type: AuthActionKeys.REDIRECT, redirectUrl: string}
interface IAuthOkAction         {type: AuthActionKeys.OK}
interface IAuthErrorAction      {type: AuthActionKeys.ERROR,    error: IError}

export type IAuthActionTypes = IAuthLoadAction | IAuthRedirectAction | IAuthOkAction | IAuthErrorAction;

function loadingAction():                       IAuthLoadAction     {return {type: AuthActionKeys.LOAD}}
function redirectAction(redirectUrl: string):   IAuthRedirectAction {return {type: AuthActionKeys.REDIRECT, redirectUrl}}
function authOkAction():                        IAuthOkAction       {return {type: AuthActionKeys.OK}}
function authErrorAction(error: IError):        IAuthErrorAction    {return {type: AuthActionKeys.ERROR,    error}}

export function checkAuth() {return (dispatch: any) => {
    dispatch(loadingAction());
    fetch(URL_AUTH_CHECK, {credentials: 'include'}).then(response => {
        switch (response.status) {
            case 200:   return dispatch(authOkAction());
            case 401:   return dispatch(redirectAction(URL_AUTH_LOGIN));
            default:    return dispatch(authErrorAction(response));
        }
    });
}}