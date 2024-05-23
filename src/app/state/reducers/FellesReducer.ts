import { ulid } from 'ulid';

import { ApiPath } from '../../apiConfig';
import { IError, IJournalpost } from '../../models/types';
import { IBarn } from '../../models/types/Barn';
import { IJournalpostConflictResponse } from '../../models/types/Journalpost/IJournalpostConflictResponse';
import { IKopierJournalpost } from '../../models/types/RequestBodies';
import { convertResponseToError, get, post } from '../../utils';
import {
    ActiontypesHentBarn,
    IHentBarnErrorAction,
    IHentBarnForbiddenAction,
    IHentBarnRequestAction,
    IHentBarnSuccessAction,
} from './HentBarn';
import { IResetStateAction, RESET_ALL } from '../actions/GlobalActions';

export interface IFellesState {
    dedupKey: string;
    journalpost?: IJournalpost;
    journalposterIAapenSoknad?: string[];
    isJournalpostLoading?: boolean;
    journalpostNotFound?: boolean;
    journalpostForbidden?: boolean;
    journalpostConflict?: boolean;
    journalpostRequestError?: IError;
    journalpostConflictError?: IJournalpostConflictResponse;
    isAwaitingKopierJournalPostResponse?: boolean;
    kopierJournalpostForbidden?: boolean;
    kopierJournalpostError?: boolean;
    kopierJournalpostSuccess?: boolean;
    kopierJournalpostConflict?: boolean;
    isAwaitingHentBarnResponse?: boolean;
    hentBarnForbidden?: boolean;
    hentBarnError?: boolean;
    hentBarnSuccess?: boolean;
    harHentBarnResponse?: boolean;
    barn?: IBarn[];
}

enum Actiontypes {
    RESET_DEDUP_KEY = 'FELLES/RESET_DEDUP_KEY',
    JOURNALPOST_SET = 'FELLES/PUNCH_JOURNALPOST_SET',
    JOURNALPOST_LOAD = 'FELLES/PUNCH_JOURNALPOST_LOAD',
    JOURNALPOST_REQUEST_ERROR = 'FELLES/PUNCH_JOURNALPOST_REQUEST_ERROR',
    JOURNALPOST_NOT_FOUND = 'FELLES/PUNCH_JOURNALPOST_NOT_FOUND',
    JOURNALPOST_FORBIDDEN = 'FELLES/PUNCH_JOURNALPOST_FORBIDDEN',
    JOURNALPOST_CONFLICT = 'FELLES/PUNCH_JOURNALPOST_CONFLICT',
    JOURNALPOST_KOPIERE_FORBIDDEN = 'FELLES/JOURNALPOST_KOPIERE_FORBIDDEN',
    JOURNALPOST_KOPIERE_CONFLICT = 'FELLES/JOURNALPOST_KOPIERE_CONFLICT',
    JOURNALPOST_KOPIERE_SUCCESS = 'FELLES/JOURNALPOST_KOPIERE_SUCCESS',
    JOURNALPOST_KOPIERE_REQUEST = 'FELLES/JOURNALPOST_KOPIERE_REQUEST',
    JOURNALPOST_KOPIERE_ERROR = 'FELLES/JOURNALPOST_KOPIERE_ERROR',
    RESET_BARN = 'FELLES/RESET_BARN',
    RESET_FELLES = 'FELLES/RESET_FELLES',
    SET_JOURNALPOSTER_AAPEN_SOKNAD = 'FELLES/SET_JOURNALPOSTER_AAPEN_SOKNAD',
}

interface IResetDedupKeyAction {
    type: Actiontypes.RESET_DEDUP_KEY;
}

interface ISetJournalpostAction {
    type: Actiontypes.JOURNALPOST_SET;
    journalpost: IJournalpost;
}

interface IGetJournalpostLoadAction {
    type: Actiontypes.JOURNALPOST_LOAD;
}

interface IGetJournalpostErrorAction {
    type: Actiontypes.JOURNALPOST_REQUEST_ERROR;
    error: IError;
}

interface IGetJournalpostNotFoundAction {
    type: Actiontypes.JOURNALPOST_NOT_FOUND;
}

interface IGetJournalpostForbiddenAction {
    type: Actiontypes.JOURNALPOST_FORBIDDEN;
}

interface IGetJournalpostConflictAction {
    type: Actiontypes.JOURNALPOST_CONFLICT;
    response: IJournalpostConflictResponse;
}

interface IJournalpostKopiereForbiddenAction {
    type: Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN;
}

interface IJournalpostKopiereConflictAction {
    type: Actiontypes.JOURNALPOST_KOPIERE_CONFLICT;
}

interface IJournalpostKopiereSuccessAction {
    type: Actiontypes.JOURNALPOST_KOPIERE_SUCCESS;
}

interface IJournalpostKopiereRequestAction {
    type: Actiontypes.JOURNALPOST_KOPIERE_REQUEST;
}

