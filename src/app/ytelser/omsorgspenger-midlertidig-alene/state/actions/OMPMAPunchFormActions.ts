import { ApiPath } from 'app/apiConfig';
import { PunchFormActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { IInputError } from 'app/models/types/InputError';
import { convertResponseToError, get, post, put } from 'app/utils';

import { ISendSoknad } from 'app/models/types/SendSoknad';
import { IOMPMASoknad } from '../../types/OMPMASoknad';
import { IOMPMASoknadKvittering } from '../../types/OMPMASoknadKvittering';
import { IOMPMASoknadUt } from '../../types/OMPMASoknadUt';

interface IResetPunchOMPMAFormAction {
    type: PunchFormActionKeys.RESET;
}

interface IGetOMPMASoknadLoadingAction {
    type: PunchFormActionKeys.SOKNAD_LOAD;
}

interface IGetOMPMASoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR;
    error: IError;
}

interface ISetOMPMASoknadAction {
    type: PunchFormActionKeys.SOKNAD_SET;
    soknad: Partial<IOMPMASoknad>;
}

interface IResetOMPMASoknadAction {
    type: PunchFormActionKeys.SOKNAD_RESET;
}

interface IUpdateOMPMASoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST;
}

interface IUpdateOMPMASoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS;
    errors?: IInputError[];
}

interface IUpdateOMPMASoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR;
    error: IError;
}

interface ISubmitOMPMASoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST;
}

interface ISubmitOMPMASoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS;
    innsentSoknad?: IOMPMASoknadKvittering;
    linkTilBehandlingIK9: string | null;
}

interface ISubmitOMPMASoknadConflictAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT;
}

interface ISubmitOMPMASoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE;
    errors: IInputError[];
}

interface ISubmitOMPMASoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR;
    error: IError;
}

interface IValiderOMPMASoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST;
}

interface IValiderOMPMASoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS;
    validertSoknad?: IOMPMASoknadKvittering;
    erMellomlagring?: boolean;
}

interface IValiderOMPMASoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR;
    error: IError;
}

interface IValiderOMPMASoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE;
    errors: IInputError[];
}

interface IValiderOMPMASoknadResetAction {
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

type IOMPMASoknadActionTypes =
    | IGetOMPMASoknadLoadingAction
    | IGetOMPMASoknadErrorAction
    | ISetOMPMASoknadAction
    | IResetOMPMASoknadAction;

type IOMPMASoknadUpdateActionTypes =
    | IUpdateOMPMASoknadRequestAction
    | IUpdateOMPMASoknadSuccessAction
    | IUpdateOMPMASoknadErrorAction;

type IOMPMASoknadSubmitActionTypes =
    | ISubmitOMPMASoknadRequestAction
    | ISubmitOMPMASoknadSuccessAction
    | ISubmitOMPMASoknadUncompleteAction
    | ISubmitOMPMASoknadErrorAction
    | ISubmitOMPMASoknadConflictAction;

type IValiderOMPMASoknadActionTypes =
    | IValiderOMPMASoknadRequestAction
    | IValiderOMPMASoknadSuccessAction
    | IValiderOMPMASoknadErrorAction
    | IValiderOMPMASoknadResetAction
    | IValiderOMPMASoknadUncompleteAction;

type ISettPaaVentActionTypes =
    | ISettJournalpostPaaVentAction
    | ISettJournalpostPaaVentSuccessAction
    | ISettJournalpostPaaVentErrorAction
    | ISettJournalpostPaaVentResetAction;

export type IPunchOMPMAFormActionTypes =
    | IResetPunchOMPMAFormAction
    | IOMPMASoknadActionTypes
    | IOMPMASoknadUpdateActionTypes
    | IOMPMASoknadSubmitActionTypes
    | ISettPaaVentActionTypes
    | IValiderOMPMASoknadActionTypes;

export const resetPunchOMPMAFormAction = (): IResetPunchOMPMAFormAction => ({
    type: PunchFormActionKeys.RESET,
});

export const getOMPMASoknadLoadingAction = (): IGetOMPMASoknadLoadingAction => ({
    type: PunchFormActionKeys.SOKNAD_LOAD,
});
export const getOMPMASoknadErrorAction = (error: IError): IGetOMPMASoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR,
    error,
});
export const setOMPMASoknadAction = (soknad: Partial<IOMPMASoknad>): ISetOMPMASoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_SET,
    soknad,
});
export const resetOMPMASoknadAction = (): IResetOMPMASoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_RESET,
});

export const updateOMPMASoknadRequestAction = (): IUpdateOMPMASoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST,
});
export const updateOMPMASoknadSuccessAction = (errors?: IInputError[]): IUpdateOMPMASoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS,
    errors,
});
export const updateOMPMASoknadErrorAction = (error: IError): IUpdateOMPMASoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR,
    error,
});

