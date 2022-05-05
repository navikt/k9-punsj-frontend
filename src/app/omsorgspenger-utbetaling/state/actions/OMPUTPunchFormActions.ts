import { ApiPath } from 'app/apiConfig';
import { PunchFormActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { IInputError } from 'app/models/types/InputError';
import { convertResponseToError, get, post, put } from 'app/utils';
import { ISendSoknad } from '../../../models/types/SendSoknad';
import { IOMPUTSoknad } from '../../types/OMPUTSoknad';
import { IOMPUTSoknadUt } from '../../types/OMPUTSoknadUt';
import { IOMPUTSoknadKvittering } from '../../types/OMPUTSoknadKvittering';

interface IResetPunchOMPUTFormAction {
    type: PunchFormActionKeys.RESET;
}

interface IGetOMPUTSoknadLoadingAction {
    type: PunchFormActionKeys.SOKNAD_LOAD;
}

interface IGetOMPUTSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR;
    error: IError;
}

interface ISetOMPUTSoknadAction {
    type: PunchFormActionKeys.SOKNAD_SET;
    soknad: Partial<IOMPUTSoknad>;
}

interface IResetOMPUTSoknadAction {
    type: PunchFormActionKeys.SOKNAD_RESET;
}

interface IUpdateOMPUTSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST;
}

interface IUpdateOMPUTSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS;
    errors?: IInputError[];
}

interface IUpdateOMPUTSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR;
    error: IError;
}

interface ISubmitOMPUTSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST;
}

interface ISubmitOMPUTSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS;
    innsentSoknad?: IOMPUTSoknadKvittering;
    linkTilBehandlingIK9: string | null;
}

interface ISubmitOMPUTSoknadConflictAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT;
}

interface ISubmitOMPUTSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE;
    errors: IInputError[];
}

interface ISubmitOMPUTSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR;
    error: IError;
}

interface IValiderOMPUTSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST;
}

interface IValiderOMPUTSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS;
    validertSoknad?: IOMPUTSoknadKvittering;
    erMellomlagring?: boolean;
}

interface IValiderOMPUTSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR;
    error: IError;
}

interface IValiderOMPUTSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE;
    errors: IInputError[];
}

interface IValiderOMPUTSoknadResetAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET;
}

type IOMPUTSoknadActionTypes =
    | IGetOMPUTSoknadLoadingAction
    | IGetOMPUTSoknadErrorAction
    | ISetOMPUTSoknadAction
    | IResetOMPUTSoknadAction;

type IOMPUTSoknadUpdateActionTypes =
    | IUpdateOMPUTSoknadRequestAction
    | IUpdateOMPUTSoknadSuccessAction
    | IUpdateOMPUTSoknadErrorAction;

type IOMPUTSoknadSubmitActionTypes =
    | ISubmitOMPUTSoknadRequestAction
    | ISubmitOMPUTSoknadSuccessAction
    | ISubmitOMPUTSoknadUncompleteAction
    | ISubmitOMPUTSoknadErrorAction
    | ISubmitOMPUTSoknadConflictAction;

type IValiderOMPUTSoknadActionTypes =
    | IValiderOMPUTSoknadRequestAction
    | IValiderOMPUTSoknadSuccessAction
    | IValiderOMPUTSoknadErrorAction
    | IValiderOMPUTSoknadResetAction
    | IValiderOMPUTSoknadUncompleteAction;

export type IPunchOMPUTFormActionTypes =
    | IResetPunchOMPUTFormAction
    | IOMPUTSoknadActionTypes
    | IOMPUTSoknadUpdateActionTypes
    | IOMPUTSoknadSubmitActionTypes
    | IValiderOMPUTSoknadActionTypes;

export const resetPunchOMPUTFormAction = (): IResetPunchOMPUTFormAction => ({
    type: PunchFormActionKeys.RESET,
});

export const getOMPUTSoknadLoadingAction = (): IGetOMPUTSoknadLoadingAction => ({
    type: PunchFormActionKeys.SOKNAD_LOAD,
});
export const getOMPUTSoknadErrorAction = (error: IError): IGetOMPUTSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR,
    error,
});
export const setOMPUTSoknadAction = (soknad: Partial<IOMPUTSoknad>): ISetOMPUTSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_SET,
    soknad,
});
export const resetOMPUTSoknadAction = (): IResetOMPUTSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_RESET,
});

export const updateOMPUTSoknadRequestAction = (): IUpdateOMPUTSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST,
});
export const updateOMPUTSoknadSuccessAction = (errors?: IInputError[]): IUpdateOMPUTSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS,
    errors,
});
export const updateOMPUTSoknadErrorAction = (error: IError): IUpdateOMPUTSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR,
    error,
});

