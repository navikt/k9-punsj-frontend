import { ApiPath } from 'app/apiConfig';
import { JaNei, SignaturActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { convertResponseToError, post } from 'app/utils';

import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';

interface ISetSignaturAction {
    type: SignaturActionKeys.SET;
    signert: JaNeiIkkeRelevant | null;
}

interface IUsignertRequestAction {
    type: SignaturActionKeys.USIGNERT_REQUEST;
}
interface IUsignertSuccessAction {
    type: SignaturActionKeys.USIGNERT_SUCCESS;
}
interface IUsignertErrorAction {
    type: SignaturActionKeys.USIGNERT_ERROR;
    error: IError;
}
interface IUsignertResetAction {
    type: SignaturActionKeys.USIGNERT_RESET;
}

type UsignertActionTypes =
    | IUsignertRequestAction
    | IUsignertSuccessAction
    | IUsignertErrorAction
    | IUsignertResetAction;

export type SignaturActionTypes = ISetSignaturAction | UsignertActionTypes;

export const setSignaturAction = (signert: JaNeiIkkeRelevant | null): ISetSignaturAction => ({
    type: SignaturActionKeys.SET,
    signert,
});

const usignertRequestAction = (): IUsignertRequestAction => ({
    type: SignaturActionKeys.USIGNERT_REQUEST,
});
const usignertSuccessAction = (): IUsignertSuccessAction => ({
    type: SignaturActionKeys.USIGNERT_SUCCESS,
});
const usignertErrorAction = (error: IError): IUsignertErrorAction => ({
    type: SignaturActionKeys.USIGNERT_ERROR,
    error,
});
export const usignertResetAction = (): IUsignertResetAction => ({
    type: SignaturActionKeys.USIGNERT_RESET,
});

export const usignert = (journalpostid: string) => (dispatch: any) => {
    dispatch(usignertRequestAction());

    post(
        ApiPath.JOURNALPOST_USIGNERT,
        { journalpostId: journalpostid },
        undefined,
        { ytelse: 'PleiepegerSyktBarn' },
        (response) => {
            if (response.status === 204) {
                return dispatch(usignertSuccessAction());
            }
            return dispatch(usignertErrorAction(convertResponseToError(response)));
        },
    );
};
