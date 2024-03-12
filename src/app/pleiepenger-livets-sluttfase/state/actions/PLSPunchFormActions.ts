import { ApiPath } from 'app/apiConfig';
import { PunchFormActionKeys } from 'app/models/enums';
import { IError, Periode } from 'app/models/types';
import { IInputError } from 'app/models/types/InputError';
import { convertResponseToError, get, post, put } from 'app/utils';

import { IHentPerioder } from '../../../models/types/RequestBodies';
import { ISendSoknad } from '../../../models/types/SendSoknad';
import { IPLSSoknad } from '../../types/PLSSoknad';
import { IPLSSoknadKvittering } from '../../types/PLSSoknadKvittering';
import { IPLSSoknadUt } from '../../types/PLSSoknadUt';

interface IResetPunchPLSFormAction {
    type: PunchFormActionKeys.RESET;
}

interface IGetPLSSoknadLoadingAction {
    type: PunchFormActionKeys.SOKNAD_LOAD;
}

interface IGetPLSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR;
    error: IError;
}

interface ISetPLSSoknadAction {
    type: PunchFormActionKeys.SOKNAD_SET;
    soknad: Partial<IPLSSoknad>;
}

interface IResetPLSSoknadAction {
    type: PunchFormActionKeys.SOKNAD_RESET;
}

interface IUpdatePLSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST;
}

interface IUpdatePLSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS;
    errors?: IInputError[];
}

interface IUpdatePLSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR;
    error: IError;
}

interface ISubmitPLSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST;
}

interface ISubmitPLSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS;
    innsentSoknad?: IPLSSoknadKvittering;
    linkTilBehandlingIK9: string | null;
}

interface ISubmitPLSSoknadConflictAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT;
}

interface ISubmitPLSSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE;
    errors: IInputError[];
}

interface ISubmitPLSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR;
    error: IError;
}

interface IValiderPLSSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST;
}

interface IValiderPLSSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS;
    validertSoknad?: IPLSSoknadKvittering;
    erMellomlagring?: boolean;
}

interface IValiderPLSSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR;
    error: IError;
}

interface IValiderPLSSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE;
    errors: IInputError[];
}

interface IValiderPLSSoknadResetAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET;
}

interface IHentPLSPerioderLoadingAction {
    type: PunchFormActionKeys.HENT_PERIODER_REQUEST;
}

interface IHentPLSPerioderErrorAction {
    type: PunchFormActionKeys.HENT_PERIODER_ERROR;
    error: IError;
}

interface IHentPLSPerioderSuccessAction {
    type: PunchFormActionKeys.HENT_PERIODER_SUCCESS;
    perioder: Periode[];
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

export const hentPLSPerioderRequestAction = (): IHentPLSPerioderLoadingAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_REQUEST,
});
export const hentPLSPerioderSuccessAction = (perioder: Periode[]): IHentPLSPerioderSuccessAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_SUCCESS,
    perioder,
});
export const hentPLSPerioderErrorAction = (error: IError): IHentPLSPerioderErrorAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_ERROR,
    error,
});

type IPLSSoknadActionTypes =
    | IGetPLSSoknadLoadingAction
    | IGetPLSSoknadErrorAction
    | ISetPLSSoknadAction
    | IResetPLSSoknadAction;

type IPLSSoknadUpdateActionTypes =
    | IUpdatePLSSoknadRequestAction
    | IUpdatePLSSoknadSuccessAction
    | IUpdatePLSSoknadErrorAction;

type IPLSSoknadSubmitActionTypes =
    | ISubmitPLSSoknadRequestAction
    | ISubmitPLSSoknadSuccessAction
    | ISubmitPLSSoknadUncompleteAction
    | ISubmitPLSSoknadErrorAction
    | ISubmitPLSSoknadConflictAction;

type IPerioderActionTypes = IHentPLSPerioderErrorAction | IHentPLSPerioderLoadingAction | IHentPLSPerioderSuccessAction;

type IValiderPLSSoknadActionTypes =
    | IValiderPLSSoknadErrorAction
    | IValiderPLSSoknadRequestAction
    | IValiderPLSSoknadSuccessAction
    | IValiderPLSSoknadUncompleteAction
    | IValiderPLSSoknadResetAction;

type ISettPaaVentActionTypes =
    | ISettJournalpostPaaVentAction
    | ISettJournalpostPaaVentSuccessAction
    | ISettJournalpostPaaVentErrorAction
    | ISettJournalpostPaaVentResetAction;

export type IPunchPLSFormActionTypes =
    | IResetPunchPLSFormAction
    | IPLSSoknadActionTypes
    | IPLSSoknadUpdateActionTypes
    | IPLSSoknadSubmitActionTypes
    | IPerioderActionTypes
    | ISettPaaVentActionTypes
    | IValiderPLSSoknadActionTypes;

export const resetPLSPunchFormAction = (): IResetPunchPLSFormAction => ({
    type: PunchFormActionKeys.RESET,
});

export const getPLSSoknadLoadingAction = (): IGetPLSSoknadLoadingAction => ({
    type: PunchFormActionKeys.SOKNAD_LOAD,
});
export const getPLSSoknadErrorAction = (error: IError): IGetPLSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR,
    error,
});
export const setPLSSoknadAction = (soknad: Partial<IPLSSoknad>): ISetPLSSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_SET,
    soknad,
});
export const resetPLSSoknadAction = (): IResetPLSSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_RESET,
});

