import { ApiPath } from 'app/apiConfig';
import { PunchFormActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { IInputError } from 'app/models/types/InputError';
import { convertResponseToError, get, post, put } from 'app/utils';

import { ISendSoknad } from 'app/models/types/SendSoknad';
import { IOMPKSSoknad } from '../../types/OMPKSSoknad';
import { IOMPKSSoknadKvittering } from '../../types/OMPKSSoknadKvittering';
import { IOMPKSSoknadUt } from '../../types/OMPKSSoknadUt';

interface IResetPunchOMPKSFormAction {
    type: PunchFormActionKeys.RESET;
}

interface IGetOMPKSSoknadLoadingAction {
    type: PunchFormActionKeys.SOKNAD_LOAD;
}

interface IGetOMPKSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR;
    error: IError;
}

interface ISetOMPKSSoknadAction {
    type: PunchFormActionKeys.SOKNAD_SET;
    soknad: Partial<IOMPKSSoknad>;
}

interface IResetOMPKSSoknadAction {
    type: PunchFormActionKeys.SOKNAD_RESET;
}

interface IUpdateOMPKSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST;
}

interface IUpdateOMPKSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS;
    errors?: IInputError[];
}

interface IUpdateOMPKSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR;
    error: IError;
}

interface ISubmitOMPKSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST;
}

interface ISubmitOMPKSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS;
    innsentSoknad?: IOMPKSSoknadKvittering;
    linkTilBehandlingIK9: string | null;
}

interface ISubmitOMPKSSoknadConflictAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT;
}

interface ISubmitOMPKSSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE;
    errors: IInputError[];
}

interface ISubmitOMPKSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR;
    error: IError;
}

interface IValiderOMPKSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST;
}

interface IValiderOMPKSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS;
    validertSoknad?: IOMPKSSoknadKvittering;
    erMellomlagring?: boolean;
}

interface IValiderOMPKSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR;
    error: IError;
}

interface IValiderOMPKSSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE;
    errors: IInputError[];
}

interface IValiderOMPKSSoknadResetAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET;
}

interface ISettJournalpostPaaVentAction {
    type: PunchFormActionKeys.JOURNALPOST_SETT_PAA_VENT;
}
interface ISettJournalpostPaaVentSuccessAction {
    type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS;
}
interface ISettJournalpostPaaVentErrorAction {
    type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR;
    error: IError;
}
interface ISettJournalpostPaaVentResetAction {
    type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET;
}

export function setJournalpostPaaVentAction(): ISettJournalpostPaaVentAction {
    return { type: PunchFormActionKeys.JOURNALPOST_SETT_PAA_VENT };
}
export function setJournalpostPaaVentSuccessAction(): ISettJournalpostPaaVentSuccessAction {
    return {
        type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS,
    };
}
export function setJournalpostPaaVentErrorAction(error: IError): ISettJournalpostPaaVentErrorAction {
    return {
        type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR,
        error,
    };
}

export function setJournalpostPaaVentResetAction(): ISettJournalpostPaaVentResetAction {
    return {
        type: PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET,
    };
}

type IOMPKSSoknadActionTypes =
    | IGetOMPKSSoknadLoadingAction
    | IGetOMPKSSoknadErrorAction
    | ISetOMPKSSoknadAction
    | IResetOMPKSSoknadAction;

type IOMPKSSoknadUpdateActionTypes =
    | IUpdateOMPKSSoknadRequestAction
    | IUpdateOMPKSSoknadSuccessAction
    | IUpdateOMPKSSoknadErrorAction;

type IOMPKSSoknadSubmitActionTypes =
    | ISubmitOMPKSSoknadRequestAction
    | ISubmitOMPKSSoknadSuccessAction
    | ISubmitOMPKSSoknadUncompleteAction
    | ISubmitOMPKSSoknadErrorAction
    | ISubmitOMPKSSoknadConflictAction;

type IValiderOMPKSSoknadActionTypes =
    | IValiderOMPKSSoknadRequestAction
    | IValiderOMPKSSoknadSuccessAction
    | IValiderOMPKSSoknadErrorAction
    | IValiderOMPKSSoknadResetAction
    | IValiderOMPKSSoknadUncompleteAction;

type ISettPaaVentActionTypes =
    | ISettJournalpostPaaVentAction
    | ISettJournalpostPaaVentSuccessAction
    | ISettJournalpostPaaVentErrorAction
    | ISettJournalpostPaaVentResetAction;

export type IPunchOMPKSFormActionTypes =
    | IResetPunchOMPKSFormAction
    | IOMPKSSoknadActionTypes
    | IOMPKSSoknadUpdateActionTypes
    | IOMPKSSoknadSubmitActionTypes
    | ISettPaaVentActionTypes
    | IValiderOMPKSSoknadActionTypes;

export const resetPunchOMPKSFormAction = (): IResetPunchOMPKSFormAction => ({
    type: PunchFormActionKeys.RESET,
});

export const getOMPKSSoknadLoadingAction = (): IGetOMPKSSoknadLoadingAction => ({
    type: PunchFormActionKeys.SOKNAD_LOAD,
});
export const getOMPKSSoknadErrorAction = (error: IError): IGetOMPKSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR,
    error,
});
export const setOMPKSSoknadAction = (soknad: Partial<IOMPKSSoknad>): ISetOMPKSSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_SET,
    soknad,
});
export const resetOMPKSSoknadAction = (): IResetOMPKSSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_RESET,
});

export const updateOMPKSSoknadRequestAction = (): IUpdateOMPKSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST,
});
export const updateOMPKSSoknadSuccessAction = (errors?: IInputError[]): IUpdateOMPKSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS,
    errors,
});
export const updateOMPKSSoknadErrorAction = (error: IError): IUpdateOMPKSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR,
    error,
});