export function getOMPUTSoknad(id: string) {
    return (dispatch: any) => {
        dispatch(getOMPUTSoknadLoadingAction());
        return get(ApiPath.OMP_UT_SOKNAD_GET, { id }, undefined, (response, soknad) => {
            if (response.ok || response.status === 400) {
                return dispatch(setOMPUTSoknadAction(soknad));
            }
            return dispatch(getOMPUTSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPUTSoknad(soknad: Partial<IOMPUTSoknadUt>) {
    return (dispatch: any) => {
        dispatch(updateOMPUTSoknadRequestAction());
        return put(ApiPath.OMP_UT_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad, (response) => {
            if (response.status === 200) {
                return response.json().then((mappe) => {
                    dispatch(setOMPUTSoknadAction(mappe));
                    dispatch(updateOMPUTSoknadSuccessAction());
                });
            }
            return dispatch(updateOMPUTSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPUTSoknader(
    mappeid: string,
    norskIdent1: string,
    norskIdent2: string | null,
    journalpostid: string,
    soknad1: Partial<IOMPUTSoknadUt>,
    soknad2: Partial<IOMPUTSoknadUt> | null
) {
    return (dispatch: any) => {
        if (!norskIdent2 || !soknad2) {
            return dispatch(updateOMPUTSoknad(soknad1));
        }

        dispatch(updateOMPUTSoknadRequestAction());
        const request = {
            personer: {
                [norskIdent1]: {
                    journalpostId: journalpostid,
                    soeknad: soknad1,
                },
                [norskIdent2]: {
                    journalpostId: journalpostid,
                    soeknad: soknad2,
                },
            },
        };
        return put(ApiPath.OMP_UT_SOKNAD_UPDATE, { id: mappeid }, request, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setOMPUTSoknadAction(mappe));
                        dispatch(updateOMPUTSoknadSuccessAction());
                    });
                case 400:
                    return response.json().then((mappe) => {
                        dispatch(setOMPUTSoknadAction(mappe));
                        dispatch(updateOMPUTSoknadSuccessAction(mappe.personer?.[norskIdent1]?.mangler));
                    });
                default:
                    return dispatch(updateOMPUTSoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export const submitOMPUTSoknadRequestAction = (): ISubmitOMPUTSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST,
});
export const submitOMPUTSoknadSuccessAction = (
    innsentSoknad: IOMPUTSoknadKvittering,
    linkTilBehandlingIK9: string | null
): ISubmitOMPUTSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS,
    innsentSoknad,
    linkTilBehandlingIK9,
});
export const submitOMPUTSoknadUncompleteAction = (errors: IInputError[]): ISubmitOMPUTSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE,
    errors,
});
export const submitOMPUTSoknadErrorAction = (error: IError): ISubmitOMPUTSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR,
    error,
});

export const submitOMPUTSoknadConflictAction = (): ISubmitOMPUTSoknadConflictAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT,
});

export const validerOMPUTSoknadRequestAction = (): IValiderOMPUTSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST,
});
export const validerOMPUTSoknadSuccessAction = (
    validertSoknad: IOMPUTSoknadKvittering,
    erMellomlagring?: boolean
): IValiderOMPUTSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS,
    validertSoknad,
    erMellomlagring,
});
export const validerOMPUTSoknadErrorAction = (error: IError): IValiderOMPUTSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
    error,
});

export const validerOMPUTSoknadResetAction = (): IValiderOMPUTSoknadResetAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET,
});

export const validerOMPUTSoknadUncompleteAction = (errors: IInputError[]): IValiderOMPUTSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
    errors,
});

export function submitOMPUTSoknad(norskIdent: string, soeknadId: string) {
    return (dispatch: any) => {
        const requestBody: ISendSoknad = {
            norskIdent,
            soeknadId,
        };

        dispatch(submitOMPUTSoknadRequestAction());
        post(
            ApiPath.OMP_UT_SOKNAD_SUBMIT,
            { id: soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            requestBody,
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        return dispatch(submitOMPUTSoknadSuccessAction(responseData, response.headers.get('Location')));
                    case 400:
                        return dispatch(submitOMPUTSoknadUncompleteAction(responseData.feil));
                    case 409:
                        return dispatch(submitOMPUTSoknadConflictAction());
                    default:
                        return dispatch(submitOMPUTSoknadErrorAction(convertResponseToError(response)));
                }
            }
        );
    };
}

export function validerOMPUTSoknad(soknad: IOMPUTSoknadUt, erMellomlagring?: boolean) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;

    return (dispatch: any) => {
        dispatch(validerOMPUTSoknadRequestAction());
        post(
            ApiPath.OMP_UT_SOKNAD_VALIDER,
            { id: soknad.soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            soknad,
            (response, data) => {
                switch (response.status) {
                    case 202:
                        return dispatch(validerOMPUTSoknadSuccessAction(data, erMellomlagring));
                    case 400:
                        return dispatch(validerOMPUTSoknadUncompleteAction(data.feil));
                    default:
                        return dispatch(validerOMPUTSoknadErrorAction(convertResponseToError(response)));
                }
            }
        );
    };
}