export const updatePLSSoknadRequestAction = (): IUpdatePLSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST,
});
export const updatePLSSoknadSuccessAction = (errors?: IInputError[]): IUpdatePLSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS,
    errors,
});
export const updatePLSSoknadErrorAction = (error: IError): IUpdatePLSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR,
    error,
});

export function getPLSSoknad(id: string) {
    return (dispatch: any) => {
        dispatch(getPLSSoknadLoadingAction());
        return get(ApiPath.PLS_SOKNAD_GET, { id }, undefined, (response, soknad) => {
            if (response.ok || response.status === 400) {
                return dispatch(setPLSSoknadAction(soknad));
            }
            return dispatch(getPLSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updatePLSSoknad(soknad: Partial<IPLSSoknadUt>) {
    return (dispatch: any) => {
        dispatch(updatePLSSoknadRequestAction());
        return put(ApiPath.PLS_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad, (response) => {
            if (response.status === 200) {
                return response.json().then((mappe) => {
                    dispatch(setPLSSoknadAction(mappe));
                    dispatch(updatePLSSoknadSuccessAction());
                });
            }
            return dispatch(updatePLSSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updatePLSSoknader(
    mappeid: string,
    norskSøkerId: string,
    norskPleietrengendeId: string | null,
    journalpostid: string,
    soknad1: Partial<IPLSSoknadUt>,
    soknad2: Partial<IPLSSoknadUt> | null,
) {
    return (dispatch: any) => {
        if (!norskPleietrengendeId || !soknad2) {
            return dispatch(updatePLSSoknad(soknad1));
        }

        dispatch(updatePLSSoknadRequestAction());
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
        return put(ApiPath.PLS_SOKNAD_UPDATE, { id: mappeid }, request, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setPLSSoknadAction(mappe));
                        dispatch(updatePLSSoknadSuccessAction());
                    });
                case 400:
                    return response.json().then((mappe) => {
                        dispatch(setPLSSoknadAction(mappe));
                        dispatch(updatePLSSoknadSuccessAction(mappe.personer?.[norskSøkerId]?.mangler));
                    });
                default:
                    return dispatch(updatePLSSoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export const submitPLSSoknadRequestAction = (): ISubmitPLSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST,
});
export const submitPLSSoknadSuccessAction = (
    innsentSoknad: IPLSSoknadKvittering,
    linkTilBehandlingIK9: string | null,
): ISubmitPLSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS,
    innsentSoknad,
    linkTilBehandlingIK9,
});
export const submitPLSSoknadUncompleteAction = (errors: IInputError[]): ISubmitPLSSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE,
    errors,
});
export const submitPLSSoknadErrorAction = (error: IError): ISubmitPLSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR,
    error,
});

export const submitPLSSoknadConflictAction = (): ISubmitPLSSoknadConflictAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT,
});

export const validerPLSSoknadRequestAction = (): IValiderPLSSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST,
});
export const validerPLSSoknadSuccessAction = (
    validertSoknad: IPLSSoknadKvittering,
    erMellomlagring?: boolean,
): IValiderPLSSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS,
    validertSoknad,
    erMellomlagring,
});
export const validerPLSSoknadErrorAction = (error: IError): IValiderPLSSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
    error,
});

export const validerPLSSoknadResetAction = (): IValiderPLSSoknadResetAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET,
});

export const validerPLSSoknadUncompleteAction = (errors: IInputError[]): IValiderPLSSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
    errors,
});

export function submitPLSSoknad(norskIdent: string, soeknadId: string) {
    return (dispatch: any) => {
        const requestBody: ISendSoknad = {
            norskIdent,
            soeknadId,
        };

        dispatch(submitPLSSoknadRequestAction());
        post(
            ApiPath.PLS_SOKNAD_SUBMIT,
            { id: soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            requestBody,
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        return dispatch(submitPLSSoknadSuccessAction(responseData, response.headers.get('Location')));
                    case 400:
                        return dispatch(submitPLSSoknadUncompleteAction(responseData.feil));
                    case 409:
                        return dispatch(submitPLSSoknadConflictAction());
                    default:
                        return dispatch(submitPLSSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function validerPLSSoknad(soknad: IPLSSoknadUt, erMellomlagring?: boolean) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;

    return (dispatch: any) => {
        dispatch(validerPLSSoknadRequestAction());
        post(
            ApiPath.PLS_SOKNAD_VALIDER,
            { id: soknad.soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            soknad,
            (response, data) => {
                switch (response.status) {
                    case 202:
                        return dispatch(validerPLSSoknadSuccessAction(data, erMellomlagring));
                    case 400:
                        return dispatch(validerPLSSoknadUncompleteAction(data.feil));
                    default:
                        return dispatch(validerPLSSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function hentPLSPerioderFraK9Sak(norskIdent: string, barnIdent: string) {
    return (dispatch: any) => {
        const requestBody: IHentPerioder = {
            brukerIdent: norskIdent,
            barnIdent,
        };

        dispatch(hentPLSPerioderRequestAction());
        post(ApiPath.PLS_K9SAK_PERIODER, {}, { 'X-Nav-NorskIdent': norskIdent }, requestBody, (response, perioder) => {
            if (response.ok) {
                return dispatch(hentPLSPerioderSuccessAction(perioder));
            }
            return dispatch(hentPLSPerioderErrorAction(response));
        });
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
