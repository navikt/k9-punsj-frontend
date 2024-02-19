import { ApiPath } from 'app/apiConfig';
import { PunchFormActionKeys } from 'app/models/enums';
import { IError } from 'app/models/types';
import { IInputError } from 'app/models/types/InputError';
import { convertResponseToError, get, post, put } from 'app/utils';

import { IPSBSoknad } from '../../models/types/PSBSoknad';
import { IPSBSoknadKvittering } from '../../models/types/PSBSoknadKvittering';
import { IPSBSoknadUt } from '../../models/types/PSBSoknadUt';
import { Periode } from '../../models/types/Periode';
import { IHentPerioder } from '../../models/types/RequestBodies';
import { ISendSoknad } from '../../models/types/SendSoknad';
import { IResetStateAction } from './GlobalActions';

interface IResetPunchFormAction {
    type: PunchFormActionKeys.RESET;
}

interface IGetSoknadLoadingAction {
    type: PunchFormActionKeys.SOKNAD_LOAD;
}

interface IGetSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR;
    error: IError;
}

interface ISetSoknadAction {
    type: PunchFormActionKeys.SOKNAD_SET;
    soknad: Partial<IPSBSoknad>;
}

interface IResetSoknadAction {
    type: PunchFormActionKeys.SOKNAD_RESET;
}

interface IUpdateSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST;
}

interface IUpdateSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS;
    errors?: IInputError[];
}

interface IUpdateSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR;
    error: IError;
}

interface ISubmitSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST;
}

interface ISubmitSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS;
    innsentSoknad?: IPSBSoknadKvittering;
    linkTilBehandlingIK9: string | null;
}

interface ISubmitSoknadConflictAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT;
    error: IError;
}

interface ISubmitSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE;
    errors: IInputError[];
}

interface ISubmitSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR;
    error: IError;
}

interface IValiderSoknadRequestAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST;
}

interface IValiderSoknadSuccessAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS;
    validertSoknad?: IPSBSoknadKvittering;
    erMellomlagring?: boolean;
}

interface IValiderSoknadErrorAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR;
    error: IError;
}

interface IValiderSoknadUncompleteAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE;
    errors: IInputError[];
}

interface IValiderSoknadResetAction {
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET;
}

interface IHentPerioderLoadingAction {
    type: PunchFormActionKeys.HENT_PERIODER_REQUEST;
}

interface IHentPerioderErrorAction {
    type: PunchFormActionKeys.HENT_PERIODER_ERROR;
    error: IError;
}

interface IHentPerioderSuccessAction {
    type: PunchFormActionKeys.HENT_PERIODER_SUCCESS;
    perioder: Periode[];
}

export const hentPerioderRequestAction = (): IHentPerioderLoadingAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_REQUEST,
});
export const hentPerioderSuccessAction = (perioder: Periode[]): IHentPerioderSuccessAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_SUCCESS,
    perioder,
});
export const hentPerioderErrorAction = (error: IError): IHentPerioderErrorAction => ({
    type: PunchFormActionKeys.HENT_PERIODER_ERROR,
    error,
});

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

type ISoknadActionTypes = IGetSoknadLoadingAction | IGetSoknadErrorAction | ISetSoknadAction | IResetSoknadAction;
type ISoknadUpdateActionTypes = IUpdateSoknadRequestAction | IUpdateSoknadSuccessAction | IUpdateSoknadErrorAction;
type ISoknadSubmitActionTypes =
    | ISubmitSoknadRequestAction
    | ISubmitSoknadSuccessAction
    | ISubmitSoknadUncompleteAction
    | ISubmitSoknadErrorAction
    | ISubmitSoknadConflictAction;

type IPerioderActionTypes = IHentPerioderErrorAction | IHentPerioderLoadingAction | IHentPerioderSuccessAction;
type ISettPaaVentActionTypes =
    | ISettJournalpostPaaVentAction
    | ISettJournalpostPaaVentSuccessAction
    | ISettJournalpostPaaVentErrorAction
    | ISettJournalpostPaaVentResetAction;
type IValiderSoknadActionTypes =
    | IValiderSoknadErrorAction
    | IValiderSoknadRequestAction
    | IValiderSoknadSuccessAction
    | IValiderSoknadUncompleteAction
    | IValiderSoknadResetAction;

export type IPunchFormActionTypes =
    | IResetPunchFormAction
    | ISoknadActionTypes
    | ISoknadUpdateActionTypes
    | ISoknadSubmitActionTypes
    | IPerioderActionTypes
    | ISettPaaVentActionTypes
    | IValiderSoknadActionTypes
    | IResetStateAction;

export const resetPunchFormAction = (): IResetPunchFormAction => ({
    type: PunchFormActionKeys.RESET,
});

export const getSoknadLoadingAction = (): IGetSoknadLoadingAction => ({
    type: PunchFormActionKeys.SOKNAD_LOAD,
});
export const getSoknadErrorAction = (error: IError): IGetSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR,
    error,
});
export const setSoknadAction = (soknad: Partial<IPSBSoknad>): ISetSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_SET,
    soknad,
});
export const resetSoknadAction = (): IResetSoknadAction => ({
    type: PunchFormActionKeys.SOKNAD_RESET,
});