export function getOMPMASoknad(id: string) {
    return (dispatch: any) => {
        dispatch(getOMPMASoknadLoadingAction());
        return get(ApiPath.OMP_MA_SOKNAD_GET, { id }, undefined, (response, soknad) => {
            if (response.ok) {
                return dispatch(setOMPMASoknadAction(soknad));
            }
            return dispatch(getOMPMASoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPMASoknad(soknad: Partial<IOMPMASoknadUt>) {
    return (dispatch: any) => {
        dispatch(updateOMPMASoknadRequestAction());
        return put(ApiPath.OMP_MA_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad, (response) => {
            if (response.status === 200) {
                return response.json().then((mappe) => {
                    dispatch(setOMPMASoknadAction(mappe));
                    dispatch(updateOMPMASoknadSuccessAction());
                });
            }
            return dispatch(updateOMPMASoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateOMPMASoknader(
    mappeid: string,
    norskSøkerId: string,
    norskPleietrengendeId: string | null,
    journalpostid: string,
    soknad1: Partial<IOMPMASoknadUt>,
    soknad2: Partial<IOMPMASoknadUt> | null,
) {
    return (dispatch: any) => {
        if (!norskPleietrengendeId || !soknad2) {
            return dispatch(updateOMPMASoknad(soknad1));
        }

        dispatch(updateOMPMASoknadRequestAction());
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
        return put(ApiPath.OMP_MA_SOKNAD_UPDATE, { id: mappeid }, request, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setOMPMASoknadAction(mappe));
                        dispatch(updateOMPMASoknadSuccessAction());
                    });
                case 400:
                    return response.json().then((mappe) => {
                        dispatch(setOMPMASoknadAction(mappe));
                        dispatch(updateOMPMASoknadSuccessAction(mappe.personer?.[norskSøkerId]?.mangler));
                    });
                default:
                    return dispatch(updateOMPMASoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export const submitOMPMASoknadRequestAction = (): ISubmitOMPMASoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST,
});
export const submitOMPMASoknadSuccessAction = (
    innsentSoknad: IOMPMASoknadKvittering,
    linkTilBehandlingIK9: string | null,
): ISubmitOMPMASoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS,
    innsentSoknad,
    linkTilBehandlingIK9,
});
export const submitOMPMASoknadUncompleteAction = (errors: IInputError[]): ISubmitOMPMASoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE,
    errors,
});
export const submitOMPMASoknadErrorAction = (error: IError): ISubmitOMPMASoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR,
    error,
});

export const submitOMPMASoknadConflictAction = (): ISubmitOMPMASoknadConflictAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT,
});

export const validerOMPMASoknadRequestAction = (): IValiderOMPMASoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST,
});
export const validerOMPMASoknadSuccessAction = (
    validertSoknad: IOMPMASoknadKvittering,
    erMellomlagring?: boolean,
): IValiderOMPMASoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS,
    validertSoknad,
    erMellomlagring,
});
export const validerOMPMASoknadErrorAction = (error: IError): IValiderOMPMASoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
    error,
});

export const validerOMPMASoknadResetAction = (): IValiderOMPMASoknadResetAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET,
});

export const validerOMPMASoknadUncompleteAction = (errors: IInputError[]): IValiderOMPMASoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
    errors,
});

export function submitOMPMASoknad(norskIdent: string, soeknadId: string) {
    return (dispatch: any) => {
        const requestBody: ISendSoknad = {
            norskIdent,
            soeknadId,
        };

        dispatch(submitOMPMASoknadRequestAction());
        post(
            ApiPath.OMP_MA_SOKNAD_SUBMIT,
            { id: soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            requestBody,
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        return dispatch(submitOMPMASoknadSuccessAction(responseData, response.headers.get('Location')));
                    case 400:
                        return dispatch(submitOMPMASoknadUncompleteAction(responseData.feil));
                    case 409:
                        return dispatch(submitOMPMASoknadConflictAction());
                    default:
                        return dispatch(submitOMPMASoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function validerOMPMASoknad(soknad: IOMPMASoknadUt, erMellomlagring?: boolean) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;

    return (dispatch: any) => {
        dispatch(validerOMPMASoknadRequestAction());
        post(
            ApiPath.OMP_MA_SOKNAD_VALIDER,
            { id: soknad.soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            soknad,
            (response, data) => {
                switch (response.status) {
                    case 202:
                        return dispatch(validerOMPMASoknadSuccessAction(data, erMellomlagring));
                    case 400:
                        return dispatch(validerOMPMASoknadUncompleteAction(data.feil));
                    default:
                        return dispatch(validerOMPMASoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
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