interface IJournalpostKopiereErrorAction {
    type: Actiontypes.JOURNALPOST_KOPIERE_ERROR;
}
interface ISetJournalposterIAapenSoknad {
    type: Actiontypes.SET_JOURNALPOSTER_AAPEN_SOKNAD;
    journalposter: string[];
}

interface IResetBarnAction {
    type: Actiontypes.RESET_BARN;
}

export const resetDedupKey = (): IResetDedupKeyAction => ({
    type: Actiontypes.RESET_DEDUP_KEY,
});

export function setJournalpostAction(journalpost: IJournalpost): ISetJournalpostAction {
    return { type: Actiontypes.JOURNALPOST_SET, journalpost };
}
export function getJournalpostLoadAction(): IGetJournalpostLoadAction {
    return { type: Actiontypes.JOURNALPOST_LOAD };
}

export function getJournalpostErrorAction(error: IError): IGetJournalpostErrorAction {
    return { type: Actiontypes.JOURNALPOST_REQUEST_ERROR, error };
}

export function getJournalpostNotFoundAction(): IGetJournalpostNotFoundAction {
    return { type: Actiontypes.JOURNALPOST_NOT_FOUND };
}

export function getJournalpostForbiddenAction(): IGetJournalpostForbiddenAction {
    return { type: Actiontypes.JOURNALPOST_FORBIDDEN };
}

export function getJournalpostConflictAction(response: IJournalpostConflictResponse): IGetJournalpostConflictAction {
    return { type: Actiontypes.JOURNALPOST_CONFLICT, response };
}

export function resetBarnAction(): IResetBarnAction {
    return { type: Actiontypes.RESET_BARN };
}

export function resetFellesAction() {
    return { type: Actiontypes.RESET_FELLES };
}

export function getJournalpost(journalpostid: string) {
    return (dispatch: any) => {
        dispatch(getJournalpostLoadAction());
        return get(ApiPath.JOURNALPOST_GET, { journalpostId: journalpostid }, undefined, (response, data) => {
            if (response.ok) {
                return dispatch(setJournalpostAction(data));
            }
            switch (response.status) {
                case 403:
                    return dispatch(getJournalpostForbiddenAction());
                case 404:
                    return dispatch(getJournalpostNotFoundAction());
                case 409:
                    return dispatch(getJournalpostConflictAction(data));
                default:
                    return dispatch(
                        getJournalpostErrorAction({ ...convertResponseToError(response), message: data?.message }),
                    );
            }
        });
    };
}

export function getJournalpostKopiereForbiddenAction(): IJournalpostKopiereForbiddenAction {
    return { type: Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN };
}

export function getJournalpostKopiereConflictAction(): IJournalpostKopiereConflictAction {
    return { type: Actiontypes.JOURNALPOST_KOPIERE_CONFLICT };
}

export function getJournalpostKopiereRequestAction(): IJournalpostKopiereRequestAction {
    return { type: Actiontypes.JOURNALPOST_KOPIERE_REQUEST };
}

export function getJournalpostKopiereSuccessAction(): IJournalpostKopiereSuccessAction {
    return { type: Actiontypes.JOURNALPOST_KOPIERE_SUCCESS };
}

export function getJournalpostKopiereErrorAction(): IJournalpostKopiereErrorAction {
    return { type: Actiontypes.JOURNALPOST_KOPIERE_ERROR };
}
export function setJournalposterFraAapenSoknad(journalposter: string[]): ISetJournalposterIAapenSoknad {
    return { type: Actiontypes.SET_JOURNALPOSTER_AAPEN_SOKNAD, journalposter };
}

type IJournalpostActionTypes =
    | ISetJournalpostAction
    | IGetJournalpostLoadAction
    | IGetJournalpostErrorAction
    | IGetJournalpostNotFoundAction
    | IGetJournalpostForbiddenAction
    | IGetJournalpostConflictAction
    | IJournalpostKopiereForbiddenAction
    | IJournalpostKopiereConflictAction
    | IJournalpostKopiereRequestAction
    | IJournalpostKopiereSuccessAction
    | IJournalpostKopiereErrorAction
    | IHentBarnForbiddenAction
    | IHentBarnRequestAction
    | IHentBarnSuccessAction
    | IHentBarnErrorAction
    | IResetBarnAction
    | IResetStateAction
    | ISetJournalposterIAapenSoknad;

export function kopierJournalpost(
    kopierFraIdent: string,
    kopierTilIdent: string,
    barnIdent: string,
    journalPostID: string,
    dedupKey: string,
) {
    return (dispatch: any) => {
        const requestBody: IKopierJournalpost = {
            dedupKey,
            fra: kopierFraIdent,
            til: kopierTilIdent,
            barn: barnIdent,
        };

        dispatch(getJournalpostKopiereRequestAction());
        post(
            ApiPath.JOURNALPOST_KOPIERE,
            { journalpostId: journalPostID },
            { 'X-Nav-NorskIdent': kopierFraIdent },
            requestBody,
            (response) => {
                switch (response.status) {
                    case 202:
                        return dispatch(getJournalpostKopiereSuccessAction());
                    case 403:
                        return dispatch(getJournalpostKopiereForbiddenAction());
                    case 409:
                        return dispatch(getJournalpostKopiereConflictAction());
                    default:
                        return dispatch(getJournalpostKopiereErrorAction());
                }
            },
        );
    };
}