export const updateSoknadRequestAction = (): IUpdateSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST,
});
export const updateSoknadSuccessAction = (errors?: IInputError[]): IUpdateSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS,
    errors,
});
export const updateSoknadErrorAction = (error: IError): IUpdateSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR,
    error,
});

export function getSoknad(id: string) {
    return (dispatch: any) => {
        dispatch(getSoknadLoadingAction());
        return get(ApiPath.PSB_SOKNAD_GET, { id }, undefined, (response, soknad) => {
            if (response.ok || response.status === 400) {
                return dispatch(setSoknadAction(soknad));
            }
            return dispatch(getSoknadErrorAction(convertResponseToError(response)));
        });
    };
}

export function updateSoknad(soknad: Partial<IPSBSoknadUt>) {
    return (dispatch: any) => {
        dispatch(updateSoknadRequestAction());
        return put(ApiPath.PSB_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setSoknadAction(mappe));
                        dispatch(updateSoknadSuccessAction());
                    });
                default:
                    return dispatch(updateSoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export function updateSoknader(
    mappeid: string,
    norskSøkerId: string,
    norskPleietrengendeId: string | null,
    journalpostid: string,
    soknad1: Partial<IPSBSoknadUt>,
    soknad2: Partial<IPSBSoknadUt> | null,
) {
    return (dispatch: any) => {
        if (!norskPleietrengendeId || !soknad2) {
            return dispatch(updateSoknad(soknad1));
        }

        dispatch(updateSoknadRequestAction());
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
        return put(ApiPath.PSB_SOKNAD_UPDATE, { id: mappeid }, request, (response) => {
            switch (response.status) {
                case 200:
                    return response.json().then((mappe) => {
                        dispatch(setSoknadAction(mappe));
                        dispatch(updateSoknadSuccessAction());
                    });
                case 400:
                    return response.json().then((mappe) => {
                        dispatch(setSoknadAction(mappe));
                        dispatch(updateSoknadSuccessAction(mappe.personer?.[norskSøkerId]?.mangler));
                    });
                default:
                    return dispatch(updateSoknadErrorAction(convertResponseToError(response)));
            }
        });
    };
}

export const submitSoknadRequestAction = (): ISubmitSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST,
});
export const submitSoknadSuccessAction = (
    innsentSoknad: IPSBSoknadKvittering,
    linkTilBehandlingIK9: string | null,
): ISubmitSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS,
    innsentSoknad,
    linkTilBehandlingIK9,
});
export const submitSoknadUncompleteAction = (errors: IInputError[]): ISubmitSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE,
    errors,
});
export const submitSoknadErrorAction = (error: IError): ISubmitSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_ERROR,
    error,
});

export const submitSoknadConflictAction = (error: IError): ISubmitSoknadConflictAction => ({
    type: PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT,
    error,
});

export const validerSoknadRequestAction = (): IValiderSoknadRequestAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST,
});
export const validerSoknadSuccessAction = (
    validertSoknad: IPSBSoknadKvittering,
    erMellomlagring?: boolean,
): IValiderSoknadSuccessAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS,
    validertSoknad,
    erMellomlagring,
});
export const validerSoknadErrorAction = (error: IError): IValiderSoknadErrorAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
    error,
});

export const validerSoknadResetAction = (): IValiderSoknadResetAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_RESET,
});

export const validerSoknadUncompleteAction = (errors: IInputError[]): IValiderSoknadUncompleteAction => ({
    type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
    errors,
});

export function submitSoknad(norskIdent: string, soeknadId: string) {
    return (dispatch: any) => {
        const requestBody: ISendSoknad = {
            norskIdent,
            soeknadId,
        };

        dispatch(submitSoknadRequestAction());
        post(
            ApiPath.PSB_SOKNAD_SUBMIT,
            { id: soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            requestBody,
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        return dispatch(submitSoknadSuccessAction(responseData, response.headers.get('Location')));
                    case 400:
                        return dispatch(submitSoknadUncompleteAction(responseData.feil));
                    case 409:
                        return dispatch(submitSoknadConflictAction(responseData));
                    default:
                        return dispatch(submitSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function validerSoknad(soknad: IPSBSoknadUt, erMellomlagring?: boolean) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;

    return (dispatch: any) => {
        dispatch(validerSoknadRequestAction());
        post(
            ApiPath.PSB_SOKNAD_VALIDER,
            { id: soknad.soeknadId },
            { 'X-Nav-NorskIdent': norskIdent },
            soknad,
            (response, data) => {
                switch (response.status) {
                    case 202:
                        return dispatch(validerSoknadSuccessAction(data, erMellomlagring));
                    case 400:
                        return dispatch(validerSoknadUncompleteAction(data.feil));
                    default:
                        return dispatch(validerSoknadErrorAction(convertResponseToError(response)));
                }
            },
        );
    };
}

export function hentPerioderFraK9Sak(norskIdent: string, barnIdent: string) {
    return (dispatch: any) => {
        const requestBody: IHentPerioder = {
            brukerIdent: norskIdent,
            barnIdent,
        };

        dispatch(hentPerioderRequestAction());
        post(ApiPath.K9SAK_PERIODER, {}, { 'X-Nav-NorskIdent': norskIdent }, requestBody, (response, perioder) => {
            if (response.ok) {
                return dispatch(hentPerioderSuccessAction(perioder));
            }
            return dispatch(hentPerioderErrorAction(response));
        });
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
