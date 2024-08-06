import { AuthActionKeys } from 'app/models/enums';
import { IAuthState } from 'app/models/types';
import { IAuthActionTypes } from 'app/state/actions';

const initialState: IAuthState = {
    isLoading: false,
    loggedIn: false,
};

 import/prefer-default-export
export function AuthReducer(authState: IAuthState = initialState, action: IAuthActionTypes): IAuthState {
    switch (action.type) {
        case AuthActionKeys.LOAD:
            return {
                isLoading: true,
                loggedIn: false,
                userName: undefined,
            };

        case AuthActionKeys.REDIRECT:
            return {
                loggedIn: false,
                redirectUrl: action.redirectUrl,
                isLoading: false,
                userName: undefined,
            };

        case AuthActionKeys.OK:
            return {
                loggedIn: true,
                redirectUrl: undefined,
                isLoading: false,
                userName: action.name,
            };

        case AuthActionKeys.ERROR:
            return {
                error: action.error,
                isLoading: false,
                loggedIn: false,
                userName: undefined,
            };

        default:
            return authState;
    }
}