export function getOMPKSSoknad(id: string) {
    return (dispatch: any) => {
        dispatch(getOMPKSSoknadLoadingAction());
        return get(ApiPath.OMP_KS_SOKNAD_GET, { id }, undefined, (response, soknad) => {
            if (response.ok || response.status === 400) {
                return dispatch(setOMPKSSoknadAction(soknad));
            }
            return dispatch(getOMPKSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPKSSoknad(soknad: Partial<IOMPKSSoknadUt>) {
    return (dispatch: any) => {
        dispatch(updateOMPKSSoknadRequestAction());
        return put(ApiPath.OMP_KS_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad, (response) => {
            if (response.status === 200) {
                return response.json().then((mappe) => {
                    dispatch(setOMPKSSoknadAction(mappe));
                    dispatch(updateOMPKSSoknadSuccessAction());
                });
            }
            return dispatch(updateOMPKSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPKSSoknader(
    mappeid: string,
    norskSøkerId: string,
    norskPleietrengendeId: string | null,
    journalpostid: string,
    soknad1: Partial<IOMPKSSoknadUt>,
    soknad2: Partial<IOMPKSSoknadUt> | null,
) {
    return (dispatch: any) => {
        if (!norskPleietrengendeId || !soknad2) {
            return dispatch(updateOMPKSSoknad(soknad1));
        }

        dispatch(updateOMPKSSoknadRequestAction());
        const request = {
            personer: {
                [norskSøkerId]: {
                    journalpostId: journalpostid,
                    soeknad: soknad1,
                },
                [norskPleietrengendeId]: {
                    journalpostId: journalpostid,
                    soeknad: soknad2,
                },
            },
        };
        return put(ApiPath.OMP_KS_SOKNAD_UPDATE, { id: mappeid }, request, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setOMPKSSoknadAction(mappe));
                        dispatch(updateOMPKSSoknadSuccessAction());
                    });
                case 400:
                    return response.json().then((mappe) => {
                        dispatch(setOMPKSSoknadAction(mappe));
                        dispatch(updateOMPKSSoknadSuccessAction(mappe.personer?.[norskSøkerId]?.mangler));
                    });
                default:
                    return dispatch(updateOMPKSSoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export const submitOMPKSSoknadRequestAction = (): ISubmitOMPKSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST,
});
export const submitOMPKSSoknadSuccessAction = (
    innsentSoknad: IOMPKSSoknadKvittering,
    linkTilBehandlingIK9: string | null,
): ISubmitOMPKSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS,
    innsentSoknad,
    linkTilBehandlingIK9,
});
export const submitOMPKSSoknadUncompleteAction = (errors: IInputError[]): ISubmitOMPKSSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE,
    errors,
});
export const submitOMPKSSoknadErrorAction = (error: IError): ISubmitOMPKSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR,
    error,
});

export const submitOMPKSSoknadConflictAction = (): ISubmitOMPKSSoknadConflictAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT,
});

export const validerOMPKSSoknadRequestAction = (): IValiderOMPKSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST,
});
export const validerOMPKSSoknadSuccessAction = (
    validertSoknad: IOMPKSSoknadKvittering,
    erMellomlagring?: boolean,
): IValiderOMPKSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS,
    validertSoknad,
    erMellomlagring,
});
export const validerOMPKSSoknadErrorAction = (error: IError): IValiderOMPKSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
    error,
});

export const validerOMPKSSoknadResetAction = (): IValiderOMPKSSoknadResetAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET,
});

export const validerOMPKSSoknadUncompleteAction = (errors: IInputError[]): IValiderOMPKSSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
    errors,
});

export function submitOMPKSSoknad(norskIdent: string, soeknadId: string) {
    return (dispatch: any) => {
        const requestBody: ISendSoknad = {
            norskIdent,
            soeknadId,
        };

        dispatch(submitOMPKSSoknadRequestAction());
        post(
            ApiPath.OMP_KS_SOKNAD_SUBMIT,
            { id: soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            requestBody,
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        return dispatch(submitOMPKSSoknadSuccessAction(responseData, response.headers.get('Location')));
                    case 400:
                        return dispatch(submitOMPKSSoknadUncompleteAction(responseData.feil));
                    case 409:
                        return dispatch(submitOMPKSSoknadConflictAction());
                    default:
                        return dispatch(submitOMPKSSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function validerOMPKSSoknad(soknad: IOMPKSSoknadUt, erMellomlagring?: boolean) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;

    return (dispatch: any) => {
        dispatch(validerOMPKSSoknadRequestAction());
        post(
            ApiPath.OMP_KS_SOKNAD_VALIDER,
            { id: soknad.soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            soknad,
            (response, data) => {
                switch (response.status) {
                    case 202:
                        return dispatch(validerOMPKSSoknadSuccessAction(data, erMellomlagring));
                    case 400:
                        return dispatch(validerOMPKSSoknadUncompleteAction(data.feil));
                    default:
                        return dispatch(validerOMPKSSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function settJournalpostPaaVent(journalpostid: string, soeknadId: string) {
    return (dispatch: any) => {
        dispatch(setJournalpostPaaVentAction());
        return post(
            ApiPath.JOURNALPOST_SETT_PAA_VENT,
            { journalpostId: journalpostid },
            undefined,
            { soeknadId },
            (response) => {
                if (response.ok) {
                    return dispatch(setJournalpostPaaVentSuccessAction());
                }
                return dispatch(setJournalpostPaaVentErrorAction(convertResponseToError(response)));
            },
        );
    };
}
