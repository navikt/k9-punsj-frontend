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
    erSaksbehandler: boolean;
    erVeileder: boolean;
    harBasistilgang: boolean;
    harHistoriskTilgang: boolean;
}
interface IAuthErrorAction {
    type: AuthActionKeys.ERROR;
    error: IError;
}

export type IAuthActionTypes = IAuthLoadAction | IAuthRedirectAction | IAuthOkAction | IAuthErrorAction;

export const checkAuth = () => async (dispatch: any) => {
    try {
        dispatch({ type: AuthActionKeys.LOAD });
        const response = await get(ApiPath.USER, { credentials: 'include' });

        if (response.status === 200) {
            const { name, erSaksbehandler, erVeileder, harBasistilgang, harHistoriskTilgang } = await response.json();
            dispatch({
                type: AuthActionKeys.OK,
                name,
                erSaksbehandler: Boolean(erSaksbehandler),
                erVeileder: Boolean(erVeileder),
                harBasistilgang: Boolean(harBasistilgang),
                harHistoriskTilgang: Boolean(harHistoriskTilgang),
            });
        } else {
            const error = convertResponseToError(response);
            dispatch({ type: AuthActionKeys.ERROR, error });
        }
    } catch (error) {
        dispatch({ type: AuthActionKeys.ERROR, error });
    }
};