// TODO: Rename funk
export function kopierJournalpostTilSammeSøker(
    søkerId: string,
    pleietrengendeId: string,
    journalpostId: string,
    dedupKey: string,
) {
    return (dispatch: any) => {
        const requestBody: IKopierJournalpost = {
            dedupKey,
            fra: søkerId,
            til: søkerId,
            barn: pleietrengendeId,
        };

        dispatch(getJournalpostKopiereRequestAction());
        post(
            ApiPath.JOURNALPOST_KOPIERE,
            { journalpostId },
            { 'X-Nav-NorskIdent': søkerId },
            requestBody,
            (response) => {
                switch (response.status) {
                    case 202:
                        return dispatch(getJournalpostKopiereSuccessAction());
                    case 403:
                        return dispatch(getJournalpostKopiereForbiddenAction());
                    case 409:
                        return dispatch(getJournalpostKopiereConflictAction());
                    default:
                        return dispatch(getJournalpostKopiereErrorAction());
                }
            },
        );
    };
}

const initialState: IFellesState = {
    dedupKey: ulid(),
    journalpost: undefined,
    journalposterIAapenSoknad: [],
};

export default function FellesReducer(
    state: IFellesState = initialState,
    action: IResetDedupKeyAction | IJournalpostActionTypes,
): IFellesState {
    switch (action.type) {
        case Actiontypes.RESET_DEDUP_KEY:
            return {
                ...state,
                dedupKey: ulid(),
            };

        case Actiontypes.JOURNALPOST_SET:
            return {
                ...state,
                journalpost: action.journalpost,
                isJournalpostLoading: false,
                journalpostRequestError: undefined,
            };

        case Actiontypes.JOURNALPOST_LOAD:
            return {
                ...state,
                journalpost: undefined,
                isJournalpostLoading: true,
                journalpostRequestError: undefined,
            };

        case Actiontypes.JOURNALPOST_REQUEST_ERROR:
            return {
                ...state,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostRequestError: action.error,
            };

        case Actiontypes.JOURNALPOST_NOT_FOUND:
            return {
                ...state,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostNotFound: true,
            };

        case Actiontypes.JOURNALPOST_FORBIDDEN:
            return {
                ...state,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostForbidden: true,
            };

        case Actiontypes.JOURNALPOST_CONFLICT:
            return {
                ...state,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostConflict: true,
                journalpostConflictError: action.response,
            };

        case Actiontypes.JOURNALPOST_KOPIERE_REQUEST:
            return {
                ...state,
                isAwaitingKopierJournalPostResponse: true,
            };

        case Actiontypes.JOURNALPOST_KOPIERE_CONFLICT:
            return {
                ...state,
                isAwaitingKopierJournalPostResponse: false,
                kopierJournalpostConflict: true,
            };

        case Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN:
            return {
                ...state,
                isAwaitingKopierJournalPostResponse: false,
                kopierJournalpostForbidden: true,
            };

        case Actiontypes.JOURNALPOST_KOPIERE_SUCCESS:
            return {
                ...state,
                isAwaitingKopierJournalPostResponse: false,
                kopierJournalpostSuccess: true,
            };

        case Actiontypes.JOURNALPOST_KOPIERE_ERROR:
            return {
                ...state,
                isAwaitingKopierJournalPostResponse: false,
                kopierJournalpostError: true,
            };

        case ActiontypesHentBarn.HENTBARN_REQUEST:
            return {
                ...state,
                isAwaitingHentBarnResponse: true,
            };

        case ActiontypesHentBarn.HENTBARN_FORBIDDEN:
            return {
                ...state,
                isAwaitingHentBarnResponse: false,
                hentBarnSuccess: false,
                hentBarnForbidden: true,
                harHentBarnResponse: true,
            };

        case ActiontypesHentBarn.HENTBARN_SUCCESS:
            return {
                ...state,
                barn: action.barn,
                isAwaitingHentBarnResponse: false,
                hentBarnSuccess: true,
                harHentBarnResponse: true,
            };

        case ActiontypesHentBarn.HENTBARN_ERROR:
            return {
                ...state,
                isAwaitingHentBarnResponse: false,
                hentBarnSuccess: false,
                hentBarnError: true,
                harHentBarnResponse: true,
            };

        case Actiontypes.RESET_BARN:
            return {
                ...state,
                barn: undefined,
                isAwaitingHentBarnResponse: undefined,
                hentBarnSuccess: undefined,
                harHentBarnResponse: undefined,
            };
        case Actiontypes.SET_JOURNALPOSTER_AAPEN_SOKNAD: {
            return {
                ...state,
                journalposterIAapenSoknad: action.journalposter,
            };
        }
        case RESET_ALL:
            return {
                ...initialState,
            };

        default:
            return state;
    }
}
